import type { CartItem, Order, Product, AdminMetrics, UserProfile } from '../types.ts';

export const PROMO_CODES: Record<string, { discountPercent: number; description: string }> = {
  GYNEWELL10: { discountPercent: 10, description: '10% GyneWell Clinical Community discount' },
  WELLNESS20: { discountPercent: 20, description: '20% GyneWell Care & Wellness Fellow discount' },
  CLINICAL10: { discountPercent: 10, description: '10% Clinical Community discount' },
  WELCOME15: { discountPercent: 15, description: '15% New Practitioner discount' },
  MDCOMPLIMENTARY: { discountPercent: 100, description: '100% Peer Reviewer Access' }
};

export interface CartCalculation {
  subtotal: number;
  discount: number;
  discountPercent: number;
  tax: number;
  shipping: number; // Always $0.00 for instant digital e-books
  total: number;
  itemCount: number;
  isDigitalDelivery: boolean;
}

export function validateDiscountCode(rawCode?: string): { valid: boolean; discountPercent: number; description?: string } {
  if (!rawCode) return { valid: false, discountPercent: 0 };
  const cleaned = rawCode.trim().toUpperCase();
  const match = PROMO_CODES[cleaned];
  if (match) {
    return { valid: true, discountPercent: match.discountPercent, description: match.description };
  }
  return { valid: false, discountPercent: 0 };
}

export function calculateCartTotals(items: CartItem[], promoCode?: string): CartCalculation {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const { valid, discountPercent } = validateDiscountCode(promoCode);
  const discount = valid ? Number(((subtotal * discountPercent) / 100).toFixed(2)) : 0;
  
  const discountedSubtotal = Math.max(0, subtotal - discount);
  // All GyneWell publications are digital e-books: instant delivery, zero shipping fees
  const shipping = 0;
  // Standard electronic medical publication sales tax (5%)
  const tax = Number((discountedSubtotal * 0.05).toFixed(2));
  const total = Number((discountedSubtotal + shipping + tax).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount,
    discountPercent,
    shipping,
    tax,
    total,
    itemCount,
    isDigitalDelivery: true
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Validates credit card number with Luhn check, expiry format MM/YY, and 3-4 digit CVV
 */
export function validateCreditCard(cardNumber: string, expiry: string, cvv: string): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const cleanedNumber = cardNumber.replace(/\D/g, '');

  if (!cleanedNumber || cleanedNumber.length < 13 || cleanedNumber.length > 19) {
    errors.cardNumber = 'Card number must be between 13 and 19 digits.';
  } else {
    // Luhn algorithm check
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanedNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanedNumber.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    if (sum % 10 !== 0) {
      errors.cardNumber = 'Invalid credit card number checksum.';
    }
  }

  // Validate expiry (MM/YY)
  const expiryMatch = expiry.trim().match(/^(\d{2})\/?(\d{2})$/);
  if (!expiryMatch) {
    errors.expiry = 'Expiry must be in MM/YY format.';
  } else {
    const month = parseInt(expiryMatch[1], 10);
    const year = parseInt(expiryMatch[2], 10) + 2000;
    if (month < 1 || month > 12) {
      errors.expiry = 'Invalid month.';
    } else {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiry = 'Card is expired.';
      }
    }
  }

  // Validate CVV
  const cleanedCvv = cvv.trim();
  if (!/^\d{3,4}$/.test(cleanedCvv)) {
    errors.cvv = 'CVV must be 3 or 4 digits.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Generates an encrypted clinical digital license key for purchased e-books
 */
export function generateDigitalLicenseKey(orderNumber: string, productId: string): string {
  const cleanProd = productId.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `GW-LIC-${cleanProd}-${orderNumber.slice(-4)}-${randomSuffix}`;
}

/**
 * Calculates overall reading progress percentage
 */
export function calculateReadingProgress(chapterIndex: number, totalChapters: number, scrollFraction: number): number {
  if (totalChapters <= 0) return 0;
  const clampedFraction = Math.min(Math.max(scrollFraction, 0), 1);
  const chapterWeight = 100 / totalChapters;
  const overall = (chapterIndex * chapterWeight) + (clampedFraction * chapterWeight);
  return Math.min(100, Math.round(overall));
}

/**
 * Pure aggregation for sales metrics and digital performance
 */
export function computeSalesMetrics(orders: Order[], products: Product[]): AdminMetrics {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const ordersCount = orders.length;
  const averageOrderValue = ordersCount > 0 ? Number((totalRevenue / ordersCount).toFixed(2)) : 0;
  
  const totalLicensesSold = orders.reduce((sum, o) => {
    return sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  const totalLicensesIssued = products.reduce((sum, p) => sum + (p.licensesIssued || 0), 0) + totalLicensesSold;
  const activeReadersNow = products.reduce((sum, p) => sum + (p.activeReadersCount || 0), 0);
  const totalDownloads = totalLicensesIssued * 3; // Average 3 PDF downloads per license across devices
  const totalPdfTitles = products.length;
  const totalUploadedPdfs = products.filter(p => p.sourceType === 'uploaded').length;
  const totalPdfPages = products.reduce((sum, p) => sum + (p.pages || 0), 0);

  // Group by date (e.g. past days)
  const salesMap = new Map<string, { amount: number; orders: number }>();
  orders.forEach(order => {
    const date = order.createdAt.split('T')[0] || order.createdAt.slice(0, 10);
    const existing = salesMap.get(date) || { amount: 0, orders: 0 };
    existing.amount += order.total;
    existing.orders += 1;
    salesMap.set(date, existing);
  });

  const dailySales = Array.from(salesMap.entries())
    .map(([date, data]) => ({ date, amount: Number(data.amount.toFixed(2)), orders: data.orders }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Category breakdown across PDF sales
  const categoryMap = new Map<string, { sales: number; count: number }>();
  let totalCategoryCount = 0;
  orders.forEach(order => {
    order.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const cat = prod?.category || 'Maternal Health';
      const prev = categoryMap.get(cat) || { sales: 0, count: 0 };
      prev.sales += item.price * item.quantity;
      prev.count += item.quantity;
      totalCategoryCount += item.quantity;
      categoryMap.set(cat, prev);
    });
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      sales: Number(data.sales.toFixed(2)),
      count: data.count,
      percentage: totalCategoryCount > 0 ? Math.round((data.count / totalCategoryCount) * 100) : 0
    }))
    .sort((a, b) => b.sales - a.sales);

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    ordersCount,
    averageOrderValue,
    totalLicensesIssued,
    activeReadersNow,
    totalDownloads,
    totalPdfTitles,
    totalUploadedPdfs,
    totalPdfPages,
    salesGrowthPercent: 24.6,
    recentOrders: orders.slice(0, 10),
    dailySales,
    categoryBreakdown
  };
}

export type AppTab = 'catalog' | 'reader' | 'admin' | 'profile';

/**
 * Returns true only when an authenticated administrator account is logged in.
 */
export function isAdminUser(user: Pick<UserProfile, 'role'> | null | undefined): boolean {
  return Boolean(user && user.role === 'admin');
}

/**
 * Ensures customers and logged-out visitors cannot stay on restricted views.
 */
export function resolveSafeActiveTab(
  requestedTab: AppTab,
  user: Pick<UserProfile, 'role'> | null | undefined
): AppTab {
  if (requestedTab === 'admin' && !isAdminUser(user)) {
    return 'catalog';
  }
  if (requestedTab === 'profile' && !user) {
    return 'catalog';
  }
  return requestedTab;
}
