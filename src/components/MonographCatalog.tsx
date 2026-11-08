import React, { useState } from 'react';
import { BookOpen, ShoppingBag, Star, AlertCircle, Eye } from 'lucide-react';
import { Product, FormatType } from '../types.ts';

interface MonographCatalogProps {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onReadSample: (product: Product) => void;
  onAddToCart: (product: Product, format: FormatType) => void;
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
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<string>('All');
  const [quickAddModalProduct, setQuickAddModalProduct] = useState<Product | null>(null);
  const [chosenFormat, setChosenFormat] = useState<FormatType>('Hardcover');

  // Filter products by category, search, and format
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = selectedFormatFilter === 'All' || p.formats.includes(selectedFormatFilter as FormatType);
    return matchesCategory && matchesSearch && matchesFormat;
  });

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#7ea8a4] mb-1.5">
            <span>GyneWell Peer-Reviewed Compendium</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#3b4349]">
            Clinical Monographs & Maternal Health Guides
          </h2>
          <p className="text-sm text-[#575f66] mt-1 max-w-xl">
            Authored & directed by Dr. Oluremi Ilupeju, MD, FACOG and collaborating clinician-scientists.
          </p>
        </div>

        {/* Format Quick Filter Toggle */}
        <div className="flex items-center space-x-1.5 bg-[#f4efe9] p-1 rounded-xl border border-[#ebe6de] text-xs">
          {['All', 'Hardcover', 'EPUB', 'Paperback'].map(format => (
            <button
              key={format}
              onClick={() => setSelectedFormatFilter(format)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                selectedFormatFilter === format
                  ? 'bg-[#ffffff] text-[#3b4349] shadow-xs'
                  : 'text-[#575f66] hover:text-[#3b4349]'
              }`}
            >
              {format === 'All' ? 'All Editions' : format}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
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
          <h3 className="font-serif text-lg font-semibold text-[#3b4349]">No monographs match your query</h3>
          <p className="text-xs text-[#575f66] mt-1">Try resetting the category filter or searching for another keyword.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setSelectedFormatFilter('All'); }}
            className="mt-4 bg-[#7ea8a4] text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map(product => {
            const isLowStock = product.stock <= product.lowStockThreshold;
            return (
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

                    {/* Stock Alert Badge */}
                    {isLowStock && (
                      <div className="absolute top-3 right-3 bg-[#c98b8b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>Only {product.stock} left</span>
                      </div>
                    )}

                    {/* Quick Peek Button */}
                    <button
                      onClick={() => onReadSample(product)}
                      className="absolute inset-x-4 bottom-4 bg-[#3b4349]/90 hover:bg-[#3b4349] backdrop-blur-sm text-[#faf8f5] text-xs font-semibold py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5 shadow-sm"
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
                      <span className="text-[#717977]">({product.reviewCount})</span>
                    </div>
                    {product.cmeCredits && (
                      <span className="text-[11px] font-semibold text-[#7ea8a4] bg-[#7ea8a4]/15 px-2 py-0.5 rounded">
                        {product.cmeCredits} CME Credits
                      </span>
                    )}
                  </div>

                  {/* Monograph Title & Subtitle */}
                  <h3 className="font-serif text-lg font-semibold text-[#3b4349] leading-snug line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-xs text-[#575f66] mt-1 line-clamp-2">
                    {product.subtitle}
                  </p>

                  {/* Author Credential */}
                  <div className="flex items-center space-x-2 mt-3 text-xs text-[#404847]">
                    <span className="font-medium">By {product.author}</span>
                    <span>•</span>
                    <span className="text-[#717977]">{product.edition}</span>
                  </div>
                </div>

                {/* Bottom Section: Formats, Pricing & Actions */}
                <div className="mt-5 pt-4 border-t border-[#f4efe9]">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-xs text-[#717977] block">Hardcover & Print</span>
                      <span className="text-lg font-bold text-[#3b4349]">${product.price.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#717977] block">Digital EPUB</span>
                      <span className="text-sm font-semibold text-[#7ea8a4]">${product.digitalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onReadSample(product)}
                      className="w-full bg-[#f4efe9] hover:bg-[#eae4dc] text-[#3b4349] text-xs font-semibold py-2.5 rounded-lg border border-[#ddd7cd] flex items-center justify-center space-x-1 transition"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#7ea8a4]" />
                      <span>Sample</span>
                    </button>

                    <button
                      onClick={() => {
                        setQuickAddModalProduct(product);
                        setChosenFormat(product.formats[0] || 'Hardcover');
                      }}
                      className="w-full bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-1 transition shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Format Modal */}
      {quickAddModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#faf8f5] border border-[#ebe6de] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#7ea8a4] uppercase tracking-wider">Select Edition</span>
                <h3 className="font-serif text-lg font-bold text-[#3b4349] mt-0.5">{quickAddModalProduct.title}</h3>
                <p className="text-xs text-[#575f66]">By {quickAddModalProduct.author}</p>
              </div>
              <button
                onClick={() => setQuickAddModalProduct(null)}
                className="text-[#717977] hover:text-[#3b4349] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {quickAddModalProduct.formats.map(format => {
                const price = format === 'EPUB' ? quickAddModalProduct.digitalPrice : quickAddModalProduct.price;
                const isSelected = chosenFormat === format;
                return (
                  <div
                    key={format}
                    onClick={() => setChosenFormat(format)}
                    className={`cursor-pointer p-3 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'border-[#7ea8a4] bg-[#7ea8a4]/10 shadow-xs'
                        : 'border-[#ddd7cd] bg-white hover:bg-[#f4efe9]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#3b4349] bg-[#3b4349]' : 'border-[#c0c8c6]'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#3b4349]">
                          {format === 'EPUB' ? 'Digital EPUB & PDF (Instant Access)' : `${format} Printed Edition`}
                        </p>
                        <p className="text-xs text-[#575f66]">
                          {format === 'EPUB' ? 'Synchronized with GyneWell Clinical Reader' : `Estimated delivery 2-4 days (${quickAddModalProduct.stock} in stock)`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#3b4349]">${price.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex space-x-3">
              <button
                onClick={() => setQuickAddModalProduct(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-[#575f66] bg-[#efeeeb] hover:bg-[#eae8e5] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onAddToCart(quickAddModalProduct, chosenFormat);
                  setQuickAddModalProduct(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-[#7ea8a4] hover:bg-[#6d9793] rounded-lg flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Confirm & Add to Bag</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
