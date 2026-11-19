export type FormatType = 'PDF';

export type ProductCategory =
  | 'Maternal Health'
  | 'Endocrine & Hormonal'
  | 'Pelvic Health'
  | 'Clinical Nutrition'
  | 'Perinatal Neurobiology'
  | 'Pediatric Transitions';

export interface MedicalNote {
  id: string;
  badge: string;
  title: string;
  content: string;
  citation: string;
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  readingTimeMinutes: number;
  subtitle: string;
  content: string[];
  medicalNotes?: MedicalNote[];
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  authorTitle: string;
  authorCredentials: string;
  authorAvatar: string;
  coverImage: string;
  price: number;
  format: FormatType;
  pdfFileName: string;
  pdfUrl: string;
  category: ProductCategory;
  rating: number;
  reviewCount: number;
  pages: number;
  wordCount?: number;
  publishYear: number;
  edition: string;
  editionVersion: string;
  isbn: string;
  fileSizeMb: number;
  cmeCredits?: number;
  peerReviewQuote: string;
  peerReviewSource: string;
  licensesIssued: number;
  activeReadersCount: number;
  instantAccess: boolean;
  isFeatured?: boolean;
  sourceType?: 'uploaded' | 'catalog';
  uploadedAt?: string;
  synopsis: string;
  tableOfContents: string[];
  sampleChapters: Chapter[];
}

export interface ParsedPdfDraft {
  uploadId: string;
  fileName: string;
  fileSizeMb: number;
  pages: number;
  wordCount: number;
  title: string;
  subtitle: string;
  author: string;
  category: ProductCategory;
  isbn: string;
  editionVersion: string;
  suggestedPrice: number;
  cmeCredits: number;
  synopsis: string;
  tableOfContents: string[];
  sampleChapters: Chapter[];
  rawExcerpt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  author: string;
  format: FormatType;
  price: number;
  quantity: number;
  coverImage: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  format: FormatType;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number; // Always $0.00 for instant PDF e-book delivery
  tax: number;
  total: number;
  promoCode?: string;
  paymentMethod: 'card' | 'google_pay' | 'apple_pay' | 'hsa_fsa';
  status: 'Completed' | 'Processing';
  licenseKeys: Record<string, string>;
  downloadTokens?: Record<string, string>;
  createdAt: string;
}

export interface UserNote {
  id: string;
  productId: string;
  chapterId: string;
  text: string;
  quote?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  avatar?: string;
  provider: 'email' | 'google' | 'apple' | 'twitter';
  purchasedProductIds: string[];
  readingProgress: Record<string, { chapterId: string; progressPercent: number; lastReadAt: string }>;
  bookmarks: string[];
  notes: UserNote[];
  wishlist: string[];
  createdAt: string;
}

export interface AdminMetrics {
  totalRevenue: number;
  ordersCount: number;
  averageOrderValue: number;
  totalLicensesIssued: number;
  activeReadersNow: number;
  totalDownloads: number;
  totalPdfTitles: number;
  totalUploadedPdfs: number;
  totalPdfPages: number;
  salesGrowthPercent: number;
  recentOrders: Order[];
  dailySales: { date: string; amount: number; orders: number }[];
  categoryBreakdown: { category: string; sales: number; count: number; percentage: number }[];
}

export interface SyncPayload {
  cart: CartItem[];
  wishlist: string[];
  readingProgress: Record<string, { chapterId: string; progressPercent: number; lastReadAt: string }>;
  notes: UserNote[];
  bookmarks: string[];
}
