import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { MONOGRAPHS_INITIAL_DATA } from './src/data/monographs.ts';
import { Product, Order, UserProfile, CartItem, UserNote } from './src/types.ts';
import { computeSalesMetrics, validateCreditCard, validateDiscountCode, calculateCartTotals } from './src/utils/shop-logic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

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
    purchasedProductIds: ['postpartum-healing', 'perinatal-neurobiology', 'endocrine-arc', 'biomechanical-pelvic-health'],
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
    wishlist: ['endocrine-arc', 'biomechanical-pelvic-health'],
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
        format: 'Hardcover',
        price: 48.00,
        quantity: 1
      }
    ],
    subtotal: 48.00,
    discount: 0,
    shipping: 7.50,
    tax: 2.40,
    total: 57.90,
    paymentMethod: 'google_pay',
    status: 'Completed',
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
        format: 'EPUB',
        price: 32.00,
        quantity: 1
      },
      {
        productId: 'endocrine-arc',
        title: 'The Endocrine Arc',
        format: 'EPUB',
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
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'ord-8919',
    orderNumber: 'SER-8919',
    customerEmail: 'sarah.k@birthcenter.com',
    customerName: 'Sarah Kowalski, CNM',
    items: [
      {
        productId: 'biomechanical-pelvic-health',
        title: 'Biomechanical Pelvic Floor Restoration',
        format: 'Hardcover',
        price: 49.00,
        quantity: 2
      }
    ],
    subtotal: 98.00,
    discount: 0,
    shipping: 0,
    tax: 4.90,
    total: 102.90,
    paymentMethod: 'hsa_fsa',
    status: 'Completed',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

// Helper: current user session simulator
function findUserById(id: string): UserProfile | undefined {
  return users.find(u => u.id === id);
}

// ---------------------- API ROUTES ----------------------

// 1. Products API
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, format } = req.query;
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

  if (format && typeof format === 'string') {
    result = result.filter(p => p.formats.includes(format as any));
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

// 2. Authentication APIs
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ success: false, error: 'Email is required' });
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
    // Auto register customer if logging in for quick demo onboarding
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
  const { email, name, password } = req.body;
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

