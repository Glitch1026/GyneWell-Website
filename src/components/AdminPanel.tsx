import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  ShoppingBag, 
  Plus, 
  Edit3, 
  Check, 
  RefreshCw, 
  Search, 
  ArrowUpRight
} from 'lucide-react';
import { Product, Order, AdminMetrics, UserProfile } from '../types.ts';
import { formatCurrency } from '../utils/shop-logic.ts';

interface AdminPanelProps {
  currentUser: UserProfile | null;
  onLoginAsMasterAdmin: () => void;
  products: Product[];
  onUpdateProductStock: (productId: string, newStock: number, newPrice?: number) => Promise<void>;
  onAddNewProduct: (newProd: Partial<Product>) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onLoginAsMasterAdmin,
  products,
  onUpdateProductStock,
  onAddNewProduct,
  onRefreshData
}) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);
  const [stockEditId, setStockEditId] = useState<string | null>(null);
  const [editStockVal, setEditStockVal] = useState<number>(0);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // New monograph form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSubtitle, setNewSubtitle] = useState<string>('');
  const [newAuthor, setNewAuthor] = useState<string>('Dr. Oluremi Ilupeju, MD, FACOG');
  const [newCategory, setNewCategory] = useState<any>('Maternal Health');
  const [newPrice, setNewPrice] = useState<number>(45.00);
  const [newDigitalPrice, setNewDigitalPrice] = useState<number>(25.00);
  const [newStock, setNewStock] = useState<number>(30);

  const fetchMetrics = async () => {
    try {
      setIsLoadingMetrics(true);
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error('Error fetching admin metrics', e);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 12000);
    return () => clearInterval(interval);
  }, []);

  const isMasterAdmin = currentUser?.role === 'admin';

  const handleSaveStock = async (prodId: string) => {
    setIsUpdating(true);
    await onUpdateProductStock(prodId, editStockVal, editPriceVal || undefined);
    setStockEditId(null);
    setIsUpdating(false);
    fetchMetrics();
  };

  const handleCreateNewMonograph = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onAddNewProduct({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'GyneWell Clinical Monograph',
      author: newAuthor.trim(),
      authorAvatar: '/assets/aistudio/Dr_Oluremi_Ilupeju_d7f8ed13.webp',
      category: newCategory,
      price: Number(newPrice),
      digitalPrice: Number(newDigitalPrice),
      stock: Number(newStock),
      lowStockThreshold: 10
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewSubtitle('');
    fetchMetrics();
  };

  const filteredProducts = products.filter(p => 
    !searchTerm || 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Master Account Security Banner */}
      <div className="bg-[#3b4349] text-white p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#7ea8a4]/30">
        <div className="flex items-center space-x-3.5">
          <img
            src="/assets/aistudio/GyneWell_dp_1d15eb01.png"
            alt="GyneWell Master Seal"
            className="w-12 h-12 object-contain rounded-full bg-white p-0.5 shadow-sm"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold">
                GyneWell Master Admin Console
              </h1>
              <span className="text-[10px] font-bold bg-[#7ea8a4] text-[#3b4349] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Full Master Access
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#c0c8c6] mt-0.5">
              Care You Trust, Wellness You Deserve • Real-time inventory & sales velocity management.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!isMasterAdmin ? (
            <button
              onClick={onLoginAsMasterAdmin}
              className="bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition"
            >
              Sign In as Master Admin (admin@gynewell.clinic)
            </button>
          ) : (
            <div className="flex items-center space-x-2 bg-[#2a3035] px-3 py-1.5 rounded-lg text-xs text-[#bfebe6] border border-[#7ea8a4]/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Master Admin Active: <strong>{currentUser.email}</strong></span>
            </div>
          )}

          <button
            onClick={() => { fetchMetrics(); onRefreshData(); }}
            className="p-2.5 bg-[#2a3035] hover:bg-[#1f2428] text-[#7ea8a4] rounded-lg text-xs transition border border-[#7ea8a4]/30"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingMetrics ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Real-time Sales Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-[#ebe6de] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#575f66]">
              <span className="font-semibold uppercase tracking-wider">Gross Revenue</span>
              <DollarSign className="w-4 h-4 text-[#7ea8a4]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#3b4349]">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <div className="flex items-center text-xs text-emerald-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              <span>+{metrics.salesGrowthPercent}% vs prior month</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#ebe6de] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#575f66]">
              <span className="font-semibold uppercase tracking-wider">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-[#7ea8a4]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#3b4349]">
              {metrics.ordersCount} Completed
            </div>
            <p className="text-xs text-[#717977]">
              {metrics.totalUnitsSold} monograph editions delivered
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#ebe6de] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#575f66]">
              <span className="font-semibold uppercase tracking-wider">Avg Order Value (AOV)</span>
              <ArrowUpRight className="w-4 h-4 text-[#7ea8a4]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#3b4349]">
              {formatCurrency(metrics.averageOrderValue)}
            </div>
            <p className="text-xs text-[#717977]">
              Blended print + digital EPUB
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#ebe6de] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#575f66]">
              <span className="font-semibold uppercase tracking-wider">Inventory Alerts</span>
              <AlertTriangle className={`w-4 h-4 ${metrics.lowStockCount > 0 ? 'text-[#c98b8b]' : 'text-emerald-600'}`} />
            </div>
            <div className="text-2xl font-serif font-bold text-[#3b4349]">
              {metrics.lowStockCount} <span className="text-sm font-sans font-normal text-[#575f66]">Low Stock Alerts</span>
            </div>
            <p className={`text-xs font-semibold ${metrics.lowStockCount > 0 ? 'text-[#845050]' : 'text-emerald-700'}`}>
              {metrics.lowStockCount > 0 ? 'Physical reprints recommended' : 'Healthy inventory levels'}
            </p>
          </div>

        </div>
      )}

      {/* Live Sales Velocity Chart & Performance */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#ebe6de] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#3b4349]">
                  Live Sales Velocity & Trend
                </h3>
                <p className="text-xs text-[#575f66]">Daily transaction volume & revenue synchronized from backend API</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Live Data Stream
              </span>
            </div>

            {/* Visual Bar Graph */}
            <div className="pt-4 space-y-3">
              {metrics.dailySales.map((day, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#3b4349]">{day.date}</span>
                    <span className="text-[#7ea8a4] font-bold">{formatCurrency(day.amount)} ({day.orders} orders)</span>
                  </div>
                  <div className="w-full h-3 bg-[#f4efe9] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#7ea8a4] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (day.amount / 200) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-[#ebe6de] shadow-2xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#3b4349]">
              GyneWell Specialty Distribution
            </h3>
            <p className="text-xs text-[#575f66]">Revenue contribution by medical specialty</p>
            
            <div className="space-y-3 pt-2">
              {metrics.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="p-2.5 bg-[#faf8f5] rounded-xl border border-[#ebe6de] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#3b4349] block">{cat.category}</span>
                    <span className="text-[11px] text-[#717977]">{cat.count} copies distributed</span>
                  </div>
                  <span className="font-bold text-[#7ea8a4]">{formatCurrency(cat.sales)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Inventory Management Table */}
      <div className="bg-white rounded-2xl border border-[#ebe6de] shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-[#ebe6de] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#faf8f5]">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#3b4349]">
              GyneWell Inventory & Stock Controls
            </h3>
            <p className="text-xs text-[#575f66]">
              Real-time inventory levels, pricing controls, and reprint notifications.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#717977] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter monographs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
              />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Monograph</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4efe9] text-[#3b4349] font-bold uppercase tracking-wider border-b border-[#ebe6de]">
              <tr>
                <th className="py-3 px-4">Publication</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price / Digital</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebe6de]">
              {filteredProducts.map(prod => {
                const isEditing = stockEditId === prod.id;
                const isLow = prod.stock <= prod.lowStockThreshold;

                return (
                  <tr key={prod.id} className="hover:bg-[#faf8f5]/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={prod.coverImage}
                          alt={prod.title}
                          className="w-9 h-12 object-cover rounded-md bg-[#f4efe9] flex-shrink-0"
                        />
                        <div>
                          <p className="font-serif font-bold text-[#3b4349]">{prod.title}</p>
                          <p className="text-[11px] text-[#575f66]">{prod.author} • ISBN: {prod.isbn}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[#404847]">
                      <span className="bg-[#f4efe9] px-2 py-0.5 rounded text-[11px] font-medium">
                        {prod.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#3b4349]">
                      {isEditing ? (
                        <div className="flex items-center space-x-1">
                          <span>$</span>
                          <input
                            type="number"
                            value={editPriceVal}
                            onChange={(e) => setEditPriceVal(Number(e.target.value))}
                            className="w-16 p-1 border rounded text-xs"
                          />
                        </div>
                      ) : (
                        <span>${prod.price.toFixed(2)} / <strong className="text-[#7ea8a4]">${prod.digitalPrice.toFixed(2)}</strong></span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={editStockVal}
                            onChange={(e) => setEditStockVal(Number(e.target.value))}
                            className="w-16 p-1 border rounded text-xs font-bold"
                          />
                          <button
                            onClick={() => handleSaveStock(prod.id)}
                            disabled={isUpdating}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-[#3b4349]">{prod.stock}</span>
                          <span className="text-[11px] text-[#717977]">copies</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center text-[#845050] bg-[#c98b8b]/15 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Low Stock Alert
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Optimal Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => setStockEditId(null)}
                          className="text-xs text-[#717977] hover:underline"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setStockEditId(prod.id);
                            setEditStockVal(prod.stock);
                            setEditPriceVal(prod.price);
                          }}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-[#7ea8a4] bg-[#f4efe9] hover:bg-[#eae4dc] px-2.5 py-1.5 rounded-lg border border-[#ddd7cd]"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Update Stock</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Monograph Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#faf8f5] border border-[#ebe6de] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebe6de] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#3b4349]">Publish New Clinical Monograph</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#717977] text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateNewMonograph} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#3b4349] mb-1">Monograph Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Endocrine Protocols in Perinatal Care"
                  className="w-full p-2 bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#3b4349] mb-1">Clinical Subtitle</label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="A Guide for Practicing OB/GYNs"
                  className="w-full p-2 bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#3b4349] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349]"
                  >
                    <option value="Maternal Health">Maternal Health</option>
                    <option value="Endocrine & Hormonal">Endocrine & Hormonal</option>
                    <option value="Pelvic Health">Pelvic Health</option>
                    <option value="Clinical Nutrition">Clinical Nutrition</option>
                    <option value="Perinatal Neurobiology">Perinatal Neurobiology</option>
                    <option value="Pediatric Transitions">Pediatric Transitions</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#3b4349] mb-1">Initial Stock (Units)</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#3b4349] mb-1">Physical Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#3b4349] mb-1">Digital EPUB Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newDigitalPrice}
                    onChange={(e) => setNewDigitalPrice(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 bg-[#efeeeb] text-[#575f66] rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7ea8a4] hover:bg-[#6d9793] text-white rounded-lg font-bold shadow-xs"
                >
                  Publish to GyneWell Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
