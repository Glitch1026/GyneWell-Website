import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  RefreshCw, 
  FileText, 
  ShoppingBag, 
  CheckCircle2, 
  LogOut
} from 'lucide-react';
import { UserProfile, Product, Order } from '../types.ts';
import { formatCurrency } from '../utils/shop-logic.ts';

interface CustomerProfileProps {
  currentUser: UserProfile;
  products: Product[];
  onOpenReader: (product: Product) => void;
  onLogout: () => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  lastSyncedText: string;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  currentUser,
  products,
  onOpenReader,
  onLogout,
  onSyncNow,
  isSyncing,
  lastSyncedText
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'library' | 'notes' | 'orders'>('library');

  // Fetch orders for current user
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?email=${encodeURIComponent(currentUser.email)}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      }
    };
    fetchOrders();
  }, [currentUser.email]);

  // Find products purchased by customer
  const purchasedProducts = products.filter(p => 
    currentUser.purchasedProductIds.includes(p.id)
  );

  return (
    <div className="py-10 sm:py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Clinician Profile Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#ebe6de] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#c98b8b]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#3b4349] text-white font-serif text-2xl flex items-center justify-center font-bold">
              {currentUser.name.charAt(0)}
            </div>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif text-2xl font-bold text-[#3b4349]">
                {currentUser.name}
              </h1>
              {currentUser.role === 'admin' ? (
                <span className="text-[10px] font-bold bg-[#3b4349] text-white px-2.5 py-0.5 rounded-full uppercase">
                  GyneWell Master Admin
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-[#7ea8a4]/20 text-[#3b4349] px-2.5 py-0.5 rounded-full uppercase">
                  Verified Clinician
                </span>
              )}
            </div>
            <p className="text-xs text-[#575f66] mt-0.5">{currentUser.email}</p>
            <div className="flex items-center space-x-2 mt-2 text-[11px] text-[#717977]">
              <span>Auth Provider: <strong className="uppercase">{currentUser.provider}</strong></span>
              <span>•</span>
              <span>Active Since {new Date(currentUser.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Sync & Logout Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onSyncNow}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#f4efe9] hover:bg-[#eae4dc] text-[#3b4349] border border-[#ddd7cd] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex border-b border-[#ebe6de] space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('library')}
          className={`pb-3 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === 'library'
              ? 'border-[#7ea8a4] text-[#3b4349]'
              : 'border-transparent text-[#717977] hover:text-[#3b4349]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#7ea8a4]" />
          <span>My Clinical Library ({purchasedProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === 'notes'
              ? 'border-[#7ea8a4] text-[#3b4349]'
              : 'border-transparent text-[#717977] hover:text-[#3b4349]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#7ea8a4]" />
          <span>Synced Notes & Annotations ({(currentUser.notes || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-[#7ea8a4] text-[#3b4349]'
              : 'border-transparent text-[#717977] hover:text-[#3b4349]'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-[#7ea8a4]" />
          <span>Order History ({orders.length})</span>
        </button>
      </div>

      {/* TAB 1: CLINICAL LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          {purchasedProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#ddd7cd]">
              <BookOpen className="w-12 h-12 text-[#7ea8a4] mx-auto mb-3 opacity-50" />
              <h3 className="font-serif text-lg font-bold text-[#3b4349]">No Monographs in Your Library Yet</h3>
              <p className="text-xs text-[#575f66] mt-1">Purchased physical and digital monographs unlock instantly here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchasedProducts.map(prod => {
                const prog = currentUser.readingProgress[prod.id];
                return (
                  <div key={prod.id} className="bg-white p-4 rounded-xl border border-[#ebe6de] flex space-x-4 shadow-2xs">
                    <img
                      src={prod.coverImage}
                      alt={prod.title}
                      className="w-20 h-28 object-cover rounded-md bg-[#f4efe9] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#3b4349] bg-[#7ea8a4]/15 px-2 py-0.5 rounded">
                          Digital Edition Unlocked
                        </span>
                        <h4 className="font-serif text-base font-bold text-[#3b4349] mt-1 truncate">
                          {prod.title}
                        </h4>
                        <p className="text-xs text-[#575f66]">By {prod.author}</p>
                      </div>

                      <div className="pt-2">
                        {prog ? (
                          <div className="mb-2">
                            <div className="flex justify-between text-[11px] text-[#717977] mb-1">
                              <span>Reading: {prog.progressPercent}% complete</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#f4efe9] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#7ea8a4]"
                                style={{ width: `${prog.progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#717977] mb-2">Ready to read</div>
                        )}

                        <button
                          onClick={() => onOpenReader(prod)}
                          className="w-full py-2 bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 shadow-2xs transition"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Open in GyneWell Reader</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SYNCED NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          {(currentUser.notes || []).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#ddd7cd]">
              <FileText className="w-12 h-12 text-[#7ea8a4] mx-auto mb-3 opacity-50" />
              <h3 className="font-serif text-lg font-bold text-[#3b4349]">No Clinical Annotations Yet</h3>
              <p className="text-xs text-[#575f66] mt-1">Open any chapter in the Clinical Reader to highlight text and take clinical notes.</p>
            </div>
          ) : (
            (currentUser.notes || []).map(note => {
              const matchedProd = products.find(p => p.id === note.productId);
              return (
                <div key={note.id} className="bg-white p-4 rounded-xl border border-[#ebe6de] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#575f66]">
                    <span className="font-bold text-[#7ea8a4]">{matchedProd?.title || 'GyneWell Monograph'}</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  {note.quote && (
                    <blockquote className="border-l-2 border-[#7ea8a4] pl-3 italic text-xs text-[#404847]">
                      "{note.quote}"
                    </blockquote>
                  )}
                  <p className="text-xs text-[#3b4349] font-medium leading-relaxed">
                    {note.text}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#ddd7cd]">
              <ShoppingBag className="w-12 h-12 text-[#7ea8a4] mx-auto mb-3 opacity-50" />
              <h3 className="font-serif text-lg font-bold text-[#3b4349]">No Recent Orders</h3>
              <p className="text-xs text-[#575f66] mt-1">Monographs purchased will be recorded here with official receipts.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-xl border border-[#ebe6de] shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#f4efe9] pb-3 gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#3b4349]">{order.orderNumber}</span>
                    <span className="text-xs text-[#575f66] ml-2">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{order.status}</span>
                    </span>
                    <span className="text-xs text-[#717977] uppercase font-semibold">
                      {order.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[#3b4349]">
                      <span>{item.quantity}x {item.title} ({item.format})</span>
                      <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-[#f4efe9] text-xs">
                  <span className="text-[#717977]">Total Paid:</span>
                  <span className="text-sm font-bold text-[#7ea8a4]">{formatCurrency(order.total)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
