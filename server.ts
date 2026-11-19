import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { extractText, getDocumentProxy, getMeta } from 'unpdf';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { MONOGRAPHS_INITIAL_DATA } from './src/data/monographs.ts';
import type { Product, Order, UserProfile, CartItem, ParsedPdfDraft, ProductCategory } from './src/types.ts';
import { computeSalesMetrics, validateCreditCard, calculateCartTotals, generateDigitalLicenseKey } from './src/utils/shop-logic.ts';
import { isValidPdfBuffer, parseExtractedPdfText, sanitizePdfFileName, PRODUCT_CATEGORIES } from './src/utils/pdf-parser.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.resolve(__dirname, 'uploads', 'pdfs');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function resolvePort(): number {
  const portArgIdx = process.argv.indexOf('--port');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    const parsed = Number(process.argv[portArgIdx + 1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  const isProduction = process.env.NODE_ENV === 'production';
  if (process.env.PORT) {
    const parsed = Number(process.env.PORT);
    // In dev containers, NGINX_PORT (e.g. 8080) may be exposed in shell PORT; always keep dev app on 3000 unless explicitly different.
    if (Number.isFinite(parsed) && parsed > 0 && (isProduction || process.env.PORT !== process.env.NGINX_PORT)) {
      return parsed;
    }
  }
  return 3000;
}

const app = express();
const PORT = resolvePort();

app.use(express.json({ limit: '10mb' }));

// Multer configuration for PDF e-book uploads (50MB max)
const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

interface PendingUploadRecord {
  uploadId: string;
  filePath: string;
  parsed: ParsedPdfDraft;
  createdAt: number;
}

const pendingPdfUploads = new Map<string, PendingUploadRecord>();
const productPdfPaths = new Map<string, string>();
const generatedPdfCache = new Map<string, Uint8Array>();

function toPdfSafeAscii(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2022/g, '*')
    .replace(/\u2122/g, '(TM)')
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wrapTextLines(text: string, maxChars: number): string[] {
  const words = toPdfSafeAscii(text).split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!word) continue;
    if ((current + ' ' + word).trim().length > maxChars && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function generateCatalogMonographPdf(product: Product): Promise<Uint8Array> {
  const cached = generatedPdfCache.get(product.id);
  if (cached) return cached;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(toPdfSafeAscii(product.title));
  pdfDoc.setAuthor(toPdfSafeAscii(product.author));
  pdfDoc.setSubject(toPdfSafeAscii(product.subtitle));
  pdfDoc.setCreator('GyneWell Care & Wellness Clinical Press');

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const slate = rgb(0.23, 0.26, 0.29);
  const teal = rgb(0.49, 0.66, 0.64);
  const muted = rgb(0.38, 0.42, 0.44);

  // Page 1: Title, Metadata & Table of Contents
  const coverPage = pdfDoc.addPage([612, 792]);
  let y = 730;

  coverPage.drawText('GYNEWELL CARE & WELLNESS - CLINICAL PDF MONOGRAPH', {
    x: 54,
    y,
    size: 10,
    font: fontBold,
    color: teal
  });
  y -= 36;

  for (const line of wrapTextLines(product.title, 42)) {
    coverPage.drawText(line, { x: 54, y, size: 22, font: fontBold, color: slate });
    y -= 28;
  }

  y -= 4;
  for (const line of wrapTextLines(product.subtitle, 70)) {
    coverPage.drawText(line, { x: 54, y, size: 12, font: fontRegular, color: muted });
    y -= 17;
  }

  y -= 16;
  coverPage.drawText(toPdfSafeAscii(`Author: ${product.author}${product.authorTitle ? ', ' + product.authorTitle : ''}`), {
    x: 54,
    y,
    size: 11,
    font: fontBold,
    color: slate
  });
  y -= 16;
  coverPage.drawText(toPdfSafeAscii(`Category: ${product.category}   |   Edition: ${product.editionVersion}   |   ISBN: ${product.isbn}`), {
    x: 54,
    y,
    size: 9.5,
    font: fontRegular,
    color: muted
  });
  y -= 28;

  coverPage.drawText('CLINICAL SYNOPSIS', { x: 54, y, size: 11, font: fontBold, color: teal });
  y -= 18;
  for (const line of wrapTextLines(product.synopsis, 82)) {
    coverPage.drawText(line, { x: 54, y, size: 10.5, font: fontRegular, color: slate });
    y -= 15;
  }

  y -= 20;
  coverPage.drawText('TABLE OF CONTENTS', { x: 54, y, size: 11, font: fontBold, color: teal });
  y -= 18;
  (product.tableOfContents || []).slice(0, 12).forEach((entry, idx) => {
    coverPage.drawText(toPdfSafeAscii(`${idx + 1}. ${entry}`), {
      x: 62,
      y,
      size: 10.5,
      font: fontRegular,
      color: slate
    });
    y -= 16;
  });

  // Subsequent Pages: Chapters
  for (const chap of product.sampleChapters || []) {
    const page = pdfDoc.addPage([612, 792]);
    let cy = 735;

    page.drawText(toPdfSafeAscii(`CHAPTER ${chap.chapterNumber}`), {
      x: 54,
      y: cy,
      size: 10,
      font: fontBold,
      color: teal
    });
    cy -= 22;

    for (const line of wrapTextLines(chap.title, 50)) {
      page.drawText(line, { x: 54, y: cy, size: 16, font: fontBold, color: slate });
      cy -= 22;
    }

    if (chap.subtitle) {
      for (const line of wrapTextLines(chap.subtitle, 78)) {
        page.drawText(line, { x: 54, y: cy, size: 10, font: fontRegular, color: muted });
        cy -= 15;
      }
    }

    cy -= 14;
    for (const para of chap.content || []) {
      for (const line of wrapTextLines(para, 82)) {
        if (cy < 70) break;
        page.drawText(line, { x: 54, y: cy, size: 10.5, font: fontRegular, color: slate });
        cy -= 15;
      }
      cy -= 10;
    }
  }

  const bytes = await pdfDoc.save();
  generatedPdfCache.set(product.id, bytes);
  return bytes;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'gynewell-clinical-publishing', format: 'PDF-only', timestamp: new Date().toISOString() });
});

