import React from 'react';
import { BookOpen, ShoppingBag, Eye, Star, FileText } from 'lucide-react';
import type { Product } from '../types.ts';

interface MonographCatalogProps {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onReadSample: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const CATEGORIES = [
  'All',
  'Maternal Health',
  'Endocrine & Hormonal',
  'Pelvic Health',
  'Clinical Nutrition',
  'Perinatal Neurobiology',
  'Pediatric Transitions'
];

export const MonographCatalog: React.FC<MonographCatalogProps> = ({
  products,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onReadSample,
  onAddToCart
}) => {
  // Filter products by category and search
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#7ea8a4] mb-1.5">
            <span>GyneWell Peer-Reviewed PDF Compendium</span>
          </div>
          <h2 className="font-sans text-2xl sm:text-3xl font-semibold text-[#3b4349]">
            Clinical Monographs & Maternal Health PDF E-Books
          </h2>
          <p className="text-sm text-[#575f66] mt-1 max-w-xl">
            Every monograph is published exclusively as a verified, high-resolution clinical PDF with instant download and cloud reader access.
          </p>
        </div>

        {/* PDF-Only Standard Spec Indicator */}
        <div className="inline-flex items-center space-x-2 bg-[#f4efe9] px-3.5 py-2 rounded-xl border border-[#ebe6de] text-xs font-semibold text-[#3b4349] self-start md:self-auto">
          <FileText className="w-4 h-4 text-[#c98b8b]" />
          <span>Standard Format: DRM-Free PDF Only ({filteredProducts.length} {filteredProducts.length === 1 ? 'Title' : 'Titles'})</span>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === category
                ? 'bg-[#3b4349] text-[#faf8f5] shadow-xs'
                : 'bg-[#f4efe9] hover:bg-[#eae4dc] text-[#404847] border border-[#ddd7cd]/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-[#f4efe9] rounded-2xl border border-dashed border-[#ddd7cd]">
          <BookOpen className="w-12 h-12 text-[#7ea8a4] mx-auto mb-3 opacity-60" />
          <h3 className="font-sans text-lg font-semibold text-[#3b4349]">No PDF e-books match your query</h3>
          <p className="text-xs text-[#575f66] mt-1">Try resetting the category filter or searching for another keyword.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="mt-4 bg-[#7ea8a4] text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-[#ffffff] border border-[#ebe6de] rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow group relative"
            >
              {/* Top Section */}
              <div>
                {/* Cover Preview Image Container */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#f4efe9] mb-4">
                  <img
                    src={product.coverImage}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />

                  {/* Category Chip */}
                  <div className="absolute top-3 left-3 bg-[#ffffff]/90 backdrop-blur-xs text-[#845050] text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-[#c98b8b]/30">
                    {product.category}
                  </div>

                  {/* PDF Format Badge */}
                  <div className="absolute top-3 right-3 bg-[#3b4349]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center space-x-1 shadow-xs">
                    <FileText className="w-3 h-3 text-[#7ea8a4]" />
                    <span>PDF</span>
                  </div>

                  {product.sourceType === 'uploaded' && (
                    <div className="absolute bottom-14 left-3 bg-[#7ea8a4] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs">
                      New Release
                    </div>
                  )}

                  {/* Quick Peek Button */}
                  <button
                    onClick={() => onReadSample(product)}
                    className="absolute inset-x-4 bottom-4 bg-[#3b4349]/90 hover:bg-[#3b4349] backdrop-blur-sm text-[#faf8f5] text-xs font-semibold py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Read Free Sample</span>
                  </button>
                </div>

                {/* Rating & CME */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center space-x-1 text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold text-[#3b4349]">{product.rating.toFixed(2)}</span>
                    <span className="text-[#717977]">({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})</span>
                  </div>
                  {product.cmeCredits ? (
                    <span className="text-[11px] font-semibold text-[#7ea8a4] bg-[#7ea8a4]/15 px-2 py-0.5 rounded">
                      {product.cmeCredits} CME Credits
                    </span>
                  ) : null}
                </div>

                {/* Monograph Title & Subtitle */}
                <h3 className="font-sans text-lg font-semibold text-[#3b4349] leading-snug line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-xs text-[#575f66] mt-1 line-clamp-2">
                  {product.subtitle}
                </p>

                {/* Author Credential & Edition */}
                <div className="flex items-center space-x-2 mt-3 text-xs text-[#404847]">
                  <span className="font-medium truncate">By {product.author}</span>
                  <span>•</span>
                  <span className="text-[#717977] truncate">{product.editionVersion}</span>
                </div>

                {/* PDF Specifications */}
                <div className="mt-2.5 flex items-center gap-2 text-[11px] text-[#717977]">
                  <span className="bg-[#f4efe9] text-[#3b4349] font-semibold px-2 py-0.5 rounded">PDF Monograph</span>
                  <span>•</span>
                  <span>{product.pages} {product.pages === 1 ? 'page' : 'pages'}</span>
                  <span>•</span>
                  <span>{product.fileSizeMb} MB</span>
                </div>
              </div>

              {/* Bottom Section: Single PDF Price & Direct Actions */}
              <div className="mt-5 pt-4 border-t border-[#f4efe9]">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-xs text-[#717977] block">Instant PDF E-Book</span>
                    <span className="text-lg font-bold text-[#3b4349]">${product.price.toFixed(2)}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Instant Download
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onReadSample(product)}
                    aria-label={`Read sample of ${product.title}`}
                    className="w-full bg-[#f4efe9] hover:bg-[#eae4dc] text-[#3b4349] text-xs font-semibold py-2.5 rounded-lg border border-[#ddd7cd] flex items-center justify-center space-x-1 transition cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#7ea8a4]" />
                    <span>Sample</span>
                  </button>

                  <button
                    onClick={() => onAddToCart(product)}
                    aria-label={`Add ${product.title} PDF to Bag`}
                    className="w-full bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-1 transition shadow-xs cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add PDF to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
