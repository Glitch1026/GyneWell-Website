import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Lock, CreditCard, ChevronRight, BookOpen, AlertCircle, Zap, Download, FileText } from 'lucide-react';
import { CartItem, Order, UserProfile } from '../types.ts';
import { calculateCartTotals, validateCreditCard, formatCurrency } from '../utils/shop-logic.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  promoCode: string;
  currentUser: UserProfile | null;
  onCheckoutSuccess: (order: Order) => void;
  onOpenReaderForBook: (productId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  promoCode,
  currentUser,
  onCheckoutSuccess,
  onOpenReaderForBook
}) => {
  if (!isOpen) return null;

  const totals = calculateCartTotals(cartItems, promoCode);

  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [customerName, setCustomerName] = useState<string>(currentUser?.name || 'Dr. Claire Watson, MD');
  const [customerEmail, setCustomerEmail] = useState<string>(currentUser?.email || 'claire.watson@gmail.com');
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'google_pay' | 'apple_pay' | 'hsa_fsa'>('card');
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [rawCardNumber, setRawCardNumber] = useState<string>('4242424242424242');
  const [expiry, setExpiry] = useState<string>('12/28');
  const [cvv, setCvv] = useState<string>('888');
  const [cardholderName, setCardholderName] = useState<string>(customerName);
  
  // Submission State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    setRawCardNumber(raw);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    let clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      clean = `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    setExpiry(clean);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // If card payment, validate
    if (paymentMethod === 'card' || paymentMethod === 'hsa_fsa') {
      const cardCheck = validateCreditCard(rawCardNumber, expiry, cvv);
      if (!cardCheck.valid) {
        const firstErr = Object.values(cardCheck.errors)[0];
        setErrorMessage(firstErr);
        return;
      }
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          customerEmail,
          customerName,
          items: cartItems,
          promoCode: promoCode || undefined,
          paymentMethod,
          cardDetails: paymentMethod === 'card' || paymentMethod === 'hsa_fsa' ? {
            number: rawCardNumber,
            expiry,
            cvv,
            name: cardholderName
          } : undefined
        })
      });

      const data = await response.json();
      if (!data.success) {
        setErrorMessage(data.error || 'Payment authorization failed');
        setIsProcessing(false);
        return;
      }

      setCompletedOrder(data.order);
      onCheckoutSuccess(data.order);
      setStep('confirmation');
    } catch {
      setErrorMessage('Network error communicating with clinical payment gateway.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#faf8f5] border border-[#ebe6de] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8">
        
        {/* Modal Top Header */}
        <div className="p-6 bg-white border-b border-[#ebe6de] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#7ea8a4]/15 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#7ea8a4]" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7ea8a4] block">
                GyneWell Publishing
              </span>
              <h2 className="font-sans text-xl font-bold text-[#3b4349]">
                {step === 'confirmation' ? 'Order Complete' : 'Secure Digital Checkout'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#717977] hover:text-[#3b4349] p-1.5 rounded-lg hover:bg-[#efeeeb] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Progress Tracker */}
        {step !== 'confirmation' && (
          <div className="bg-[#f4efe9] px-6 py-2.5 border-b border-[#ebe6de] flex items-center justify-between text-xs font-medium">
            <div className={`flex items-center space-x-1.5 ${step === 'details' ? 'text-[#3b4349] font-bold' : 'text-[#717977]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'details' ? 'bg-[#7ea8a4] text-white' : 'bg-[#ddd7cd]'}`}>1</span>
              <span>License Holder</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#c0c8c6]" />
            <div className={`flex items-center space-x-1.5 ${step === 'payment' ? 'text-[#3b4349] font-bold' : 'text-[#717977]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'payment' ? 'bg-[#7ea8a4] text-white' : 'bg-[#ddd7cd]'}`}>2</span>
              <span>Payment Authorization</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#c0c8c6]" />
            <div className="flex items-center space-x-1.5 text-[#717977]">
              <span className="w-5 h-5 rounded-full bg-[#ddd7cd] flex items-center justify-center text-[10px]">3</span>
              <span>Instant Access</span>
            </div>
          </div>
        )}

        <div className="p-6">
          
          {/* STEP 1: LICENSE HOLDER DETAILS */}
          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3b4349] mb-1">
                  Full Name / Practitioner Credential
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setCardholderName(e.target.value);
                  }}
                  className="w-full p-2.5 text-sm bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
                  placeholder="e.g. Dr. Claire Watson, MD"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3b4349] mb-1">
                  Delivery Email Address (for digital e-book licenses & receipts)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2.5 text-sm bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
                  placeholder="name@clinic.org"
                  required
                />
              </div>

              {/* Digital PDF Delivery Guarantee */}
              <div className="bg-[#f4efe9] p-3.5 rounded-xl border border-[#ebe6de] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>100% Instant PDF Download — Zero Shipping Wait</span>
                </div>
                <p className="text-[#575f66] leading-relaxed">
                  Your purchased PDF monographs unlock immediately for direct `.pdf` download and reading in your GyneWell Clinical Library.
                </p>
              </div>

              {/* Order summary mini-box */}
              <div className="bg-white p-3.5 rounded-xl border border-[#ebe6de] space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-[#3b4349]">
                  <span>Publications ({totals.itemCount} e-books):</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount applied ({promoCode}):</span>
                    <span>-{formatCurrency(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#575f66]">
                  <span>Instant Cloud Delivery:</span>
                  <span className="text-emerald-700 font-bold">Free ($0.00)</span>
                </div>
                <div className="flex justify-between text-[#575f66]">
                  <span>Clinical Sales Tax (5%):</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#7ea8a4] pt-2 border-t border-[#f4efe9]">
                  <span>Total Due:</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="w-full py-3 bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-sm font-bold rounded-lg flex items-center justify-center space-x-2 shadow-sm transition cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT PROCESSING */}
          {step === 'payment' && (
            <form onSubmit={handleProcessPayment} className="space-y-5">
              
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-[#3b4349] mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#7ea8a4] bg-[#7ea8a4]/10 text-[#3b4349] shadow-xs'
                        : 'border-[#ddd7cd] bg-white text-[#575f66] hover:bg-[#f4efe9]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#7ea8a4]" />
                    <span>Credit / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('google_pay')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                      paymentMethod === 'google_pay'
                        ? 'border-[#7ea8a4] bg-[#7ea8a4]/10 text-[#3b4349] shadow-xs'
                        : 'border-[#ddd7cd] bg-white text-[#575f66] hover:bg-[#f4efe9]'
                    }`}
                  >
                    <span className="font-bold">G Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                      paymentMethod === 'apple_pay'
                        ? 'border-[#7ea8a4] bg-[#7ea8a4]/10 text-[#3b4349] shadow-xs'
                        : 'border-[#ddd7cd] bg-white text-[#575f66] hover:bg-[#f4efe9]'
                    }`}
                  >
                    <span> Apple Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('hsa_fsa')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                      paymentMethod === 'hsa_fsa'
                        ? 'border-[#7ea8a4] bg-[#7ea8a4]/10 text-[#3b4349] shadow-xs'
                        : 'border-[#ddd7cd] bg-white text-[#575f66] hover:bg-[#f4efe9]'
                    }`}
                  >
                    <span>HSA / FSA Card</span>
                  </button>
                </div>
              </div>

              {/* Card Form */}
              {(paymentMethod === 'card' || paymentMethod === 'hsa_fsa') ? (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-[#ebe6de]">
                  <div>
                    <label className="block text-xs font-bold text-[#3b4349] mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3b4349] mb-1">Card Number (Luhn-Verified)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#ddd7cd] rounded-lg font-mono text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
                      placeholder="4242 4242 4242 4242"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#3b4349] mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full p-2 text-xs bg-white border border-[#ddd7cd] rounded-lg font-mono text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3b4349] mb-1">CVC / CVV</label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.slice(0, 4))}
                        placeholder="888"
                        maxLength={4}
                        className="w-full p-2 text-xs bg-white border border-[#ddd7cd] rounded-lg font-mono text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#f4efe9] p-4 rounded-xl border border-[#ebe6de] text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-[#7ea8a4] mx-auto" />
                  <p className="text-xs font-semibold text-[#3b4349]">
                    One-Click Express Clinical Authorization
                  </p>
                  <p className="text-[11px] text-[#575f66]">
                    Clicking Authorize simulates biometric 1-tap checkout via {paymentMethod === 'google_pay' ? 'Google Pay' : 'Apple Pay'}.
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-4 py-3 bg-[#efeeeb] hover:bg-[#eae8e5] text-xs font-semibold text-[#575f66] rounded-lg cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-[#7ea8a4] hover:bg-[#6d9793] disabled:opacity-50 text-white text-sm font-bold rounded-lg flex items-center justify-center space-x-2 shadow-sm transition hover:shadow-md cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authorize {formatCurrency(totals.total)} & Unlock E-Books</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* STEP 3: ORDER CONFIRMATION */}
          {step === 'confirmation' && completedOrder && (
            <div className="space-y-6 text-center py-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-[#7ea8a4] tracking-widest uppercase">
                  Digital License Issued & E-Books Unlocked
                </span>
                <h3 className="font-sans text-2xl font-bold text-[#3b4349] mt-1">
                  Thank You for Your Order
                </h3>
                <p className="text-xs text-[#575f66] mt-1">
                  Receipt & DRM-free access sent to <strong>{completedOrder.customerEmail}</strong>
                </p>
              </div>

              {/* Order Summary Receipt Box */}
              <div className="bg-white p-4 rounded-xl border border-[#ebe6de] text-left text-xs space-y-2 shadow-2xs">
                <div className="flex justify-between border-b border-[#f4efe9] pb-2">
                  <span className="text-[#717977]">Order Reference:</span>
                  <span className="font-bold text-[#3b4349] font-mono">{completedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between border-b border-[#f4efe9] pb-2">
                  <span className="text-[#717977]">Delivery Type:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Instant Cloud Access
                  </span>
                </div>
                <div className="space-y-2 pt-1">
                  <span className="text-[#717977] block font-semibold">Purchased PDF E-Books & Licenses:</span>
                  {completedOrder.items.map((item, idx) => {
                    const licenseKey = completedOrder.licenseKeys?.[item.productId] || `GW-LIC-${item.productId.slice(0, 4).toUpperCase()}`;
                    return (
                      <div key={idx} className="bg-[#f4efe9] p-2.5 rounded-lg border border-[#ebe6de] space-y-1.5">
                        <div className="flex justify-between text-[#3b4349]">
                          <span className="font-bold truncate pr-2">{item.title} (PDF)</span>
                          <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#575f66]">
                          <span>License: <code className="font-mono text-[#3b4349] bg-white px-1 py-0.5 rounded border border-[#ddd7cd]">{licenseKey}</code></span>
                          <a
                            href={`/api/products/${item.productId}/pdf`}
                            download
                            className="inline-flex items-center space-x-1 text-[#3b4349] hover:text-[#7ea8a4] font-bold underline"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download PDF</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between border-t border-[#f4efe9] pt-2 font-bold text-sm text-[#7ea8a4]">
                  <span>Total Paid:</span>
                  <span>{formatCurrency(completedOrder.total)}</span>
                </div>
              </div>

              {/* Unlocked Actions */}
              <div className="space-y-2 pt-2">
                {completedOrder.items.length > 0 && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReaderForBook(completedOrder.items[0].productId);
                    }}
                    className="w-full py-3 bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 shadow-sm transition cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open in GyneWell Clinical Reader Now</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#f4efe9] hover:bg-[#eae4dc] text-[#3b4349] text-xs font-semibold rounded-lg border border-[#ddd7cd] cursor-pointer"
                >
                  Return to Compendium Catalog
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