// In-Memory Database State for Real-Time Synchronization
let products: Product[] = [...MONOGRAPHS_INITIAL_DATA];

let users: UserProfile[] = [
  {
    id: 'user-admin',
    email: 'admin@gynewell.clinic',
    name: 'Dr. Oluremi Ilupeju (Master Account)',
    role: 'admin',
    avatar: '/assets/aistudio/Dr_Oluremi_Ilupeju_d7f8ed13.webp',
    provider: 'email',
    purchasedProductIds: ['postpartum-healing', 'perinatal-neurobiology', 'endocrine-arc', 'pelvic-biomechanics'],
    readingProgress: {
      'postpartum-healing': { chapterId: 'chap-2', progressPercent: 68, lastReadAt: new Date().toISOString() }
    },
    bookmarks: ['chap-1', 'chap-2'],
    notes: [
      {
        id: 'note-1',
        productId: 'postpartum-healing',
        chapterId: 'chap-1',
        text: 'Key reference for upcoming Grand Rounds on postpartum thyroiditis screening.',
        quote: 'Serum progesterone falls from ~150 ng/mL at term to <1 ng/mL by day 7 postpartum.',
        createdAt: new Date().toISOString()
      }
    ],
    wishlist: ['pediatric-transitions'],
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-customer',
    email: 'claire.watson@gmail.com',
    name: 'Dr. Claire Watson, MD',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=260',
    provider: 'google',
    purchasedProductIds: ['postpartum-healing'],
    readingProgress: {
      'postpartum-healing': { chapterId: 'chap-1', progressPercent: 45, lastReadAt: new Date().toISOString() }
    },
    bookmarks: ['chap-1'],
    notes: [
      {
        id: 'note-2',
        productId: 'postpartum-healing',
        chapterId: 'chap-1',
        text: 'Review progesterone withdrawal timeline with clinical patients at 2-week visit.',
        createdAt: new Date().toISOString()
      }
    ],
    wishlist: ['endocrine-arc', 'pelvic-biomechanics'],
    createdAt: '2026-02-14T00:00:00Z'
  }
];

