import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  RefreshCw,
  Upload,
  Edit3,
  Check,
  Download,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  X,
  ArrowRight,
  Layers
} from 'lucide-react';
import type { Product, AdminMetrics, UserProfile, ParsedPdfDraft, ProductCategory } from '../types.ts';
import { formatCurrency } from '../utils/shop-logic.ts';

const COVER_PRESETS = [
  {
    label: 'Editorial Maternal Botanical',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800'
  },
  {
    label: 'Clinical Research Monograph',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800'
  },
  {
    label: 'Endocrine & Hormonal Press',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800'
  },
  {
    label: 'Clinical Nutrition & Wellness',
    url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800'
  }
];

const CATEGORIES: ProductCategory[] = [
  'Maternal Health',
  'Endocrine & Hormonal',
  'Pelvic Health',
  'Clinical Nutrition',
  'Perinatal Neurobiology',
  'Pediatric Transitions'
];

interface AdminPanelProps {
  currentUser: UserProfile | null;
  onLoginAsMasterAdmin: () => void;
  products: Product[];
  onUpdateProductCatalog: (id: string, updates: { price?: number; editionVersion?: string }) => Promise<void>;
  onPublishedPdfProduct: (product: Product) => Promise<void>;
  onViewInStorefront: () => void;
  onPreviewProductInReader: (product: Product) => void;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onLoginAsMasterAdmin,
  products,
  onUpdateProductCatalog,
  onPublishedPdfProduct,
  onViewInStorefront,
  onPreviewProductInReader,
  onRefreshData
}) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);
  const [editVersionVal, setEditVersionVal] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // PDF Upload -> Parse -> Review -> Publish workflow state
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [workflowStep, setWorkflowStep] = useState<'upload' | 'review' | 'published'>('upload');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isParsingPdf, setIsParsingPdf] = useState<boolean>(false);
  const [isPublishingPdf, setIsPublishingPdf] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [parsedDraft, setParsedDraft] = useState<ParsedPdfDraft | null>(null);
  const [publishedProduct, setPublishedProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Editable review form fields populated by PDF parser
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewSubtitle, setReviewSubtitle] = useState<string>('');
  const [reviewAuthor, setReviewAuthor] = useState<string>('');
  const [reviewCategory, setReviewCategory] = useState<ProductCategory>('Maternal Health');
  const [reviewPrice, setReviewPrice] = useState<number>(28.00);
  const [reviewVersion, setReviewVersion] = useState<string>('');
  const [reviewIsbn, setReviewIsbn] = useState<string>('');
  const [reviewCmeCredits, setReviewCmeCredits] = useState<number>(12);
  const [reviewSynopsis, setReviewSynopsis] = useState<string>('');
  const [reviewCover, setReviewCover] = useState<string>(COVER_PRESETS[0].url);

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

  const resetUploadModal = () => {
    setWorkflowStep('upload');
    setUploadError('');
    setParsedDraft(null);
    setPublishedProduct(null);
    setIsParsingPdf(false);
    setIsPublishingPdf(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openUploadModal = () => {
    resetUploadModal();
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    resetUploadModal();
  };

  const handlePdfFileSelected = async (file: File | null | undefined) => {
    if (!file) return;
    setUploadError('');

    // Strict client-side PDF check before hitting server
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
    const isPdfMime =
      !file.type ||
      file.type === 'application/pdf' ||
      file.type === 'application/x-pdf' ||
      file.type === 'application/octet-stream';

    if (!isPdfExt || !isPdfMime) {
      setUploadError('Only PDF (.pdf) e-books are accepted. Non-PDF file types cannot be uploaded.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsParsingPdf(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/ebooks/parse', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!res.ok || !data.success || !data.parsed) {
        setUploadError(data.error || 'Could not parse the uploaded PDF file.');
        return;
      }

      const draft: ParsedPdfDraft = data.parsed;
      setParsedDraft(draft);
      setReviewTitle(draft.title);
      setReviewSubtitle(draft.subtitle);
      setReviewAuthor(draft.author);
      setReviewCategory(draft.category);
      setReviewPrice(draft.suggestedPrice);
      setReviewVersion(draft.editionVersion);
      setReviewIsbn(draft.isbn);
      setReviewCmeCredits(draft.cmeCredits);
      setReviewSynopsis(draft.synopsis);
      setReviewCover(COVER_PRESETS[0].url);
      setWorkflowStep('review');
    } catch {
      setUploadError('Network error while uploading and parsing the PDF file.');
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handlePublishParsedPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedDraft) return;
    if (!reviewTitle.trim()) {
      setUploadError('Please provide a monograph title before posting.');
      return;
    }
    if (!Number.isFinite(Number(reviewPrice)) || Number(reviewPrice) <= 0) {
      setUploadError('Please set a valid PDF price greater than $0.00.');
      return;
    }

    setUploadError('');
    setIsPublishingPdf(true);

    try {
      const res = await fetch('/api/admin/ebooks/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId: parsedDraft.uploadId,
          title: reviewTitle.trim(),
          subtitle: reviewSubtitle.trim(),
          author: reviewAuthor.trim(),
          category: reviewCategory,
          price: Number(reviewPrice),
          editionVersion: reviewVersion.trim(),
          isbn: reviewIsbn.trim(),
          cmeCredits: Number(reviewCmeCredits),
          synopsis: reviewSynopsis.trim(),
          coverImage: reviewCover,
          tableOfContents: parsedDraft.tableOfContents,
          sampleChapters: parsedDraft.sampleChapters
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.product) {
        setUploadError(data.error || 'Unable to publish the parsed PDF e-book.');
        return;
      }

      setPublishedProduct(data.product);
      await onPublishedPdfProduct(data.product);
      await fetchMetrics();
      setWorkflowStep('published');
    } catch {
      setUploadError('Network error while posting the e-book to the storefront.');
    } finally {
      setIsPublishingPdf(false);
    }
  };

  const handleSaveCatalog = async (prodId: string) => {
    setIsUpdating(true);
    await onUpdateProductCatalog(prodId, {
      price: editPriceVal || undefined,
      editionVersion: editVersionVal || undefined
    });
    setEditId(null);
    setIsUpdating(false);
    fetchMetrics();
  };

  const filteredProducts = products.filter(p =>
    !searchTerm ||
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.pdfFileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isMasterAdmin || !currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#3b4349]/10 text-[#3b4349] flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6 text-[#7ea8a4]" />
        </div>
        <h1 className="font-sans text-xl font-bold text-[#3b4349]">
          Administrator Sign-In Required
        </h1>
        <p className="text-sm text-[#575f66]">
          The GyneWell Admin Panel is only available to authenticated administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Admin Master Header Banner */}
      <div className="bg-[#3b4349] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-[#3b4349]/20">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-[#7ea8a4] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
              Medical Director Console
            </span>
            <span className="text-xs text-[#a4cfca]">PDF-Only Clinical Publishing</span>
          </div>
          <h1 className="font-sans text-xl sm:text-2xl font-bold">
            PDF E-Book Publishing & Sales Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-[#cbd5e1] max-w-2xl">
            Upload peer-reviewed PDF monographs, automatically parse chapters and clinical metadata, and post directly to the GyneWell customer storefront.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-emerald-900/60 border border-emerald-500/40 px-3.5 py-1.5 rounded-lg text-xs font-medium text-emerald-200 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Master Admin: <strong>{currentUser.email}</strong></span>
          </div>

          <button
            onClick={openUploadModal}
            className="bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload & Publish PDF</span>
          </button>

          <button
            onClick={() => { fetchMetrics(); onRefreshData(); }}
            className="p-2.5 bg-[#2a3035] hover:bg-[#1f2428] text-[#7ea8a4] rounded-lg text-xs transition border border-[#7ea8a4]/30 cursor-pointer"
            title="Refresh Live Data"
            aria-label="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingMetrics ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Real-time Sales & PDF Library Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

          <div className="bg-white p-5 rounded-2xl border border-[#ebe6de] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#575f66]">
              <span className="font-semibold uppercase tracking-wider">Gross PDF Revenue</span>
              <DollarSign className="w-4 h-4 text-[#7ea8a4]" />
            </div>
            <div className="text-2xl font-sans font-bold text-[#3b4349]">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <div className="flex items-center text-xs text-emerald-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              <span>+{metrics.salesGrowthPercent}% vs prior month</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#ebe6de] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#575f66]">
              <span className="font-semibold uppercase tracking-wider">Completed Orders</span>
              <ShoppingBag className="w-4 h-4 text-[#7ea8a4]" />
            </div>
            <div className="text-2xl font-sans font-bold text-[#3b4349]">
              {metrics.ordersCount} Completed
            </div>
            <p className="text-xs text-[#717977]">
              Avg. order {formatCurrency(metrics.averageOrderValue)} • Instant PDF
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#ebe6de] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#575f66]">
              <span className="font-semibold uppercase tracking-wider">PDF Licenses Issued</span>
              <Download className="w-4 h-4 text-[#7ea8a4]" />
            </div>
            <div className="text-2xl font-sans font-bold text-[#3b4349]">
              {metrics.totalLicensesIssued.toLocaleString()}
            </div>
            <p className="text-xs text-[#717977]">
              ~{metrics.totalDownloads.toLocaleString()} PDF downloads served
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#ebe6de] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#575f66]">
              <span className="font-semibold uppercase tracking-wider">Active PDF Catalog</span>
              <FileText className="w-4 h-4 text-[#c98b8b]" />
            </div>
            <div className="text-2xl font-sans font-bold text-[#3b4349]">
              {metrics.totalPdfTitles} <span className="text-sm font-sans font-normal text-[#575f66]">PDF Titles</span>
            </div>
            <p className="text-xs font-semibold text-[#575f66]">
              {metrics.totalPdfPages.toLocaleString()} pages • {metrics.totalUploadedPdfs} uploaded via Admin
            </p>
          </div>

        </div>
      )}

      {/* Live Sales Velocity & Clinical Specialty Breakdown */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#ebe6de] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-sans text-lg font-bold text-[#3b4349]">
                  Live Sales Velocity & Trend
                </h3>
                <p className="text-xs text-[#575f66]">Daily PDF monograph revenue synchronized from backend API</p>
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
                    <span className="text-[#7ea8a4] font-bold">{formatCurrency(day.amount)} ({day.orders} {day.orders === 1 ? 'order' : 'orders'})</span>
                  </div>
                  <div className="w-full h-3 bg-[#f4efe9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7ea8a4] to-[#6d9793] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(12, (day.amount / (metrics.totalRevenue || 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PDF Specialty Distribution & Format Standard */}
          <div className="bg-white p-6 rounded-2xl border border-[#ebe6de] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-sans text-lg font-bold text-[#3b4349]">
                  PDF Sales by Specialty
                </h3>
                <p className="text-xs text-[#575f66]">100% standardized PDF fulfillment</p>
              </div>
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#845050] bg-[#c98b8b]/15 px-2.5 py-1 rounded-md border border-[#c98b8b]/30">
                <FileText className="w-3 h-3" />
                <span>PDF Only</span>
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {metrics.categoryBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#3b4349] truncate pr-2">{item.category}</span>
                    <span className="font-mono text-[#575f66] whitespace-nowrap">
                      {formatCurrency(item.sales)} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#f4efe9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3b4349] rounded-full"
                      style={{ width: `${Math.max(8, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#f4efe9] flex items-center justify-between text-xs text-[#575f66]">
              <span>Active Readers Now:</span>
              <strong className="text-[#3b4349]">{metrics.activeReadersNow} Live</strong>
            </div>
          </div>

        </div>
      )}

      {/* PDF Publications & License Catalog Table */}
      <div className="bg-white rounded-2xl border border-[#ebe6de] shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-[#ebe6de] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-sans text-xl font-bold text-[#3b4349]">
              Published PDF E-Books Catalog
            </h3>
            <p className="text-xs text-[#575f66]">Upload new PDF manuscripts, adjust pricing, or download verified PDFs</p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Filter by title, ISBN, PDF name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs p-2 bg-[#f4efe9] border border-[#ddd7cd] rounded-lg focus:outline-none focus:border-[#7ea8a4] w-48 sm:w-64"
            />

            <button
              onClick={openUploadModal}
              className="bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload PDF E-Book</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4efe9] text-[#3b4349] font-bold uppercase tracking-wider border-b border-[#ebe6de]">
              <tr>
                <th className="py-3 px-4">PDF Publication</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">PDF Price</th>
                <th className="py-3 px-4">File Specs & Edition</th>
                <th className="py-3 px-4">Licenses Issued</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebe6de]">
              {filteredProducts.map(prod => {
                const isEditing = editId === prod.id;

                return (
                  <tr key={prod.id} className="hover:bg-[#faf8f5]/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={prod.coverImage}
                          alt={prod.title}
                          className="w-9 h-12 object-cover rounded-md bg-[#f4efe9] flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <p className="font-sans font-bold text-[#3b4349] truncate">{prod.title}</p>
                            <span className="text-[10px] font-bold bg-[#3b4349] text-white px-1.5 py-0.5 rounded">PDF</span>
                            {prod.sourceType === 'uploaded' && (
                              <span className="text-[10px] font-bold bg-[#7ea8a4]/20 text-[#3b4349] px-1.5 py-0.5 rounded">Uploaded</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#575f66] truncate">
                            {prod.author} • <span className="font-mono">{prod.pdfFileName}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[#404847]">
                      <span className="bg-[#f4efe9] px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap">
                        {prod.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#3b4349]">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.5"
                          value={editPriceVal}
                          onChange={(e) => setEditPriceVal(Number(e.target.value))}
                          className="w-20 p-1 border border-[#ddd7cd] rounded text-xs font-bold"
                          aria-label={`Edit price for ${prod.title}`}
                        />
                      ) : (
                        <span className="font-bold">${prod.price.toFixed(2)}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editVersionVal}
                          onChange={(e) => setEditVersionVal(e.target.value)}
                          className="w-40 p-1 border border-[#ddd7cd] rounded text-xs"
                          aria-label={`Edit edition version for ${prod.title}`}
                        />
                      ) : (
                        <div>
                          <span className="font-semibold text-xs text-[#3b4349] block">{prod.editionVersion}</span>
                          <span className="text-[11px] text-[#717977]">
                            {prod.pages} {prod.pages === 1 ? 'page' : 'pages'} • {prod.fileSizeMb} MB
                            {prod.cmeCredits ? ` • ${prod.cmeCredits} CME` : ''}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-sm text-[#3b4349]">
                          {prod.licensesIssued.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {prod.activeReadersCount} active
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleSaveCatalog(prod.id)}
                            disabled={isUpdating}
                            className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                            title="Save changes"
                            aria-label="Save changes"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="text-xs text-[#717977] hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onPreviewProductInReader(prod)}
                            title="Preview parsed chapters in Reader"
                            aria-label={`Preview ${prod.title}`}
                            className="p-1.5 bg-[#f4efe9] hover:bg-[#eae4dc] text-[#3b4349] rounded-lg border border-[#ddd7cd] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={prod.pdfUrl || `/api/products/${prod.id}/pdf`}
                            download={prod.pdfFileName}
                            title={`Download ${prod.pdfFileName}`}
                            aria-label={`Download PDF ${prod.title}`}
                            className="p-1.5 bg-[#f4efe9] hover:bg-[#eae4dc] text-[#3b4349] rounded-lg border border-[#ddd7cd] cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => {
                              setEditId(prod.id);
                              setEditPriceVal(prod.price);
                              setEditVersionVal(prod.editionVersion);
                            }}
                            aria-label={`Edit ${prod.title}`}
                            className="inline-flex items-center space-x-1 text-xs font-semibold text-[#3b4349] bg-[#f4efe9] hover:bg-[#eae4dc] px-2.5 py-1.5 rounded-lg border border-[#ddd7cd] cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-[#7ea8a4]" />
                            <span>Edit</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-Step PDF Upload -> Parse -> Review & Post Modal */}
      {showUploadModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-upload-modal-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#faf8f5] border border-[#ebe6de] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-[#ebe6de] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#7ea8a4]/15 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#7ea8a4]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7ea8a4] block">
                    PDF-Only Publishing Pipeline
                  </span>
                  <h2 id="pdf-upload-modal-title" className="font-sans text-lg font-bold text-[#3b4349]">
                    Upload, Parse & Post PDF E-Book
                  </h2>
                </div>
              </div>
              <button
                onClick={closeUploadModal}
                aria-label="Close PDF upload dialog"
                className="text-[#717977] hover:text-[#3b4349] p-1.5 rounded-lg hover:bg-[#efeeeb] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicator Strip */}
            <div className="bg-[#f4efe9] px-6 py-3 border-b border-[#ebe6de] flex items-center justify-between text-xs">
              <div className={`flex items-center space-x-2 ${workflowStep === 'upload' ? 'font-bold text-[#3b4349]' : 'text-[#575f66]'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  workflowStep === 'upload' ? 'bg-[#7ea8a4] text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {workflowStep === 'upload' ? '1' : '✓'}
                </span>
                <span>1. Upload PDF File</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#a0a8a6]" />
              <div className={`flex items-center space-x-2 ${workflowStep === 'review' ? 'font-bold text-[#3b4349]' : 'text-[#575f66]'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  workflowStep === 'review'
                    ? 'bg-[#7ea8a4] text-white'
                    : workflowStep === 'published'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#ddd7cd] text-[#575f66]'
                }`}>
                  {workflowStep === 'published' ? '✓' : '2'}
                </span>
                <span>2. Review Parsed Metadata & Chapters</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#a0a8a6]" />
              <div className={`flex items-center space-x-2 ${workflowStep === 'published' ? 'font-bold text-[#3b4349]' : 'text-[#575f66]'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  workflowStep === 'published' ? 'bg-emerald-600 text-white' : 'bg-[#ddd7cd] text-[#575f66]'
                }`}>
                  3
                </span>
                <span>3. Live on Storefront</span>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {/* Inline Error Banner */}
              {uploadError && (
                <div
                  role="alert"
                  className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs text-rose-800"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* STEP 1: UPLOAD PDF */}
              {workflowStep === 'upload' && (
                <div className="space-y-5">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const droppedFile = e.dataTransfer.files?.[0];
                      handlePdfFileSelected(droppedFile);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition ${
                      isDragging
                        ? 'border-[#7ea8a4] bg-[#7ea8a4]/10'
                        : 'border-[#cfc8bc] bg-white hover:border-[#7ea8a4]'
                    }`}
                  >
                    {isParsingPdf ? (
                      <div className="space-y-3 py-4">
                        <div className="w-10 h-10 border-3 border-[#7ea8a4] border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="font-sans text-base font-bold text-[#3b4349]">
                          Parsing PDF Monograph...
                        </p>
                        <p className="text-xs text-[#575f66]">
                          Verifying PDF binary signature, counting pages, extracting clinical metadata, Table of Contents, and sample chapters.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#f4efe9] border border-[#ebe6de] flex items-center justify-center mx-auto">
                          <Upload className="w-7 h-7 text-[#7ea8a4]" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-sans text-base font-bold text-[#3b4349]">
                            Drop your clinical PDF e-book here
                          </p>
                          <p className="text-xs text-[#575f66] max-w-md mx-auto">
                            Strictly <strong>.pdf</strong> files only (up to 50 MB). The server parses pages, word count, title, author, ISBN, synopsis, and sample chapters automatically.
                          </p>
                        </div>

                        <div className="pt-2">
                          <input
                            ref={fileInputRef}
                            id="pdf-upload-input"
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(e) => handlePdfFileSelected(e.target.files?.[0])}
                            className="sr-only"
                          />
                          <label
                            htmlFor="pdf-upload-input"
                            className="inline-flex items-center space-x-2 bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Select PDF File to Upload & Parse</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-[#ebe6de] space-y-1">
                      <span className="font-bold text-[#3b4349] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#7ea8a4]" />
                        Strict PDF Validation
                      </span>
                      <p className="text-[11px] text-[#575f66]">Validates `.pdf` extension, MIME type, and binary `%PDF-` signature before parsing.</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-[#ebe6de] space-y-1">
                      <span className="font-bold text-[#3b4349] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#c98b8b]" />
                        Automated Extraction
                      </span>
                      <p className="text-[11px] text-[#575f66]">Extracts page count, file size, title, author, ISBN, specialty, TOC, and preview chapters.</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-[#ebe6de] space-y-1">
                      <span className="font-bold text-[#3b4349] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#7ea8a4]" />
                        Instant Storefront Post
                      </span>
                      <p className="text-[11px] text-[#575f66]">Review parsed details, set price, and publish for immediate customer preview & purchase.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: REVIEW PARSED PDF & EDIT BEFORE POSTING */}
              {workflowStep === 'review' && parsedDraft && (
                <form onSubmit={handlePublishParsedPdf} className="space-y-5">
                  {/* Parsed Telemetry Banner */}
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-900 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>PDF Verified & Parsed: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{parsedDraft.fileName}</code></span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#3b4349]">
                      <span className="bg-white px-2.5 py-1 rounded-md border border-[#ebe6de]">{parsedDraft.pages} {parsedDraft.pages === 1 ? 'Page' : 'Pages'}</span>
                      <span className="bg-white px-2.5 py-1 rounded-md border border-[#ebe6de]">{parsedDraft.fileSizeMb} MB</span>
                      <span className="bg-white px-2.5 py-1 rounded-md border border-[#ebe6de]">{parsedDraft.wordCount.toLocaleString()} Words</span>
                      <span className="bg-white px-2.5 py-1 rounded-md border border-[#ebe6de]">{parsedDraft.sampleChapters.length} {parsedDraft.sampleChapters.length === 1 ? 'Chapter' : 'Chapters'} Parsed</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                    {/* Left: Editable Listing Fields */}
                    <div className="lg:col-span-7 space-y-3">
                      <div>
                        <label htmlFor="parsed-title" className="block font-bold text-[#3b4349] mb-1">
                          E-Book Title (Parsed from PDF)
                        </label>
                        <input
                          id="parsed-title"
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          required
                          className="w-full p-2.5 bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349] font-semibold focus:outline-none focus:border-[#7ea8a4]"
                        />
                      </div>

                      <div>
                        <label htmlFor="parsed-subtitle" className="block font-bold text-[#3b4349] mb-1">
                          Subtitle / Clinical Scope
                        </label>
                        <input
                          id="parsed-subtitle"
                          type="text"
                          value={reviewSubtitle}
                          onChange={(e) => setReviewSubtitle(e.target.value)}
                          className="w-full p-2.5 bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="parsed-author" className="block font-bold text-[#3b4349] mb-1">
                            Author
                          </label>
                          <input
                            id="parsed-author"
                            type="text"
                            value={reviewAuthor}
                            onChange={(e) => setReviewAuthor(e.target.value)}
                            className="w-full p-2 bg-white border border-[#ddd7cd] rounded-lg focus:outline-none focus:border-[#7ea8a4]"
                          />
                        </div>
                        <div>
                          <label htmlFor="parsed-category" className="block font-bold text-[#3b4349] mb-1">
                            Clinical Specialty
                          </label>
                          <select
                            id="parsed-category"
                            value={reviewCategory}
                            onChange={(e) => setReviewCategory(e.target.value as ProductCategory)}
                            className="w-full p-2 bg-white border border-[#ddd7cd] rounded-lg focus:outline-none focus:border-[#7ea8a4]"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label htmlFor="parsed-price" className="block font-bold text-[#3b4349] mb-1">
                            PDF Price ($)
                          </label>
                          <input
                            id="parsed-price"
                            type="number"
                            step="0.5"
                            min="1"
                            value={reviewPrice}
                            onChange={(e) => setReviewPrice(Number(e.target.value))}
                            required
                            className="w-full p-2 bg-white border border-[#ddd7cd] rounded-lg font-bold text-[#3b4349] focus:outline-none focus:border-[#7ea8a4]"
                          />
                        </div>
                        <div>
                          <label htmlFor="parsed-cme" className="block font-bold text-[#3b4349] mb-1">
                            CME Credits
                          </label>
                          <input
                            id="parsed-cme"
                            type="number"
                            min="0"
                            value={reviewCmeCredits}
                            onChange={(e) => setReviewCmeCredits(Number(e.target.value))}
                            className="w-full p-2 bg-white border border-[#ddd7cd] rounded-lg focus:outline-none focus:border-[#7ea8a4]"
                          />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="parsed-isbn" className="block font-bold text-[#3b4349] mb-1">
                            ISBN
                          </label>
                          <input
                            id="parsed-isbn"
                            type="text"
                            value={reviewIsbn}
                            onChange={(e) => setReviewIsbn(e.target.value)}
                            className="w-full p-2 bg-white border border-[#ddd7cd] rounded-lg font-mono focus:outline-none focus:border-[#7ea8a4]"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="parsed-edition" className="block font-bold text-[#3b4349] mb-1">
                          Edition Version
                        </label>
                        <input
                          id="parsed-edition"
                          type="text"
                          value={reviewVersion}
                          onChange={(e) => setReviewVersion(e.target.value)}
                          className="w-full p-2 bg-white border border-[#ddd7cd] rounded-lg focus:outline-none focus:border-[#7ea8a4]"
                        />
                      </div>

                      <div>
                        <label htmlFor="parsed-synopsis" className="block font-bold text-[#3b4349] mb-1">
                          Parsed Clinical Synopsis
                        </label>
                        <textarea
                          id="parsed-synopsis"
                          rows={3}
                          value={reviewSynopsis}
                          onChange={(e) => setReviewSynopsis(e.target.value)}
                          className="w-full p-2.5 bg-white border border-[#ddd7cd] rounded-lg leading-relaxed focus:outline-none focus:border-[#7ea8a4]"
                        />
                      </div>

                      <div>
                        <span className="block font-bold text-[#3b4349] mb-1.5">Storefront Cover Artwork</span>
                        <div className="grid grid-cols-4 gap-2">
                          {COVER_PRESETS.map(preset => {
                            const selected = reviewCover === preset.url;
                            return (
                              <button
                                type="button"
                                key={preset.url}
                                onClick={() => setReviewCover(preset.url)}
                                className={`relative rounded-lg overflow-hidden aspect-[4/3] border-2 transition cursor-pointer ${
                                  selected ? 'border-[#7ea8a4] ring-2 ring-[#7ea8a4]/40' : 'border-transparent opacity-80 hover:opacity-100'
                                }`}
                                title={preset.label}
                                aria-label={`Select cover: ${preset.label}`}
                              >
                                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                                {selected && (
                                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#7ea8a4] text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-3 h-3" />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right: Parsed Table of Contents & Chapters Preview */}
                    <div className="lg:col-span-5 bg-white rounded-xl border border-[#ebe6de] p-4 space-y-4">
                      <div>
                        <h4 className="font-sans text-sm font-bold text-[#3b4349] flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-[#7ea8a4]" />
                          <span>Parsed Table of Contents</span>
                        </h4>
                        <ol className="mt-2 space-y-1.5 list-decimal list-inside text-[11px] text-[#404847]">
                          {parsedDraft.tableOfContents.map((entry, idx) => (
                            <li key={idx} className="truncate font-medium">{entry}</li>
                          ))}
                        </ol>
                      </div>

                      <div className="border-t border-[#f4efe9] pt-3 space-y-2.5">
                        <h4 className="font-sans text-sm font-bold text-[#3b4349]">
                          Extracted Reader Chapters ({parsedDraft.sampleChapters.length})
                        </h4>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {parsedDraft.sampleChapters.map(chap => (
                            <div key={chap.id} className="bg-[#faf8f5] p-3 rounded-lg border border-[#ebe6de] space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-[#7ea8a4]">Chapter {chap.chapterNumber}</span>
                                <span className="text-[#717977]">{chap.readingTimeMinutes} min read</span>
                              </div>
                              <p className="font-bold text-[#3b4349] text-xs">{chap.title}</p>
                              <p className="text-[11px] text-[#575f66] line-clamp-3 leading-relaxed">
                                {chap.content[0]}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sticky Review Footer Actions */}
                  <div className="sticky -bottom-6 -mx-6 px-6 py-4 bg-[#faf8f5]/95 backdrop-blur-sm border-t border-[#ebe6de] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={resetUploadModal}
                      className="w-full sm:w-auto px-4 py-2.5 bg-[#efeeeb] hover:bg-[#e5e2dc] rounded-lg text-xs font-semibold text-[#575f66] cursor-pointer"
                    >
                      Upload Different PDF
                    </button>
                    <button
                      type="submit"
                      disabled={isPublishingPdf}
                      className="w-full sm:w-auto px-6 py-2.5 bg-[#7ea8a4] hover:bg-[#6d9793] disabled:opacity-60 text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                    >
                      {isPublishingPdf ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Posting to Storefront...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Post E-Book to Storefront</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: PUBLISHED LIVE CONFIRMATION */}
              {workflowStep === 'published' && publishedProduct && (
                <div className="py-4 text-center space-y-5 max-w-lg mx-auto">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#7ea8a4]">
                      Live on GyneWell Storefront
                    </span>
                    <h3 className="font-sans text-2xl font-bold text-[#3b4349]">
                      PDF E-Book Posted Successfully
                    </h3>
                    <p className="text-xs text-[#575f66]">
                      Customers can now browse, preview parsed chapters in the Clinical Reader, purchase, and download the full PDF immediately.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#ebe6de] flex items-center space-x-4 text-left shadow-2xs">
                    <img
                      src={publishedProduct.coverImage}
                      alt={publishedProduct.title}
                      className="w-16 h-22 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <span className="inline-block text-[10px] font-bold bg-[#3b4349] text-white px-2 py-0.5 rounded">
                        PDF • {publishedProduct.pages} {publishedProduct.pages === 1 ? 'Page' : 'Pages'} • {publishedProduct.fileSizeMb} MB
                      </span>
                      <p className="font-sans text-sm font-bold text-[#3b4349] truncate">{publishedProduct.title}</p>
                      <p className="text-xs text-[#575f66] truncate">By {publishedProduct.author}</p>
                      <p className="text-sm font-bold text-[#7ea8a4]">${publishedProduct.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        const target = publishedProduct;
                        closeUploadModal();
                        onPreviewProductInReader(target);
                      }}
                      className="flex-1 py-2.5 bg-[#f4efe9] hover:bg-[#eae4dc] text-[#3b4349] text-xs font-bold rounded-lg border border-[#ddd7cd] flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-[#7ea8a4]" />
                      <span>Open in Clinical Reader</span>
                    </button>
                    <button
                      onClick={() => {
                        closeUploadModal();
                        onViewInStorefront();
                      }}
                      className="flex-1 py-2.5 bg-[#7ea8a4] hover:bg-[#6d9793] text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>View in Customer Storefront</span>
                    </button>
                  </div>

                  <button
                    onClick={resetUploadModal}
                    className="text-xs font-semibold text-[#717977] hover:text-[#3b4349] underline cursor-pointer"
                  >
                    Upload Another PDF Monograph
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
