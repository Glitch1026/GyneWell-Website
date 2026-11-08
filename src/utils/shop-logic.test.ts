import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  validateDiscountCode,
  validateCreditCard,
  calculateReadingProgress,
  computeSalesMetrics
} from './shop-logic.ts';
import { CartItem, Order, Product } from '../types.ts';

test('validateDiscountCode recognizes valid codes and rejects invalid ones', () => {
  const resultValid = validateDiscountCode('CLINICAL10');
  assert.equal(resultValid.valid, true);
  assert.equal(resultValid.discountPercent, 10);

  const resultCaseInsensitive = validateDiscountCode(' serene20 ');
  assert.equal(resultCaseInsensitive.valid, true);
  assert.equal(resultCaseInsensitive.discountPercent, 20);

  const resultInvalid = validateDiscountCode('FAKECODE99');
  assert.equal(resultInvalid.valid, false);
  assert.equal(resultInvalid.discountPercent, 0);
});

test('calculateCartTotals calculates subtotal, discounts, shipping, and tax accurately', () => {
  const sampleItems: CartItem[] = [
    {
      id: 'c1',
      productId: 'p1',
      title: 'The Restorative Postpartum',
      author: 'Dr. Amina Ilupeju',
      format: 'Hardcover',
      price: 48.00,
      quantity: 1,
      coverImage: '/sample.jpg'
    },
    {
      id: 'c2',
      productId: 'p2',
      title: 'Digital Companion Guide',
      author: 'Dr. Amina Ilupeju',
      format: 'EPUB',
      price: 24.00,
      quantity: 1,
      coverImage: '/sample2.jpg'
    }
  ];

  // Total items = 2, Subtotal = $72.00
  const totalsWithoutPromo = calculateCartTotals(sampleItems);
  assert.equal(totalsWithoutPromo.subtotal, 72.00);
  assert.equal(totalsWithoutPromo.discount, 0);
  // Physical order under $75 gets $7.50 shipping
  assert.equal(totalsWithoutPromo.shipping, 7.50);
  // Tax 5% of 72 = 3.60
  assert.equal(totalsWithoutPromo.tax, 3.60);
  assert.equal(totalsWithoutPromo.total, 83.10);

  // With CLINICAL10 (10% off $72 = $7.20 off -> $64.80)
  const totalsWithPromo = calculateCartTotals(sampleItems, 'CLINICAL10');
  assert.equal(totalsWithPromo.discount, 7.20);
  assert.equal(totalsWithPromo.shipping, 7.50);
  assert.equal(totalsWithPromo.tax, 3.24); // 5% of 64.80 = 3.24
  assert.equal(totalsWithPromo.total, 75.54);
});

test('calculateCartTotals gives free shipping for pure digital items', () => {
  const digitalOnly: CartItem[] = [
    {
      id: 'c1',
      productId: 'p1',
      title: 'Digital EPUB Edition',
      author: 'Dr. Amina Ilupeju',
      format: 'EPUB',
      price: 28.00,
      quantity: 1,
      coverImage: '/sample.jpg'
    }
  ];
  const totals = calculateCartTotals(digitalOnly);
  assert.equal(totals.shipping, 0);
  assert.equal(totals.hasPhysicalItems, false);
});

test('validateCreditCard validates numbers using Luhn check and detects invalid formats', () => {
  // Test invalid short length
  const shortCheck = validateCreditCard('4111', '12/28', '123');
  assert.equal(shortCheck.valid, false);
  assert.ok(shortCheck.errors.cardNumber);

  // Test invalid expiry month
  const invalidMonth = validateCreditCard('4242424242424242', '14/28', '123');
  assert.equal(invalidMonth.valid, false);
  assert.ok(invalidMonth.errors.expiry);

  // Test invalid CVV
  const invalidCvv = validateCreditCard('4242424242424242', '12/28', '12');
  assert.equal(invalidCvv.valid, false);
  assert.ok(invalidCvv.errors.cvv);

  // Test valid dummy test card (standard 4242 4242 4242 4242 passes Luhn)
  const validTestCard = validateCreditCard('4242424242424242', '12/28', '888');
  assert.equal(validTestCard.valid, true);
});

test('calculateReadingProgress computes precise progress percentage across chapters', () => {
  // Total 4 chapters. At chapter 0, half scrolled (0.5) => 0.5 * 25% = 12.5% -> 13%
  const prog1 = calculateReadingProgress(0, 4, 0.5);
  assert.equal(prog1, 13);

  // Chapter 2 (3rd chapter), completed => (2 * 25) + (1.0 * 25) = 75%
  const prog2 = calculateReadingProgress(2, 4, 1.0);
  assert.equal(prog2, 75);

  // Last chapter complete => 100%
  const prog3 = calculateReadingProgress(3, 4, 1.0);
  assert.equal(prog3, 100);
});

test('computeSalesMetrics aggregates metrics, orders count, and revenue accurately', () => {
  const dummyProducts: Product[] = [
    {
      id: 'p1',
      title: 'Monograph A',
      subtitle: 'Sub',
      author: 'Dr. Ilupeju',
      authorTitle: 'MD',
      authorCredentials: 'FACOG',
      authorAvatar: '',
      coverImage: '',
      price: 50,
      digitalPrice: 30,
      formats: ['Hardcover'],
      category: 'Maternal Health',
      rating: 5,
      reviewCount: 10,
      pages: 200,
      publishYear: 2026,
      edition: '1st',
      isbn: '123',
      peerReviewQuote: '',
      peerReviewSource: '',
      stock: 5,
      lowStockThreshold: 10, // low stock!
      synopsis: '',
      tableOfContents: [],
      sampleChapters: []
    }
  ];

  const dummyOrders: Order[] = [
    {
      id: 'o1',
      orderNumber: 'ORD-1001',
      customerEmail: 'doc@clinic.org',
      customerName: 'Dr. Test',
      items: [{ productId: 'p1', title: 'Monograph A', format: 'Hardcover', price: 50, quantity: 2 }],
      subtotal: 100,
      discount: 0,
      shipping: 0,
      tax: 5,
      total: 105,
      paymentMethod: 'card',
      status: 'Completed',
      createdAt: '2026-11-08T10:00:00Z'
    }
  ];

  const metrics = computeSalesMetrics(dummyOrders, dummyProducts);
  assert.equal(metrics.totalRevenue, 105);
  assert.equal(metrics.ordersCount, 1);
  assert.equal(metrics.averageOrderValue, 105);
  assert.equal(metrics.totalUnitsSold, 2);
  assert.equal(metrics.lowStockCount, 1);
});