let orders: Order[] = [
  {
    id: 'ord-8921',
    orderNumber: 'GW-8921',
    customerEmail: 'claire.watson@gmail.com',
    customerName: 'Dr. Claire Watson, MD',
    items: [
      {
        productId: 'postpartum-healing',
        title: 'The Restorative Postpartum',
        format: 'PDF',
        price: 28.00,
        quantity: 1
      }
    ],
    subtotal: 28.00,
    discount: 0,
    shipping: 0,
    tax: 1.40,
    total: 29.40,
    paymentMethod: 'google_pay',
    status: 'Completed',
    licenseKeys: { 'postpartum-healing': 'GW-LIC-POST-8921-A94K2' },
    downloadTokens: { 'postpartum-healing': 'dl_tok_8921_post' },
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'ord-8920',
    orderNumber: 'GW-8920',
    customerEmail: 'm.lindsey@maternalclinic.org',
    customerName: 'Dr. Michelle Lindsey',
    items: [
      {
        productId: 'perinatal-neurobiology',
        title: 'Perinatal Neurobiology & Matrescence',
        format: 'PDF',
        price: 32.00,
        quantity: 1
      },
      {
        productId: 'endocrine-arc',
        title: 'The Endocrine Arc',
        format: 'PDF',
        price: 26.00,
        quantity: 1
      }
    ],
    subtotal: 58.00,
    discount: 5.80,
    promoCode: 'CLINICAL10',
    shipping: 0,
    tax: 2.61,
    total: 54.81,
    paymentMethod: 'card',
    status: 'Completed',
    licenseKeys: {
      'perinatal-neurobiology': 'GW-LIC-PERI-8920-F71Z0',
      'endocrine-arc': 'GW-LIC-ENDO-8920-M32P1'
    },
    downloadTokens: {
      'perinatal-neurobiology': 'dl_tok_8920_peri',
      'endocrine-arc': 'dl_tok_8920_endo'
    },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'ord-8919',
    orderNumber: 'GW-8919',
    customerEmail: 'sarah.k@birthcenter.com',
    customerName: 'Sarah Kowalski, CNM',
    items: [
      {
        productId: 'pelvic-biomechanics',
        title: 'Biomechanical Pelvic Floor Restoration',
        format: 'PDF',
        price: 29.00,
        quantity: 1
      }
    ],
    subtotal: 29.00,
    discount: 0,
    shipping: 0,
    tax: 1.45,
    total: 30.45,
    paymentMethod: 'hsa_fsa',
    status: 'Completed',
    licenseKeys: { 'pelvic-biomechanics': 'GW-LIC-PELV-8919-T88L4' },
    downloadTokens: { 'pelvic-biomechanics': 'dl_tok_8919_pelv' },
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

// ---------------------- API ROUTES ----------------------

// 1. Products API (PDF-only catalog)
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search } = req.query;
  let result = [...products];

  if (category && typeof category === 'string' && category !== 'All') {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q) ||
      p.synopsis.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: result.length, products: result });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }
  res.json({ success: true, product });
});

