import { CartItem, Order, Product, AdminMetrics } from '../types.ts';

export const PROMO_CODES: Record<string, { discountPercent: number; description: string }> = {
  GYNEWELL10: { discountPercent: 10, description: '10% GyneWell Clinical Community discount' },
  WELLNESS20: { discountPercent: 20, description: '20% GyneWell Care & Wellness Fellow discount' },
  CLINICAL10: { discountPercent: 10, description: '10% Clinical Community discount' },
  SERENE20: { discountPercent: 20, description: '20% Serene Fellow discount' },
  WELCOME15: { discountPercent: 15, description: '15% New Practitioner discount' },
  MDCOMPLIMENTARY: { discountPercent: 100, description: '100% Peer Reviewer Access' }
};

export interface CartCalculation {
  subtotal: number;
  discount: number;
  discountPercent: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
  hasPhysicalItems: boolean;
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
  const hasPhysicalItems = items.some(item => item.format === 'Hardcover' || item.format === 'Paperback');

  const { valid, discountPercent } = validateDiscountCode(promoCode);
  const discount = valid ? Number(((subtotal * discountPercent) / 100).toFixed(2)) : 0;
  
  const discountedSubtotal = Math.max(0, subtotal - discount);
  // Free standard tracked clinical courier on physical orders over $75 or all-digital
  const shipping = !hasPhysicalItems || discountedSubtotal >= 75 || discountedSubtotal === 0 ? 0 : 7.50;
  // Estimated healthcare clinical publication tax: 5%
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
    hasPhysicalItems
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
 * Pure aggregation for sales metrics and performance
 */
export function computeSalesMetrics(orders: Order[], products: Product[]): AdminMetrics {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const ordersCount = orders.length;
  const averageOrderValue = ordersCount > 0 ? Number((totalRevenue / ordersCount).toFixed(2)) : 0;
  
  const totalUnitsSold = orders.reduce((sum, o) => {
    return sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;

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

  // Category breakdown
  const categoryMap = new Map<string, { sales: number; count: number }>();
  orders.forEach(order => {
    order.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const cat = prod?.category || 'Maternal Health';
      const prev = categoryMap.get(cat) || { sales: 0, count: 0 };
      prev.sales += item.price * item.quantity;
      prev.count += item.quantity;
      categoryMap.set(cat, prev);
    });
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    sales: Number(data.sales.toFixed(2)),
    count: data.count
  }));

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    ordersCount,
    averageOrderValue,
    totalUnitsSold,
    activeReadersNow: 42,
    lowStockCount,
    salesGrowthPercent: 18.4,
    recentOrders: orders.slice(0, 10),
    dailySales,
    categoryBreakdown
  };
}
