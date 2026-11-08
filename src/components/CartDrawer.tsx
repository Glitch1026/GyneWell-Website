import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types.ts';
import { calculateCartTotals, validateDiscountCode, formatCurrency } from '../utils/shop-logic.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  promoCode,
  setPromoCode
}) => {
  const [promoInput, setPromoInput] = useState<string>(promoCode);
  const [promoError, setPromoError] = useState<string>('');

  if (!isOpen) return null;

  const totals = calculateCartTotals(cartItems, promoCode);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const check = validateDiscountCode(promoInput);
    if (check.valid) {
      setPromoCode(promoInput.trim().toUpperCase());
    } else {
      setPromoError('Invalid promotion code. Try GYNEWELL10 or WELLNESS20');
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoInput('');
    setPromoError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#faf8f5] border-l border-[#ebe6de] shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#ebe6de] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <img
                src="/assets/aistudio/GyneWell_dp_1d15eb01.png"
                alt="GyneWell"
                className="w-7 h-7 object-contain"
              />
              <h2 className="font-serif text-lg font-bold text-[#3b4349]">GyneWell Clinical Bag</h2>
              <span className="text-xs font-semibold bg-[#7ea8a4]/20 text-[#3b4349] px-2 py-0.5 rounded-full">
                {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[#717977] hover:text-[#3b4349] p-1.5 rounded-lg hover:bg-[#efeeeb] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-[#717977] mx-auto mb-3 opacity-40" />
                <p className="font-serif text-base font-semibold text-[#3b4349]">Your clinical bag is empty</p>
                <p className="text-xs text-[#575f66] mt-1">Explore our peer-reviewed monographs to begin reading.</p>
                <button
                  onClick={onClose}
                  className="mt-4 bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-semibold px-4 py-2 rounded-lg"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              cartItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white p-3.5 rounded-xl border border-[#ebe6de] flex space-x-3 shadow-2xs"
                >
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-16 h-22 object-cover rounded-md bg-[#f4efe9] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-serif text-sm font-bold text-[#3b4349] leading-tight truncate">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-[#717977] hover:text-rose-600 ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#575f66]">By {item.author}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-[#3b4349] bg-[#7ea8a4]/15 px-2 py-0.5 rounded">
                        {item.format} Edition
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2 bg-[#f4efe9] rounded-lg p-1 border border-[#ddd7cd]">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center text-[#575f66] hover:text-[#3b4349] hover:bg-white rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#3b4349] w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center text-[#575f66] hover:text-[#3b4349] hover:bg-white rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-[#3b4349]">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout CTA */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-[#f4efe9] border-t border-[#ebe6de] space-y-4">
              
              {/* Promo Code Input */}
              <div>
                <form onSubmit={handleApplyPromo} className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-[#717977] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. GYNEWELL10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#ddd7cd] rounded-lg uppercase tracking-wider focus:outline-none focus:border-[#7ea8a4]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#3b4349] hover:bg-[#2a3035] text-white text-xs font-semibold rounded-lg"
                  >
                    Apply
                  </button>
                </form>

                {promoCode && (
                  <div className="mt-2 flex items-center justify-between text-xs text-[#3b4349] bg-[#7ea8a4]/15 px-2.5 py-1 rounded-md">
                    <span>Applied: <strong>{promoCode}</strong> ({totals.discountPercent}% OFF)</span>
                    <button onClick={handleRemovePromo} className="text-[#845050] font-bold text-xs hover:underline">
                      Remove
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-600 mt-1">{promoError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#575f66]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#3b4349]">{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({promoCode})</span>
                    <span>-{formatCurrency(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tracked Courier Shipping</span>
                  <span>{totals.shipping === 0 ? <strong className="text-emerald-700">Free</strong> : formatCurrency(totals.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Clinical Tax (5%)</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#ddd7cd] text-sm font-bold text-[#3b4349]">
                  <span>Total Due</span>
                  <span className="text-base text-[#7ea8a4] font-bold">{formatCurrency(totals.total)}</span>
                </div>
              </div>

              {/* Free Shipping Progress Alert */}
              {totals.hasPhysicalItems && totals.subtotal < 75 && (
                <p className="text-[11px] text-[#717977] bg-white/80 p-2 rounded-lg border border-[#ebe6de] text-center">
                  Add {formatCurrency(75 - totals.subtotal)} more in physical monographs for <strong>Free Tracked Courier</strong>.
                </p>
              )}

              {/* Proceed Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3 bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-sm font-bold rounded-lg flex items-center justify-center space-x-2 shadow-sm transition hover:shadow-md"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-[#717977]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7ea8a4]" />
                <span>256-Bit SSL GyneWell Care & Wellness Encrypted Checkout</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
