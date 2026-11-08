import React from 'react';
import { BookOpen, ShoppingBag, ShieldCheck, RefreshCw, User, Search } from 'lucide-react';
import { UserProfile, CartItem } from '../types.ts';

interface NavbarProps {
  activeTab: 'catalog' | 'reader' | 'admin' | 'profile';
  setActiveTab: (tab: 'catalog' | 'reader' | 'admin' | 'profile') => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  cartItems: CartItem[];
  isSyncing: boolean;
  lastSyncedText: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onOpenCart,
  cartItems,
  isSyncing,
  lastSyncedText,
  searchQuery,
  setSearchQuery
}) => {
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#3b4349]/10 transition-all">
      {/* Top Clinical Announcement Bar */}
      <div className="bg-[#3b4349] text-[#faf8f5] text-xs py-1.5 px-4 border-b border-[#7ea8a4]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#7ea8a4] animate-pulse"></span>
            <span className="font-medium tracking-wide">
              GyneWell Care & Wellness — For Her. For Health. For Life.
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-[11px] opacity-90">
            <span>Medical Director: Dr. Oluremi Ilupeju, MD, FACOG</span>
            <span>•</span>
            <span>Care You Trust, Wellness You Deserve</span>
            <span>•</span>
            <div className="flex items-center space-x-1.5">
              <RefreshCw className={`w-3 h-3 text-[#7ea8a4] ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="text-[#faf8f5]">{lastSyncedText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity matching Brand Board */}
          <div 
            onClick={() => setActiveTab('catalog')} 
            className="cursor-pointer flex items-center space-x-3.5 group"
          >
            <img
              src="/assets/aistudio/GyneWell_dp_1d15eb01.png"
              alt="GyneWell Care & Wellness Logo"
              className="w-12 h-12 object-contain transition-transform group-hover:scale-105 drop-shadow-xs"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#3b4349]">
                  GyneWell
                </span>
                <span className="text-[10px] tracking-widest uppercase bg-[#7ea8a4]/20 text-[#3b4349] font-bold px-2 py-0.5 rounded-full">
                  Care & Wellness
                </span>
              </div>
              <p className="text-[11px] text-[#717977] font-medium tracking-wide">
                Care You Trust, Wellness You Deserve
              </p>
            </div>
          </div>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#717977] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search monographs, clinical topics, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f4efe9] border border-[#ddd7cd] rounded-lg text-[#3b4349] placeholder-[#717977] focus:outline-none focus:border-[#7ea8a4] focus:ring-1 focus:ring-[#7ea8a4] transition"
              />
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-[#efeeeb] text-[#3b4349]'
                  : 'text-[#404847] hover:text-[#3b4349] hover:bg-[#f5f3f0]'
              }`}
            >
              Publications & Monographs
            </button>
            <button
              onClick={() => setActiveTab('reader')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg flex items-center space-x-1.5 transition-colors ${
                activeTab === 'reader'
                  ? 'bg-[#efeeeb] text-[#3b4349]'
                  : 'text-[#404847] hover:text-[#3b4349] hover:bg-[#f5f3f0]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#7ea8a4]" />
              <span>Clinical Reader</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg flex items-center space-x-1.5 transition-colors ${
                activeTab === 'admin'
                  ? 'bg-[#3b4349] text-white shadow-xs'
                  : 'text-[#c98b8b] hover:text-[#3b4349] hover:bg-[#c98b8b]/15'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#7ea8a4]" />
              <span>Admin Panel</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </button>
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center space-x-3">
            {/* Live Sync cloud pill */}
            <div 
              title={lastSyncedText} 
              className="hidden sm:flex items-center space-x-1 text-xs text-[#575f66] bg-[#f4efe9] px-2.5 py-1 rounded-full border border-[#ebe6de]"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-medium text-[#404847]">Live Cloud</span>
            </div>

            {/* Shopping Bag Button */}
            <button
              onClick={onOpenCart}
              aria-label="Open Shopping Cart"
              className="relative p-2.5 text-[#3b4349] hover:text-[#2a3035] bg-[#f4efe9] hover:bg-[#eae4dc] border border-[#ddd7cd] rounded-lg transition"
            >
              <ShoppingBag className="w-5 h-5 text-[#7ea8a4]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#c98b8b] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Account / Auth */}
            {currentUser ? (
              <div 
                onClick={() => setActiveTab('profile')}
                className="cursor-pointer flex items-center space-x-2 bg-[#f4efe9] hover:bg-[#eae4dc] border border-[#ddd7cd] py-1.5 px-3 rounded-lg transition"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-[#c98b8b]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#7ea8a4] text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-[#3b4349] max-w-[115px] truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#717977] uppercase font-semibold">
                    {currentUser.role === 'admin' ? 'Master Admin' : 'Customer'}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs transition"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Onboard</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="lg:hidden flex items-center justify-between pb-3 pt-1 border-t border-[#3b4349]/10 text-xs overflow-x-auto space-x-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              activeTab === 'catalog' ? 'bg-[#3b4349] text-white' : 'text-[#404847] bg-[#f4efe9]'
            }`}
          >
            Publications
          </button>
          <button
            onClick={() => setActiveTab('reader')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              activeTab === 'reader' ? 'bg-[#3b4349] text-white' : 'text-[#404847] bg-[#f4efe9]'
            }`}
          >
            Clinical Reader
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-[#3b4349] text-white' : 'text-[#c98b8b] bg-[#c98b8b]/15'
            }`}
          >
            Admin Panel
          </button>
          {currentUser && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
                activeTab === 'profile' ? 'bg-[#3b4349] text-white' : 'text-[#404847] bg-[#f4efe9]'
              }`}
            >
              My Library & Account
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
