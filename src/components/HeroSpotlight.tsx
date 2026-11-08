import React from 'react';
import { BookOpen, ShoppingBag, Award, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { Product } from '../types.ts';

interface HeroSpotlightProps {
  featuredProduct: Product;
  onReadSample: (product: Product) => void;
  onAddToCart: (product: Product, format: 'Hardcover' | 'EPUB') => void;
}

export const HeroSpotlight: React.FC<HeroSpotlightProps> = ({
  featuredProduct,
  onReadSample,
  onAddToCart
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f4efe9] to-[#faf8f5] border-b border-[#3b4349]/10 pt-8 pb-14 lg:pt-12 lg:pb-18">
      
      {/* Brand Identity Banner Element */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-[#ebe6de] p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between shadow-2xs gap-3">
          <div className="flex items-center space-x-3">
            <img
              src="/assets/aistudio/GyneWell_dp_1d15eb01.png"
              alt="GyneWell Submark"
              className="w-10 h-10 object-contain"
            />
            <div>
              <span className="font-serif font-bold text-[#3b4349] text-base">
                GyneWell Care & Wellness
              </span>
              <p className="text-xs text-[#717977] font-medium">
                Care You Trust, Wellness You Deserve • For Her. For Health. For Life.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="bg-[#7ea8a4]/15 text-[#3b4349] px-3 py-1 rounded-full border border-[#7ea8a4]/30">
              Dr. Oluremi Ilupeju, MD, FACOG
            </span>
            <span className="bg-[#c98b8b]/15 text-[#845050] px-3 py-1 rounded-full border border-[#c98b8b]/30 hidden md:inline-block">
              Clinical Monograph Series
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Information & Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-[#c98b8b]/15 text-[#845050] border border-[#c98b8b]/30">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-[#c98b8b]" />
                Featured Clinical Monograph
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-[#7ea8a4]/15 text-[#3b4349] border border-[#7ea8a4]/30">
                <Award className="w-3.5 h-3.5 mr-1 text-[#7ea8a4]" />
                {featuredProduct.cmeCredits} AMA PRA Category 1 Credits™
              </span>
              <span className="text-xs text-[#575f66] font-medium">
                {featuredProduct.edition}
              </span>
            </div>

            {/* Monograph Title & Subtitle */}
            <div className="space-y-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#3b4349] leading-tight">
                {featuredProduct.title}
              </h1>
              <p className="text-base sm:text-lg text-[#575f66] leading-relaxed max-w-2xl font-normal">
                {featuredProduct.subtitle}
              </p>
            </div>

            {/* Author Citation Block (Delicate double-ring in rose quartz featuring real portrait) */}
            <div className="flex items-center space-x-4 bg-[#ffffff]/90 backdrop-blur-sm p-3.5 rounded-xl border border-[#ebe6de] shadow-xs max-w-xl">
              <div className="relative p-0.5 rounded-full ring-2 ring-[#c98b8b] ring-offset-2 ring-offset-[#faf8f5] flex-shrink-0">
                <img
                  src={featuredProduct.authorAvatar}
                  alt={featuredProduct.author}
                  className="w-13 h-13 rounded-full object-cover object-top"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-[#3b4349]">
                    {featuredProduct.author}, {featuredProduct.authorTitle}
                  </h3>
                  <CheckCircle2 className="w-4 h-4 text-[#7ea8a4]" />
                </div>
                <p className="text-xs text-[#575f66] truncate">
                  {featuredProduct.authorCredentials}
                </p>
              </div>
            </div>

            {/* Synopsis paragraph */}
            <p className="text-sm sm:text-base text-[#575f66] leading-relaxed font-normal">
              {featuredProduct.synopsis}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => onAddToCart(featuredProduct, 'Hardcover')}
                className="inline-flex items-center justify-center bg-[#7ea8a4] hover:bg-[#6d9793] text-[#faf8f5] text-sm font-semibold px-6 py-3 rounded-lg shadow-sm transition hover:shadow-md"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span>Order Monograph (${featuredProduct.price.toFixed(2)})</span>
              </button>

              <button
                onClick={() => onAddToCart(featuredProduct, 'EPUB')}
                className="inline-flex items-center justify-center bg-[#faf8f5] hover:bg-[#c98b8b]/10 text-[#845050] border border-[#c98b8b] text-sm font-semibold px-5 py-3 rounded-lg transition"
              >
                <span>Instant EPUB (${featuredProduct.digitalPrice.toFixed(2)})</span>
              </button>

              <button
                onClick={() => onReadSample(featuredProduct)}
                className="inline-flex items-center text-[#3b4349] hover:text-[#2a3035] text-sm font-semibold px-3 py-3 border-b-2 border-transparent hover:border-[#3b4349] transition"
              >
                <BookOpen className="w-4 h-4 mr-1.5 text-[#7ea8a4]" />
                <span>Read Free Sample Chapter</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {/* Peer Review Callout Quote */}
            <div className="pt-2">
              <blockquote className="border-l-2 border-[#7ea8a4] pl-4 italic font-serif text-sm text-[#404847]">
                "{featuredProduct.peerReviewQuote}"
                <footer className="mt-1 text-xs not-italic font-sans text-[#717977] font-medium">
                  — {featuredProduct.peerReviewSource}
                </footer>
              </blockquote>
            </div>

          </div>

          {/* Right Column: Visual Book Stand & Cover */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">
              
              {/* Soft ambient blur backdrop */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#7ea8a4]/20 to-[#c98b8b]/20 rounded-3xl filter blur-2xl opacity-60"></div>

              {/* Monograph Card Container */}
              <div className="relative bg-[#ffffff] border border-[#ebe6de] rounded-2xl p-5 shadow-lg">
                
                {/* Book Cover Image with physical spine treatment */}
                <div className="relative rounded-xl overflow-hidden aspect-[3/4] shadow-md group">
                  <img
                    src={featuredProduct.coverImage}
                    alt={featuredProduct.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  
                  {/* Subtle spine gradient overlay */}
                  <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/35 via-black/10 to-transparent pointer-events-none"></div>
                  
                  {/* Brand Submark Stamp Overlay */}
                  <div className="absolute top-3 left-3 bg-[#ffffff]/90 backdrop-blur-xs p-1 rounded-full shadow-xs">
                    <img
                      src="/assets/aistudio/GyneWell_dp_1d15eb01.png"
                      alt="GyneWell Seal"
                      className="w-8 h-8 object-contain"
                    />
                  </div>

                  {/* Digital Badge */}
                  <div className="absolute top-3 right-3 bg-[#3b4349]/90 backdrop-blur-md text-[#faf8f5] text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs">
                    Print & Digital
                  </div>

                  {/* Quick Reader Button Overlay on Hover */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-95">
                    <div>
                      <p className="text-white text-xs font-semibold">{featuredProduct.pages} Pages • Indexed</p>
                      <p className="text-[#a4cfca] text-[11px]">{featuredProduct.sampleChapters.length} Clinical Chapters Available</p>
                    </div>
                    <button
                      onClick={() => onReadSample(featuredProduct)}
                      className="bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 mr-1" />
                      Read
                    </button>
                  </div>
                </div>

                {/* Micro meta details */}
                <div className="mt-4 pt-3 border-t border-[#f4efe9] flex items-center justify-between text-xs text-[#575f66]">
                  <span>ISBN: {featuredProduct.isbn}</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    In Stock ({featuredProduct.stock} left)
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
