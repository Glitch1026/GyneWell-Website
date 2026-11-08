import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HeroSpotlight } from './components/HeroSpotlight.tsx';
import { MonographCatalog } from './components/MonographCatalog.tsx';
import { ClinicalReader } from './components/ClinicalReader.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CustomerProfile } from './components/CustomerProfile.tsx';
import { Product, CartItem, UserProfile, Order, FormatType } from './types.ts';
import { MONOGRAPHS_INITIAL_DATA } from './data/monographs.ts';
import { ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(MONOGRAPHS_INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<'catalog' | 'reader' | 'admin' | 'profile'>('catalog');
  const [selectedBookForReader, setSelectedBookForReader] = useState<Product>(MONOGRAPHS_INITIAL_DATA[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'cart-init-1',
      productId: 'postpartum-healing',
      title: 'The Restorative Postpartum',
      author: 'Dr. Oluremi Ilupeju',
      format: 'Hardcover',
      price: 48.00,
      quantity: 1,
      coverImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800'
    }
  ]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<string>('GYNEWELL10');

  // Auth & User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    id: 'user-customer',
    email: 'claire.watson@gmail.com',
    name: 'Dr. Claire Watson, MD',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=260',
    provider: 'google',
    purchasedProductIds: ['postpartum-healing'],
    readingProgress: {
      'postpartum-healing': { chapterId: 'chap-1', progressPercent: 45, lastReadAt: new Date().toISOString() }
    },
    bookmarks: ['chap-1'],
    notes: [
      {
        id: 'note-init',
        productId: 'postpartum-healing',
        chapterId: 'chap-1',
        text: 'Review progesterone withdrawal timeline with clinical patients at 2-week visit.',
        createdAt: new Date().toISOString()
      }
    ],
    wishlist: ['endocrine-arc'],
    createdAt: '2026-02-14T00:00:00Z'
  });
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Real-Time Synchronization State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedText, setLastSyncedText] = useState<string>('Live Sync Active');

  // Fetch live products from backend API
  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.warn('Backend API warming up, using initial products');
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Sync user state to backend API
  const syncUserDataWithBackend = async (partialUpdates?: Partial<UserProfile>) => {
    if (!currentUser) return;
    setIsSyncing(true);

    try {
      const updatedUser = { ...currentUser, ...(partialUpdates || {}) };
      setCurrentUser(updatedUser);

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          readingProgress: updatedUser.readingProgress,
          bookmarks: updatedUser.bookmarks,
          notes: updatedUser.notes,
          wishlist: updatedUser.wishlist,
          cart: cartItems
        })
      });

      const data = await res.json();
      if (data.success) {
        setLastSyncedText(`Synced • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      }
    } catch (e) {
      setLastSyncedText('Sync Pending');
    } finally {
      setIsSyncing(false);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, format: FormatType) => {
    const price = format === 'EPUB' ? product.digitalPrice : product.price;
    const existingIndex = cartItems.findIndex(
      item => item.productId === product.id && item.format === format
    );

    if (existingIndex > -1) {
      const newCart = [...cartItems];
      newCart[existingIndex].quantity += 1;
      setCartItems(newCart);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        productId: product.id,
        title: product.title,
        author: product.author,
        format,
        price,
        quantity: 1,
        coverImage: product.coverImage
      };
      setCartItems(prev => [...prev, newItem]);
    }

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const handleOrderSuccess = (order: Order) => {
    const newPurchasedIds = order.items.map(i => i.productId);
    if (currentUser) {
      const updatedLibrary = Array.from(new Set([...currentUser.purchasedProductIds, ...newPurchasedIds]));
      syncUserDataWithBackend({ purchasedProductIds: updatedLibrary });
    }
    setCartItems([]);
    refreshProducts();
  };

  const handleOpenReaderForBook = (bookId: string) => {
    const target = products.find(p => p.id === bookId) || products[0];
    setSelectedBookForReader(target);
    setActiveTab('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Master Admin login
  const handleLoginAsMasterAdmin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@gynewell.clinic', password: 'master-admin-key' })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setActiveTab('admin');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin inventory updates
  const handleUpdateStock = async (prodId: string, newStock: number, newPrice?: number) => {
    try {
      const res = await fetch(`/api/admin/inventory/${prodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock, price: newPrice })
      });
      const data = await res.json();
      if (data.success) {
        await refreshProducts();
      }
    } catch (e) {
      console.error('Failed to update inventory', e);
    }
  };

  const handleAddNewProduct = async (newProd: Partial<Product>) => {
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
      const data = await res.json();
      if (data.success) {
        await refreshProducts();
      }
    } catch (e) {
      console.error('Failed to add product', e);
    }
  };

  const featuredMonograph = products.find(p => p.isFeatured) || products[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#3b4349] antialiased">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cartItems={cartItems}
        isSyncing={isSyncing}
        lastSyncedText={lastSyncedText}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {activeTab === 'catalog' && (
          <main>
            {/* Editorial Spotlight Banner */}
            <HeroSpotlight
              featuredProduct={featuredMonograph}
              onReadSample={(prod) => {
                setSelectedBookForReader(prod);
                setActiveTab('reader');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onAddToCart={handleAddToCart}
            />

            {/* Catalog Grid */}
            <MonographCatalog
              products={products}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onReadSample={(prod) => {
                setSelectedBookForReader(prod);
                setActiveTab('reader');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onAddToCart={handleAddToCart}
            />
          </main>
        )}

        {activeTab === 'reader' && (
          <ClinicalReader
            product={selectedBookForReader}
            currentUser={currentUser}
            onBackToCatalog={() => setActiveTab('catalog')}
            onAddToCart={handleAddToCart}
            onSyncUserData={(updates) => syncUserDataWithBackend(updates)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            onLoginAsMasterAdmin={handleLoginAsMasterAdmin}
            products={products}
            onUpdateProductStock={handleUpdateStock}
            onAddNewProduct={handleAddNewProduct}
            onRefreshData={refreshProducts}
          />
        )}

        {activeTab === 'profile' && currentUser && (
          <CustomerProfile
            currentUser={currentUser}
            products={products}
            onOpenReader={(prod) => {
              setSelectedBookForReader(prod);
              setActiveTab('reader');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onLogout={() => {
              setCurrentUser(null);
              setActiveTab('catalog');
            }}
            onSyncNow={() => syncUserDataWithBackend()}
            isSyncing={isSyncing}
            lastSyncedText={lastSyncedText}
          />
        )}
      </div>

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        promoCode={promoCode}
        onOrderSuccess={handleOrderSuccess}
        onOpenReaderForBook={handleOpenReaderForBook}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          syncUserDataWithBackend();
        }}
      />

      {/* Editorial Brand Footer */}
      <footer className="bg-[#2a3035] text-[#faf8f5] border-t border-[#3b4349]/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center space-x-3">
                <img
                  src="/assets/aistudio/GyneWell_dp_1d15eb01.png"
                  alt="GyneWell Care & Wellness"
                  className="w-10 h-10 object-contain rounded-full bg-white p-0.5"
                />
                <div>
                  <span className="font-serif text-xl font-bold tracking-tight text-white block">GyneWell</span>
                  <span className="text-[10px] text-[#7ea8a4] tracking-widest uppercase font-semibold">Care & Wellness</span>
                </div>
              </div>
              <p className="text-xs text-[#c0c8c6] leading-relaxed">
                Care You Trust, Wellness You Deserve. For Her. For Health. For Life.
              </p>
              <div className="flex items-center space-x-1.5 text-[11px] text-[#717977]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7ea8a4]" />
                <span className="text-[#c0c8c6]">Peer-Reviewed • CME Accredited</span>
              </div>
            </div>

            <div>
              <h4 className="font-serif text-sm font-semibold text-white mb-3">GyneWell Specialties</h4>
              <ul className="space-y-2 text-xs text-[#dbdad7]">
                <li className="hover:text-white cursor-pointer" onClick={() => { setSelectedCategory('Maternal Health'); setActiveTab('catalog'); }}>Maternal Endocrinology</li>
                <li className="hover:text-white cursor-pointer" onClick={() => { setSelectedCategory('Pelvic Health'); setActiveTab('catalog'); }}>Pelvic Fascial Restoration</li>
                <li className="hover:text-white cursor-pointer" onClick={() => { setSelectedCategory('Perinatal Neurobiology'); setActiveTab('catalog'); }}>Perinatal Matrescence</li>
                <li className="hover:text-white cursor-pointer" onClick={() => { setSelectedCategory('Clinical Nutrition'); setActiveTab('catalog'); }}>Milk Proteomics & Nutrition</li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-sm font-semibold text-white mb-3">Platform Navigation</h4>
              <ul className="space-y-2 text-xs text-[#dbdad7]">
                <li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('catalog')}>Monographs Catalog</li>
                <li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('reader')}>Interactive Clinical Reader</li>
                <li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('admin')}>Master Admin Console</li>
                <li className="hover:text-white cursor-pointer" onClick={() => setIsAuthOpen(true)}>Google & Social Onboarding</li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-sm font-semibold text-white mb-3">Medical Leadership</h4>
              <p className="text-xs text-[#dbdad7] leading-relaxed">
                Founded & directed by Dr. Oluremi Ilupeju, MD, FACOG. Dedicated to clinical excellence, evidence-based maternal restorative medicine, and compassionate patient advocacy.
              </p>
              <div className="mt-3 p-3 rounded-lg bg-[#3b4349] border border-[#717977]/30 text-[11px] text-[#bfebe6]">
                <span className="font-bold block text-white">Clinical Inquiries & Licensing:</span>
                <span>press@gynewell.clinic</span>
              </div>
            </div>

          </div>

          <div className="mt-10 pt-6 border-t border-[#3b4349] flex flex-col sm:flex-row items-center justify-between text-xs text-[#717977] gap-3">
            <p>© 2026 GyneWell Care & Wellness. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Medical Publishing</span>
              <span>•</span>
              <span>CME Disclosure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