// Social Login endpoint (Google, Apple, Twitter/X)
app.post('/api/auth/social', (req: Request, res: Response) => {
  const { provider, email, name, avatar } = req.body;
  const targetEmail = (email || `practitioner-${provider}@serene.community`).toLowerCase();

  let user = users.find(u => u.email === targetEmail);
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      email: targetEmail,
      name: name || `Clinical Practitioner (${provider.toUpperCase()})`,
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
  const { userId, readingProgress, bookmarks, notes, wishlist, cart } = req.body;
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

  // If card payment, run card validation check
  if (paymentMethod === 'card' && cardDetails) {
    const cardCheck = validateCreditCard(cardDetails.number, cardDetails.expiry, cardDetails.cvv);
    if (!cardCheck.valid) {
      res.status(400).json({ success: false, error: 'Card validation failed', errors: cardCheck.errors });
      return;
    }
  }

  // Calculate totals
  const totals = calculateCartTotals(items, promoCode);

  // Check inventory stock
  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    if (prod && (item.format === 'Hardcover' || item.format === 'Paperback')) {
      if (prod.stock < item.quantity) {
        res.status(400).json({
          success: false,
          error: `Insufficient physical stock for "${prod.title}". Only ${prod.stock} units remaining.`
        });
        return;
      }
    }
  }

  // Decrement physical stock
  items.forEach((item: CartItem) => {
    const prod = products.find(p => p.id === item.productId);
    if (prod && (item.format === 'Hardcover' || item.format === 'Paperback')) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  });

  // Create Order
  const orderNum = `GW-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: orderNum,
    customerEmail: customerEmail || 'guest@gynewell.clinic',
    customerName: customerName || 'Valued Clinical Member',
    items: items.map((i: CartItem) => ({
      productId: i.productId,
      title: i.title,
      format: i.format,
      price: i.price,
      quantity: i.quantity
    })),
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    promoCode: promoCode || undefined,
    paymentMethod: paymentMethod || 'card',
    status: 'Completed',
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);

  // Update user library with digital/physical products
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
    message: 'Payment authorized and order processed successfully',
    receiptId: `REC-${Date.now().toString(36).toUpperCase()}`
  });
});

// 5. Orders API
app.get('/api/orders', (req: Request, res: Response) => {
  const { email, userId } = req.query;
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

// 6. Admin Panel APIs
app.get('/api/admin/metrics', (_req: Request, res: Response) => {
  const metrics = computeSalesMetrics(orders, products);
  res.json({ success: true, metrics, liveTimestamp: new Date().toISOString() });
});

app.put('/api/admin/inventory/:id', (req: Request, res: Response) => {
  const { stock, price, digitalPrice, isFeatured, lowStockThreshold } = req.body;
  const prod = products.find(p => p.id === req.params.id);
  if (!prod) {
    res.status(404).json({ success: false, error: 'Monograph not found' });
    return;
  }

  if (typeof stock === 'number') prod.stock = stock;
  if (typeof price === 'number') prod.price = price;
  if (typeof digitalPrice === 'number') prod.digitalPrice = digitalPrice;
  if (typeof isFeatured === 'boolean') prod.isFeatured = isFeatured;
  if (typeof lowStockThreshold === 'number') prod.lowStockThreshold = lowStockThreshold;

  res.json({ success: true, product: prod, message: 'Inventory updated in real time' });
});

app.post('/api/admin/inventory', (req: Request, res: Response) => {
  const newProduct: Product = {
    id: `mono-${Date.now()}`,
    title: req.body.title || 'Untitled Clinical Monograph',
    subtitle: req.body.subtitle || 'Monograph Series',
    author: req.body.author || 'Dr. Amina Ilupeju, MD, FACOG',
    authorTitle: 'MD, FACOG',
    authorCredentials: 'Perinatal Faculty Specialist',
    authorAvatar: 'https://images.unsplash.com/photo-1594824813633-8241446539a2?auto=format&fit=crop&q=80&w=260',
    coverImage: req.body.coverImage || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
    price: req.body.price || 45.00,
    digitalPrice: req.body.digitalPrice || 26.00,
    formats: req.body.formats || ['Hardcover', 'EPUB'],
    category: req.body.category || 'Maternal Health',
    rating: 5.0,
    reviewCount: 1,
    pages: req.body.pages || 250,
    publishYear: 2026,
    edition: '1st Edition',
    isbn: req.body.isbn || '978-1-954821-99-9',
    cmeCredits: req.body.cmeCredits || 10,
    peerReviewQuote: req.body.peerReviewQuote || 'A promising clinical addition to maternal healthcare literature.',
    peerReviewSource: 'Serene Editorial Board',
    stock: req.body.stock || 20,
    lowStockThreshold: 10,
    synopsis: req.body.synopsis || 'Clinical monograph providing evidence-based protocols for medical professionals.',
    tableOfContents: ['Introduction', 'Clinical Evidence', 'Implementation Guidelines'],
    sampleChapters: [
      {
        id: `chap-${Date.now()}`,
        chapterNumber: 1,
        title: 'Introduction & Clinical Indications',
        subtitle: 'Foundational framework and diagnostic scope',
        readingTimeMinutes: 8,
        content: [
          'This clinical monograph compiles multi-center trial data and clinical practice guidelines to optimize patient outcomes.',
          'Comprehensive biomarker assessment and patient-centered rehabilitation timelines provide predictable restorative results.'
        ]
      }
    ]
  };

  products.push(newProduct);
  res.json({ success: true, product: newProduct });
});

// Vite Dev Server Integration
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GyneWell Care & Wellness Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