// Stream real PDF binary (uploaded file if uploaded by admin, or dynamically generated PDF for catalog titles)
app.get('/api/products/:id/pdf', async (req: Request, res: Response) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: 'PDF monograph not found' });
    return;
  }

  const safeName = sanitizePdfFileName(product.pdfFileName || `${product.id}.pdf`);
  const disposition = req.query.inline === '1' ? 'inline' : 'attachment';

  const uploadedPath = productPdfPaths.get(product.id);
  if (uploadedPath && fs.existsSync(uploadedPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="${safeName}"`);
    fs.createReadStream(uploadedPath).pipe(res);
    return;
  }

  try {
    const pdfBytes = await generateCatalogMonographPdf(product);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="${safeName}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Error generating catalog PDF:', err);
    res.status(500).json({ success: false, error: 'Unable to prepare PDF file for download' });
  }
});

// 2. Authentication APIs
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required' });
    return;
  }

  // Master Admin direct check
  if (email.toLowerCase() === 'admin@gynewell.clinic' || email.toLowerCase() === 'admin@serene.clinic') {
    const adminUser = users.find(u => u.role === 'admin')!;
    res.json({ success: true, user: adminUser, token: 'mock-jwt-admin-token' });
    return;
  }

  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      name: email.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase()),
      role: 'customer',
      provider: 'email',
      purchasedProductIds: [],
      readingProgress: {},
      bookmarks: [],
      notes: [],
      wishlist: [],
      createdAt: new Date().toISOString()
    };
    users.push(user);
  }

  res.json({ success: true, user, token: `mock-jwt-${user.id}` });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email || !name) {
    res.status(400).json({ success: false, error: 'Email and full name are required' });
    return;
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.json({ success: true, user: existing, message: 'Existing account loaded' });
    return;
  }

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    name,
    role: 'customer',
    provider: 'email',
    purchasedProductIds: [],
    readingProgress: {},
    bookmarks: [],
    notes: [],
    wishlist: [],
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  res.json({ success: true, user: newUser, token: `mock-jwt-${newUser.id}` });
});

app.post('/api/auth/social', (req: Request, res: Response) => {
  const { provider, email, name, avatar } = req.body;
  const targetEmail = (email || `practitioner-${provider}@gynewell.community`).toLowerCase();

  let user = users.find(u => u.email === targetEmail);
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      email: targetEmail,
      name: name || `Clinical Practitioner (${String(provider || 'google').toUpperCase()})`,
      role: 'customer',
      avatar: avatar || (provider === 'google' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=260' : undefined),
      provider: provider || 'google',
      purchasedProductIds: ['postpartum-healing'],
      readingProgress: {
        'postpartum-healing': { chapterId: 'chap-1', progressPercent: 20, lastReadAt: new Date().toISOString() }
      },
      bookmarks: [],
      notes: [],
      wishlist: [],
      createdAt: new Date().toISOString()
    };
    users.push(user);
  }

  res.json({ success: true, user, token: `mock-jwt-${user.id}` });
});

// 3. Real-Time User Data Sync API
app.post('/api/sync', (req: Request, res: Response) => {
  const { userId, readingProgress, bookmarks, notes, wishlist } = req.body;
  const user = users.find(u => u.id === userId);

  if (!user) {
    res.status(404).json({ success: false, error: 'User not found for sync' });
    return;
  }

  if (readingProgress) user.readingProgress = { ...user.readingProgress, ...readingProgress };
  if (bookmarks) user.bookmarks = bookmarks;
  if (notes) user.notes = notes;
  if (wishlist) user.wishlist = wishlist;

  res.json({
    success: true,
    syncedAt: new Date().toISOString(),
    user
  });
});

app.get('/api/sync/:userId', (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.params.userId);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  res.json({ success: true, user, syncedAt: new Date().toISOString() });
});

// 4. Secure Checkout & Payment Processing API
app.post('/api/checkout/process', (req: Request, res: Response) => {
  const { userId, customerEmail, customerName, items, promoCode, paymentMethod, cardDetails } = req.body;

  if (!items || !items.length) {
    res.status(400).json({ success: false, error: 'Cart is empty' });
    return;
  }

  if ((paymentMethod === 'card' || paymentMethod === 'hsa_fsa') && cardDetails) {
    const cardCheck = validateCreditCard(cardDetails.number, cardDetails.expiry, cardDetails.cvv);
    if (!cardCheck.valid) {
      res.status(400).json({ success: false, error: 'Card validation failed', errors: cardCheck.errors });
      return;
    }
  }

  const totals = calculateCartTotals(items, promoCode);

  const orderNum = `GW-${Math.floor(1000 + Math.random() * 9000)}`;
  const licenseKeys: Record<string, string> = {};
  const downloadTokens: Record<string, string> = {};

  items.forEach((item: CartItem) => {
    licenseKeys[item.productId] = generateDigitalLicenseKey(orderNum, item.productId);
    downloadTokens[item.productId] = `dl_token_${Math.random().toString(36).substring(2, 10)}`;

    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      prod.licensesIssued = (prod.licensesIssued || 0) + item.quantity;
      prod.activeReadersCount = (prod.activeReadersCount || 0) + 1;
    }
  });

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: orderNum,
    customerEmail: customerEmail || 'guest@gynewell.clinic',
    customerName: customerName || 'Valued Clinical Member',
    items: items.map((i: CartItem) => ({
      productId: i.productId,
      title: i.title,
      format: 'PDF' as const,
      price: i.price,
      quantity: i.quantity
    })),
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: 0,
    tax: totals.tax,
    total: totals.total,
    promoCode: promoCode || undefined,
    paymentMethod: paymentMethod || 'card',
    status: 'Completed',
    licenseKeys,
    downloadTokens,
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);

  if (userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newProductIds = items.map((i: CartItem) => i.productId);
      user.purchasedProductIds = Array.from(new Set([...user.purchasedProductIds, ...newProductIds]));
    }
  }

  res.json({
    success: true,
    order: newOrder,
    message: 'Payment authorized: PDF license issued & download unlocked immediately',
    receiptId: `REC-${Date.now().toString(36).toUpperCase()}`
  });
});

// 5. Orders API
app.get('/api/orders', (req: Request, res: Response) => {
  const { email } = req.query;
  let result = [...orders];

  if (email && typeof email === 'string') {
    result = result.filter(o => o.customerEmail.toLowerCase() === email.toLowerCase());
  }

  res.json({ success: true, count: result.length, orders: result });
});

app.put('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }
  order.status = status;
  res.json({ success: true, order });
});

// 6. Admin Panel APIs (Metrics, Catalog Edit, PDF Upload -> Parse -> Publish)
app.get('/api/admin/metrics', (_req: Request, res: Response) => {
  const metrics = computeSalesMetrics(orders, products);
  res.json({ success: true, metrics, liveTimestamp: new Date().toISOString() });
});

app.put('/api/admin/inventory/:id', (req: Request, res: Response) => {
  const { price, isFeatured, editionVersion, cmeCredits, licensesIssued, title, category } = req.body;
  const prod = products.find(p => p.id === req.params.id);
  if (!prod) {
    res.status(404).json({ success: false, error: 'PDF monograph not found' });
    return;
  }

  if (typeof price === 'number' && price >= 0) prod.price = price;
  if (typeof isFeatured === 'boolean') prod.isFeatured = isFeatured;
  if (typeof editionVersion === 'string' && editionVersion.trim()) prod.editionVersion = editionVersion.trim();
  if (typeof cmeCredits === 'number' && cmeCredits >= 0) prod.cmeCredits = cmeCredits;
  if (typeof licensesIssued === 'number' && licensesIssued >= 0) prod.licensesIssued = licensesIssued;
  if (typeof title === 'string' && title.trim()) prod.title = title.trim();
  if (typeof category === 'string' && PRODUCT_CATEGORIES.includes(category as ProductCategory)) {
    prod.category = category as ProductCategory;
  }

  res.json({ success: true, product: prod, message: 'PDF e-book catalog updated in real time' });
});

// Step 1 & 2 of Admin Workflow: Upload a real PDF, validate %PDF- signature, and parse content/metadata
app.post('/api/admin/ebooks/parse', (req: Request, res: Response) => {
  pdfUpload.single('file')(req, res, async (uploadErr: unknown) => {
    if (uploadErr) {
      const msg = uploadErr instanceof Error ? uploadErr.message : 'PDF upload error';
      res.status(400).json({ success: false, error: msg });
      return;
    }

    const file = req.file;
    if (!file || !file.buffer || file.buffer.length === 0) {
      res.status(400).json({ success: false, error: 'Please select a PDF file (.pdf) to upload.' });
      return;
    }

    const hasPdfExtension = file.originalname.toLowerCase().endsWith('.pdf');
    const hasAllowedMime =
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/x-pdf' ||
      file.mimetype === 'application/octet-stream';

    if (!hasPdfExtension || !hasAllowedMime || !isValidPdfBuffer(file.buffer)) {
      res.status(400).json({
        success: false,
        error: 'Only valid PDF files (.pdf) are supported. Non-PDF documents cannot be uploaded or parsed.'
      });
      return;
    }

    try {
      const proxy = await getDocumentProxy(new Uint8Array(file.buffer));
      const metaResult = await getMeta(proxy).catch(() => ({ info: {} as Record<string, unknown> }));
      const textResult = await extractText(proxy, { mergePages: false });

      const pages = Array.isArray(textResult.text)
        ? textResult.text.map(p => String(p || ''))
        : [String(textResult.text || '')];

      const info = (metaResult?.info || {}) as Record<string, unknown>;
      const parsedCore = parseExtractedPdfText({
        pages,
        fileName: file.originalname,
        fileSizeBytes: file.size,
        metadata: {
          title: typeof info.Title === 'string' ? info.Title : undefined,
          author: typeof info.Author === 'string' ? info.Author : undefined,
          subject: typeof info.Subject === 'string' ? info.Subject : undefined
        }
      });

      const uploadId = `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const storedPath = path.join(UPLOADS_DIR, `${uploadId}.pdf`);
      fs.writeFileSync(storedPath, file.buffer);

      const draft: ParsedPdfDraft = {
        uploadId,
        ...parsedCore
      };

      pendingPdfUploads.set(uploadId, {
        uploadId,
        filePath: storedPath,
        parsed: draft,
        createdAt: Date.now()
      });

      res.json({
        success: true,
        uploadId,
        parsed: draft,
        message: `Parsed ${draft.pages} PDF page(s) and extracted ${draft.sampleChapters.length} chapter section(s).`
      });
    } catch (err) {
      console.error('PDF parsing error:', err);
      res.status(400).json({
        success: false,
        error: 'The uploaded PDF could not be parsed. Please ensure the file is not corrupted or password-encrypted.'
      });
    }
  });
});

