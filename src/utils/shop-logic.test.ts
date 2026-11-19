import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  validateDiscountCode,
  validateCreditCard,
  calculateReadingProgress,
  computeSalesMetrics,
  generateDigitalLicenseKey,
  isAdminUser,
  resolveSafeActiveTab
} from './shop-logic.ts';
import type { CartItem, Order, Product } from '../types.ts';

test('validateDiscountCode recognizes valid codes and rejects invalid ones', () => {
  const resultValid = validateDiscountCode('CLINICAL10');
  assert.equal(resultValid.valid, true);
  assert.equal(resultValid.discountPercent, 10);

  const resultCaseInsensitive = validateDiscountCode(' wellness20 ');
  assert.equal(resultCaseInsensitive.valid, true);
  assert.equal(resultCaseInsensitive.discountPercent, 20);

  const resultInvalid = validateDiscountCode('FAKECODE99');
  assert.equal(resultInvalid.valid, false);
  assert.equal(resultInvalid.discountPercent, 0);
});

test('calculateCartTotals calculates subtotal, discounts, zero-shipping instant delivery, and tax accurately for PDF e-books', () => {
  const sampleItems: CartItem[] = [
    {
      id: 'c1',
      productId: 'p1',
      title: 'The Restorative Postpartum',
      author: 'Dr. Oluremi Ilupeju',
      format: 'PDF',
      price: 28.00,
      quantity: 1,
      coverImage: '/sample.jpg'
    },
    {
      id: 'c2',
      productId: 'p2',
      title: 'Digital Companion Guide',
      author: 'Dr. Oluremi Ilupeju',
      format: 'PDF',
      price: 24.00,
      quantity: 1,
      coverImage: '/sample2.jpg'
    }
  ];

  // Total items = 2, Subtotal = $52.00
  const totalsWithoutPromo = calculateCartTotals(sampleItems);
  assert.equal(totalsWithoutPromo.subtotal, 52.00);
  assert.equal(totalsWithoutPromo.discount, 0);
  // All PDF e-books have instant cloud delivery: $0 shipping
  assert.equal(totalsWithoutPromo.shipping, 0);
  // Tax 5% of 52 = 2.60
  assert.equal(totalsWithoutPromo.tax, 2.60);
  assert.equal(totalsWithoutPromo.total, 54.60);
  assert.equal(totalsWithoutPromo.isDigitalDelivery, true);

  // With CLINICAL10 (10% off $52 = $5.20 off -> $46.80)
  const totalsWithPromo = calculateCartTotals(sampleItems, 'CLINICAL10');
  assert.equal(totalsWithPromo.discount, 5.20);
  assert.equal(totalsWithPromo.shipping, 0);
  assert.equal(totalsWithPromo.tax, 2.34); // 5% of 46.80 = 2.34
  assert.equal(totalsWithPromo.total, 49.14);
});

test('generateDigitalLicenseKey creates unique encrypted clinical licenses', () => {
  const key = generateDigitalLicenseKey('ORD-8821', 'postpartum-healing');
  assert.ok(key.startsWith('GW-LIC-POST-8821-'));
  assert.equal(typeof key, 'string');
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

test('computeSalesMetrics aggregates metrics, PDF library totals, and revenue accurately', () => {
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
      price: 28,
      format: 'PDF',
      pdfFileName: 'monograph-a.pdf',
      pdfUrl: '/api/products/p1/pdf',
      category: 'Maternal Health',
      rating: 5,
      reviewCount: 10,
      pages: 200,
      publishYear: 2026,
      edition: '1st',
      editionVersion: 'v1.0',
      isbn: '123',
      fileSizeMb: 12,
      peerReviewQuote: '',
      peerReviewSource: '',
      licensesIssued: 500,
      activeReadersCount: 30,
      instantAccess: true,
      sourceType: 'uploaded',
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
      items: [{ productId: 'p1', title: 'Monograph A', format: 'PDF', price: 28, quantity: 2 }],
      subtotal: 56,
      discount: 0,
      shipping: 0,
      tax: 2.80,
      total: 58.80,
      paymentMethod: 'card',
      status: 'Completed',
      licenseKeys: { p1: 'GW-LIC-P1-1001-XYZ' },
      createdAt: '2026-11-08T10:00:00Z'
    }
  ];

  const metrics = computeSalesMetrics(dummyOrders, dummyProducts);
  assert.equal(metrics.totalRevenue, 58.80);
  assert.equal(metrics.ordersCount, 1);
  assert.equal(metrics.averageOrderValue, 58.80);
  assert.equal(metrics.totalLicensesIssued, 502); // 500 initial + 2 sold
  assert.equal(metrics.totalPdfTitles, 1);
  assert.equal(metrics.totalUploadedPdfs, 1);
  assert.equal(metrics.totalPdfPages, 200);
  assert.equal(metrics.categoryBreakdown[0].percentage, 100);
});

test('isAdminUser and resolveSafeActiveTab restrict admin panel visibility strictly to authenticated admins', () => {
  assert.equal(isAdminUser(null), false);
  assert.equal(isAdminUser(undefined), false);
  assert.equal(isAdminUser({ role: 'customer' }), false);
  assert.equal(isAdminUser({ role: 'admin' }), true);

  // Guests and customers requesting admin fall back to catalog
  assert.equal(resolveSafeActiveTab('admin', null), 'catalog');
  assert.equal(resolveSafeActiveTab('admin', { role: 'customer' }), 'catalog');
  assert.equal(resolveSafeActiveTab('profile', null), 'catalog');

  // Customers can access catalog, reader, and profile
  assert.equal(resolveSafeActiveTab('profile', { role: 'customer' }), 'profile');
  assert.equal(resolveSafeActiveTab('reader', { role: 'customer' }), 'reader');

  // Authenticated admins can access admin panel
  assert.equal(resolveSafeActiveTab('admin', { role: 'admin' }), 'admin');
});
