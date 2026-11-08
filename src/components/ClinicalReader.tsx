import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  BookmarkCheck, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Plus, 
  Trash2, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Product, Chapter, UserProfile, UserNote } from '../types.ts';
import { calculateReadingProgress } from '../utils/shop-logic.ts';

interface ClinicalReaderProps {
  product: Product;
  currentUser: UserProfile | null;
  onBackToCatalog: () => void;
  onAddToCart: (product: Product, format: 'EPUB' | 'Hardcover') => void;
  onSyncUserData: (updated: Partial<UserProfile>) => void;
}

export const ClinicalReader: React.FC<ClinicalReaderProps> = ({
  product,
  currentUser,
  onBackToCatalog,
  onAddToCart,
  onSyncUserData
}) => {
  const [currentChapterIdx, setCurrentChapterIdx] = useState<number>(0);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [isNoteInputOpen, setIsNoteInputOpen] = useState<boolean>(false);
  const [scrollProgressFraction, setScrollProgressFraction] = useState<number>(0.2);

  const chapters = product.sampleChapters || [];
  const currentChapter: Chapter | undefined = chapters[currentChapterIdx];

  // Retrieve bookmark status
  const chapterId = currentChapter?.id || 'chap-1';
  const isBookmarked = currentUser?.bookmarks?.includes(chapterId) || false;

  // Track reading progress calculation
  const overallProgressPercent = calculateReadingProgress(
    currentChapterIdx,
    chapters.length,
    scrollProgressFraction
  );

  // Sync reading progress to backend on chapter change
  useEffect(() => {
    if (currentUser && currentChapter) {
      const updatedProgress = {
        ...currentUser.readingProgress,
        [product.id]: {
          chapterId: currentChapter.id,
          progressPercent: overallProgressPercent,
          lastReadAt: new Date().toISOString()
        }
      };
      onSyncUserData({ readingProgress: updatedProgress });
    }
  }, [currentChapterIdx, product.id]);

  const toggleBookmark = () => {
    if (!currentUser) return;
    const currentBookmarks = currentUser.bookmarks || [];
    const newBookmarks = isBookmarked
      ? currentBookmarks.filter(b => b !== chapterId)
      : [...currentBookmarks, chapterId];
    
    onSyncUserData({ bookmarks: newBookmarks });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !currentUser) return;

    const newNote: UserNote = {
      id: `note-${Date.now()}`,
      productId: product.id,
      chapterId: chapterId,
      text: newNoteText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedNotes = [...(currentUser.notes || []), newNote];
    onSyncUserData({ notes: updatedNotes });
    setNewNoteText('');
    setIsNoteInputOpen(false);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!currentUser) return;
    const updatedNotes = (currentUser.notes || []).filter(n => n.id !== noteId);
    onSyncUserData({ notes: updatedNotes });
  };

  const chapterNotes = (currentUser?.notes || []).filter(
    n => n.productId === product.id && n.chapterId === chapterId
  );

  const fontSizeClass = {
    sm: 'text-base leading-relaxed',
    base: 'text-lg leading-relaxed sm:text-[19px] sm:leading-8',
    lg: 'text-xl leading-relaxed sm:text-[22px] sm:leading-9'
  }[fontSize];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#3b4349] pb-24">
      {/* Top Clinical Reader Control Bar */}
      <div className="sticky top-20 z-30 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#3b4349]/10 py-3 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          <button
            onClick={onBackToCatalog}
            className="flex items-center space-x-1.5 text-xs font-semibold text-[#404847] hover:text-[#3b4349] bg-[#f4efe9] px-3 py-1.5 rounded-lg border border-[#ddd7cd] transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Compendium</span>
          </button>

          {/* Center Monograph Title & Chapter Navigator */}
          <div className="hidden sm:flex flex-col items-center max-w-sm truncate text-center">
            <span className="text-[11px] font-bold text-[#7ea8a4] tracking-wider uppercase truncate">
              {product.title}
            </span>
            <span className="text-xs font-serif italic text-[#575f66] truncate">
              {currentChapter ? `Chapter ${currentChapter.chapterNumber}: ${currentChapter.title}` : 'Sample'}
            </span>
          </div>

          {/* Reader Preferences & Actions */}
          <div className="flex items-center space-x-2">
            {/* Font Size Selector */}
            <div className="flex items-center bg-[#f4efe9] rounded-lg p-0.5 border border-[#ddd7cd]">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-1 text-xs font-serif ${fontSize === 'sm' ? 'bg-white rounded font-bold shadow-2xs' : 'text-[#717977]'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-1 text-xs font-serif ${fontSize === 'base' ? 'bg-white rounded font-bold shadow-2xs' : 'text-[#717977]'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-1 text-xs font-serif ${fontSize === 'lg' ? 'bg-white rounded font-bold shadow-2xs' : 'text-[#717977]'}`}
              >
                A+
              </button>
            </div>

            {/* Bookmark button */}
            <button
              onClick={toggleBookmark}
              title={isBookmarked ? 'Bookmarked' : 'Add Bookmark'}
              className={`p-2 rounded-lg border transition ${
                isBookmarked
                  ? 'bg-[#c98b8b]/15 text-[#845050] border-[#c98b8b]'
                  : 'bg-[#f4efe9] text-[#717977] hover:text-[#3b4349] border-[#ddd7cd]'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Minimal Reading Progress Indicator (Soft Teal active bar) */}
        <div className="max-w-4xl mx-auto mt-2.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#717977] mb-1">
            <span>Reading Progress: {overallProgressPercent}% Complete</span>
            <span>{currentChapter?.readingTimeMinutes || 10} min read</span>
          </div>
          <div className="w-full h-1 bg-[#e5e0d8] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#7ea8a4] transition-all duration-300"
              style={{ width: `${overallProgressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Reading Surface (Optimal centered 740px line length) */}
      <main className="max-w-[740px] mx-auto px-5 sm:px-6 pt-10 sm:pt-14">
        
        {/* Monograph Header Citation Card */}
        <div className="border-b border-[#ebe6de] pb-8 mb-10">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#845050] uppercase tracking-wider mb-2">
            <span>{product.category}</span>
            <span>•</span>
            <span>{product.edition}</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-[#3b4349] leading-tight mb-3">
            {product.title}
          </h1>
          <p className="text-base sm:text-lg text-[#575f66] font-normal leading-relaxed mb-6">
            {product.subtitle}
          </p>

          {/* Author Citation block with Dr. Oluremi Ilupeju */}
          <div className="flex items-center space-x-3.5 bg-[#f4efe9] p-3.5 rounded-xl border border-[#ebe6de]">
            <img
              src={product.authorAvatar}
              alt={product.author}
              className="w-11 h-11 rounded-full object-cover object-top ring-2 ring-[#c98b8b]"
            />
            <div>
              <p className="text-xs font-bold text-[#3b4349]">
                {product.author}, {product.authorTitle}
              </p>
              <p className="text-[11px] text-[#575f66]">
                {product.authorCredentials}
              </p>
            </div>
          </div>
        </div>

        {/* Chapter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 border-b border-[#ebe6de] no-scrollbar">
          {chapters.map((chap, idx) => (
            <button
              key={chap.id}
              onClick={() => {
                setCurrentChapterIdx(idx);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                currentChapterIdx === idx
                  ? 'bg-[#3b4349] text-white shadow-xs'
                  : 'bg-[#f4efe9] text-[#404847] hover:bg-[#eae4dc]'
              }`}
            >
              Ch. {chap.chapterNumber}: {chap.title.slice(0, 24)}...
            </button>
          ))}
        </div>

        {/* Current Chapter Content */}
        {currentChapter ? (
          <article className="space-y-8">
            <header className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7ea8a4]">
                Chapter {currentChapter.chapterNumber}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#3b4349] leading-snug">
                {currentChapter.title}
              </h2>
              <p className="text-sm font-serif italic text-[#575f66]">
                {currentChapter.subtitle}
              </p>
            </header>

            {/* Paragraphs in Source Serif 4 */}
            <div className={`space-y-6 font-serif text-[#3b4349] ${fontSizeClass}`}>
              {currentChapter.content.map((paragraph, pIdx) => (
                <p key={pIdx} className="leading-relaxed text-justify">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Medical Note / Insight Callouts */}
            {currentChapter.medicalNotes && currentChapter.medicalNotes.length > 0 && (
              <div className="space-y-4 my-8">
                {currentChapter.medicalNotes.map(note => (
                  <div
                    key={note.id}
                    className="bg-[#7ea8a4]/10 border-l-4 border-[#7ea8a4] p-4 sm:p-5 rounded-r-xl shadow-2xs space-y-2"
                  >
                    <div className="flex items-center space-x-2 text-xs font-bold text-[#3b4349]">
                      <Sparkles className="w-4 h-4 text-[#7ea8a4]" />
                      <span className="uppercase tracking-wider">{note.badge}</span>
                      <span>—</span>
                      <span className="text-[#3b4349] font-sans font-semibold">{note.title}</span>
                    </div>
                    <p className="text-sm text-[#404847] font-sans leading-relaxed">
                      {note.content}
                    </p>
                    <p className="text-xs text-[#717977] font-sans italic pt-1 border-t border-[#7ea8a4]/20">
                      Citation: {note.citation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Clinical Notes Section (Real-Time Synchronized to Backend API) */}
            <div className="mt-12 pt-8 border-t border-[#ebe6de] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#7ea8a4]" />
                  <h3 className="font-serif text-base font-bold text-[#3b4349]">
                    My Clinical Notes & Annotations ({chapterNotes.length})
                  </h3>
                </div>
                <button
                  onClick={() => setIsNoteInputOpen(!isNoteInputOpen)}
                  className="text-xs font-semibold text-[#3b4349] hover:text-[#2a3035] flex items-center space-x-1 bg-[#f4efe9] px-3 py-1 rounded-lg border border-[#ddd7cd]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#7ea8a4]" />
                  <span>Add Clinical Annotation</span>
                </button>
              </div>

              {isNoteInputOpen && (
                <form onSubmit={handleAddNote} className="bg-[#f4efe9] p-4 rounded-xl border border-[#ebe6de] space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Record clinical impressions, dosage queries, or patient references (synced automatically)..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="w-full p-3 text-xs bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsNoteInputOpen(false)}
                      className="px-3 py-1.5 text-xs text-[#575f66] hover:text-[#3b4349]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-4 py-1.5 text-xs font-semibold bg-[#7ea8a4] hover:bg-[#6d9793] text-white rounded-lg disabled:opacity-50"
                    >
                      Save & Sync Note
                    </button>
                  </div>
                </form>
              )}

              {chapterNotes.length > 0 && (
                <div className="space-y-2">
                  {chapterNotes.map(n => (
                    <div key={n.id} className="p-3 bg-white rounded-xl border border-[#ebe6de] flex items-start justify-between text-xs">
                      <div>
                        <p className="text-[#3b4349] font-medium leading-relaxed">{n.text}</p>
                        <span className="text-[10px] text-[#717977] mt-1 block">
                          Recorded {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Cloud Synced
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="text-[#717977] hover:text-rose-600 p-1"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Chapter Navigation & Purchase Banner */}
            <div className="pt-10 border-t border-[#ebe6de] space-y-6">
              <div className="flex items-center justify-between">
                <button
                  disabled={currentChapterIdx === 0}
                  onClick={() => {
                    setCurrentChapterIdx(prev => prev - 1);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="flex items-center space-x-1.5 text-xs font-semibold px-4 py-2 bg-[#f4efe9] hover:bg-[#eae4dc] text-[#404847] rounded-lg disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Chapter</span>
                </button>

                <span className="text-xs font-medium text-[#717977]">
                  {currentChapterIdx + 1} of {chapters.length} Chapters
                </span>

                <button
                  disabled={currentChapterIdx === chapters.length - 1}
                  onClick={() => {
                    setCurrentChapterIdx(prev => prev + 1);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="flex items-center space-x-1.5 text-xs font-semibold px-4 py-2 bg-[#f4efe9] hover:bg-[#eae4dc] text-[#404847] rounded-lg disabled:opacity-40"
                >
                  <span>Next Chapter</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Purchase Full Monograph Callout Banner */}
              <div className="bg-[#f4efe9] border border-[#ddd7cd] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold text-[#845050] tracking-wider uppercase">
                    GyneWell Care & Wellness Monograph
                  </span>
                  <h4 className="font-serif text-xl font-bold text-[#3b4349] mt-1">
                    Acquire the Complete Monograph
                  </h4>
                  <p className="text-xs sm:text-sm text-[#575f66] mt-1 max-w-md">
                    Unlock all {product.pages} pages, 18 CME credits, full diagnostic protocols, and high-resolution anatomical plates.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onAddToCart(product, 'EPUB')}
                    className="px-4 py-2.5 bg-white border border-[#c98b8b] text-[#845050] hover:bg-[#c98b8b]/10 text-xs font-bold rounded-lg whitespace-nowrap"
                  >
                    Digital EPUB (${product.digitalPrice.toFixed(2)})
                  </button>
                  <button
                    onClick={() => onAddToCart(product, 'Hardcover')}
                    className="px-4 py-2.5 bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 whitespace-nowrap shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Hardcover (${product.price.toFixed(2)})</span>
                  </button>
                </div>
              </div>

            </div>

          </article>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm text-[#575f66]">No sample chapter currently loaded.</p>
          </div>
        )}

      </main>
    </div>
  );
};