// Step 3 of Admin Workflow: Post parsed & reviewed PDF e-book directly to customer storefront
app.post('/api/admin/ebooks/publish', (req: Request, res: Response) => {
  const {
    uploadId,
    title,
    subtitle,
    author,
    category,
    price,
    editionVersion,
    isbn,
    cmeCredits,
    synopsis,
    coverImage,
    tableOfContents,
    sampleChapters
  } = req.body;

  if (!uploadId || typeof uploadId !== 'string') {
    res.status(400).json({ success: false, error: 'A parsed PDF upload is required before posting an e-book.' });
    return;
  }

  const pending = pendingPdfUploads.get(uploadId);
  if (!pending || !fs.existsSync(pending.filePath)) {
    res.status(404).json({ success: false, error: 'Uploaded PDF session expired or not found. Please re-upload the PDF.' });
    return;
  }

  const cleanTitle = typeof title === 'string' && title.trim() ? title.trim() : pending.parsed.title;
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    res.status(400).json({ success: false, error: 'Please specify a valid PDF e-book price greater than $0.00.' });
    return;
  }

  const resolvedCategory: ProductCategory =
    typeof category === 'string' && PRODUCT_CATEGORIES.includes(category as ProductCategory)
      ? (category as ProductCategory)
      : pending.parsed.category;

  const productId = `mono-${Date.now()}`;
  const finalFilePath = path.join(UPLOADS_DIR, `${productId}.pdf`);
  fs.renameSync(pending.filePath, finalFilePath);
  productPdfPaths.set(productId, finalFilePath);
  pendingPdfUploads.delete(uploadId);

  const newProduct: Product = {
    id: productId,
    title: cleanTitle,
    subtitle: (typeof subtitle === 'string' && subtitle.trim()) || pending.parsed.subtitle,
    author: (typeof author === 'string' && author.trim()) || pending.parsed.author,
    authorTitle: 'MD, FACOG',
    authorCredentials: 'GyneWell Care & Wellness Clinical Press',
    authorAvatar: '/assets/aistudio/Dr_Oluremi_Ilupeju_d7f8ed13.webp',
    coverImage:
      (typeof coverImage === 'string' && coverImage.trim()) ||
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
    price: Number(numericPrice.toFixed(2)),
    format: 'PDF',
    pdfFileName: pending.parsed.fileName,
    pdfUrl: `/api/products/${productId}/pdf`,
    category: resolvedCategory,
    rating: 5.0,
    reviewCount: 1,
    pages: pending.parsed.pages,
    wordCount: pending.parsed.wordCount,
    publishYear: new Date().getFullYear(),
    edition: '1st PDF Edition',
    editionVersion: (typeof editionVersion === 'string' && editionVersion.trim()) || pending.parsed.editionVersion,
    isbn: (typeof isbn === 'string' && isbn.trim()) || pending.parsed.isbn,
    fileSizeMb: pending.parsed.fileSizeMb,
    cmeCredits: Number.isFinite(Number(cmeCredits)) ? Number(cmeCredits) : pending.parsed.cmeCredits,
    peerReviewQuote: 'Parsed, verified, and published directly from the GyneWell Medical Director editorial desk.',
    peerReviewSource: 'GyneWell Clinical Review Board',
    licensesIssued: 0,
    activeReadersCount: 1,
    instantAccess: true,
    sourceType: 'uploaded',
    uploadedAt: new Date().toISOString(),
    synopsis: (typeof synopsis === 'string' && synopsis.trim()) || pending.parsed.synopsis,
    tableOfContents:
      Array.isArray(tableOfContents) && tableOfContents.length > 0
        ? tableOfContents
        : pending.parsed.tableOfContents,
    sampleChapters:
      Array.isArray(sampleChapters) && sampleChapters.length > 0
        ? sampleChapters
        : pending.parsed.sampleChapters
  };

  // Prepend so newly posted PDF appears immediately at the top of storefront and admin table
  products.unshift(newProduct);

  res.status(201).json({
    success: true,
    product: newProduct,
    message: `"${newProduct.title}" (PDF) is now live on the GyneWell storefront.`
  });
});

// Vite Dev Server Integration
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  let viteServer: { close: () => Promise<void> } | null = null;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const disableHmr = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: !disableHmr,
        ws: disableHmr ? false : undefined,
        watch: disableHmr ? null : {},
      },
      appType: 'spa',
    });
    viteServer = vite;
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const httpServer = app.listen(PORT, '0.0.0.0', () => {
    console.log(`GyneWell Care & Wellness Server running at http://0.0.0.0:${PORT}`);
  });

  httpServer.on('error', (err) => {
    console.error('Failed to bind server port:', err);
    process.exit(1);
  });

  const shutdown = async () => {
    httpServer.close();
    if (viteServer) {
      await viteServer.close().catch(() => {});
    }
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
