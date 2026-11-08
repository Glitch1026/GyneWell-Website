import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  BookOpen, 
  Sparkles, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { CartItem, Order, UserProfile } from '../types.ts';
import { calculateCartTotals, validateCreditCard, formatCurrency } from '../utils/shop-logic.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currentUser: UserProfile | null;
  promoCode: string;
  onOrderSuccess: (order: Order) => void;
  onOpenReaderForBook: (productId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  promoCode,
  onOrderSuccess,
  onOpenReaderForBook
}) => {
  if (!isOpen) return null;

  const totals = calculateCartTotals(cartItems, promoCode);

  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [customerName, setCustomerName] = useState<string>(currentUser?.name || 'Dr. Claire Watson, MD');
  const [customerEmail, setCustomerEmail] = useState<string>(currentUser?.email || 'claire.watson@gmail.com');
  const [shippingAddress, setShippingAddress] = useState<string>('450 Sutter St, Suite 800, San Francisco, CA 94108');
  
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
      onOrderSuccess(data.order);
      setStep('confirmation');
    } catch (err: any) {
      setErrorMessage('Network error communicating with payment gateway');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#faf8f5] border border-[#ebe6de] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#ebe6de] flex items-center justify-between bg-[#f4efe9]">
          <div className="flex items-center space-x-2.5">
            <img
              src="/assets/aistudio/GyneWell_dp_1d15eb01.png"
              alt="GyneWell"
              className="w-6 h-6 object-contain"
            />
            <span className="font-serif text-lg font-bold text-[#3b4349]">
              {step === 'confirmation' ? 'Order Confirmation' : 'GyneWell Secure Clinical Checkout'}
            </span>
          </div>
          {step !== 'confirmation' && (
            <button
              onClick={onClose}
              className="text-[#717977] hover:text-[#3b4349] p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Stepper indicator */}
        {step !== 'confirmation' && (
          <div className="flex border-b border-[#ebe6de] bg-white text-xs font-semibold">
            <div 
              onClick={() => setStep('details')}
              className={`flex-1 py-2.5 text-center cursor-pointer border-b-2 transition ${
                step === 'details' ? 'border-[#7ea8a4] text-[#3b4349] bg-[#faf8f5]' : 'border-transparent text-[#717977]'
              }`}
            >
              1. Delivery & Recipient
            </div>
            <div 
              onClick={() => setStep('payment')}
              className={`flex-1 py-2.5 text-center cursor-pointer border-b-2 transition ${
                step === 'payment' ? 'border-[#7ea8a4] text-[#3b4349] bg-[#faf8f5]' : 'border-transparent text-[#717977]'
              }`}
            >
              2. Payment & Authorization
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          
          {/* STEP 1: DELIVERY & DETAILS */}
          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3b4349] mb-1">
                  Recipient Clinician / Full Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 text-sm bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
                  placeholder="e.g. Dr. Claire Watson, MD"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3b4349] mb-1">
                  Clinical Email (for instant digital monograph delivery & receipt)
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

              {totals.hasPhysicalItems && (
                <div>
                  <label className="block text-xs font-bold text-[#3b4349] mb-1">
                    Courier Delivery Address (Physical Editions)
                  </label>
                  <textarea
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
                    placeholder="Clinic street address, Suite, City, State, ZIP"
                    required
                  />
                  <p className="text-[11px] text-[#717977] mt-1">
                    Physical copies ship with tracked clinical tamper-evident courier packaging.
                  </p>
                </div>
              )}

              {/* Order summary mini-box */}
              <div className="bg-[#f4efe9] p-3.5 rounded-xl border border-[#ebe6de] space-y-1 text-xs">
                <div className="flex justify-between font-bold text-[#3b4349]">
                  <span>Items Total ({totals.itemCount} publications):</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount applied ({promoCode}):</span>
                    <span>-{formatCurrency(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#7ea8a4] pt-1 border-t border-[#ddd7cd]">
                  <span>Total Due:</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="w-full py-3 bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-sm font-bold rounded-lg flex items-center justify-center space-x-2 shadow-sm transition"
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
                  Select Secure Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'card', label: 'Credit Card', icon: CreditCard },
                    { id: 'google_pay', label: 'Google Pay', icon: Sparkles },
                    { id: 'apple_pay', label: 'Apple Pay', icon: Lock },
                    { id: 'hsa_fsa', label: 'HSA / FSA Card', icon: ShieldCheck }
                  ].map(method => {
                    const isSelected = paymentMethod === method.id;
                    const Icon = method.icon;
                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                          isSelected
                            ? 'border-[#3b4349] bg-[#3b4349] text-white shadow-xs'
                            : 'border-[#ddd7cd] bg-white text-[#404847] hover:bg-[#f4efe9]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Credit Card Input Form with Preview */}
              {(paymentMethod === 'card' || paymentMethod === 'hsa_fsa') && (
                <div className="space-y-3">
                  {/* Visual Card Chip Preview */}
                  <div className="bg-gradient-to-r from-[#3b4349] to-[#244d4a] text-white p-4 rounded-xl shadow-md space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono tracking-widest text-[#bfebe6]">GYNEWELL HEALTHCARE PAY</span>
                      <span className="font-serif italic text-[11px] text-[#a4cfca]">
                        {paymentMethod === 'hsa_fsa' ? 'HSA/FSA Eligible Medical Monograph' : 'Clinical Direct'}
                      </span>
                    </div>
                    <div className="font-mono text-base tracking-widest py-1">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#bfebe6]">
                      <span>{cardholderName || 'CARDHOLDER NAME'}</span>
                      <span>EXP: {expiry || 'MM/YY'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#575f66] mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full p-2.5 text-xs bg-white border border-[#ddd7cd] rounded-lg font-mono text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#575f66] mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full p-2.5 text-xs bg-white border border-[#ddd7cd] rounded-lg font-mono text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#575f66] mb-1">Security CVV</label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                        className="w-full p-2.5 text-xs bg-white border border-[#ddd7cd] rounded-lg font-mono text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 1-Click Fast Pay Note */}
              {(paymentMethod === 'google_pay' || paymentMethod === 'apple_pay') && (
                <div className="bg-white p-4 rounded-xl border border-[#ebe6de] text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#f4efe9] text-[#7ea8a4] flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5 text-[#7ea8a4]" />
                  </div>
                  <h4 className="font-serif text-sm font-bold text-[#3b4349]">
                    Instant {paymentMethod === 'google_pay' ? 'Google Pay' : 'Apple Pay'} Express Checkout
                  </h4>
                  <p className="text-xs text-[#575f66]">
                    One-click authorization with verified credentials ({customerEmail}).
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Final Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-sm font-bold rounded-lg flex items-center justify-center space-x-2 shadow-md transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authorizing Payment & Syncing Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize & Pay {formatCurrency(totals.total)}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-[#717977] pt-1">
                <span>Backed by GyneWell 30-Day Clinical Guarantee</span>
                <span className="font-semibold text-[#7ea8a4]">Instant Library Unlock</span>
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
                  Payment Authorized & Order Confirmed
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#3b4349] mt-1">
                  Thank You for Your Order
                </h3>
                <p className="text-xs text-[#575f66] mt-1">
                  Confirmation and receipt dispatched to <strong>{completedOrder.customerEmail}</strong>
                </p>
              </div>

              {/* Order Summary Receipt Box */}
              <div className="bg-white p-4 rounded-xl border border-[#ebe6de] text-left text-xs space-y-2 shadow-2xs">
                <div className="flex justify-between border-b border-[#f4efe9] pb-2">
                  <span className="text-[#717977]">Order Reference:</span>
                  <span className="font-bold text-[#3b4349] font-mono">{completedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between border-b border-[#f4efe9] pb-2">
                  <span className="text-[#717977]">Payment Method:</span>
                  <span className="font-semibold uppercase">{completedOrder.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="space-y-1 pt-1">
                  <span className="text-[#717977] block font-semibold">Publications Ordered:</span>
                  {completedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[#3b4349]">
                      <span className="truncate pr-2">{item.quantity}x {item.title} ({item.format})</span>
                      <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
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
                    className="w-full py-3 bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 shadow-sm transition"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open in GyneWell Clinical Reader Now</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#f4efe9] hover:bg-[#eae4dc] text-[#3b4349] text-xs font-semibold rounded-lg border border-[#ddd7cd]"
                >
                  Return to Monographs Catalog
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
