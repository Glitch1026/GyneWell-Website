import type { Chapter, ParsedPdfDraft, ProductCategory } from '../types.ts';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Maternal Health',
  'Endocrine & Hormonal',
  'Pelvic Health',
  'Clinical Nutrition',
  'Perinatal Neurobiology',
  'Pediatric Transitions'
];

export interface PdfMetadataInput {
  title?: string | null;
  author?: string | null;
  subject?: string | null;
}

export interface PdfExtractionInput {
  pages: string[];
  fileName: string;
  fileSizeBytes: number;
  metadata?: PdfMetadataInput;
}

/**
 * Checks the PDF magic signature (%PDF-) at the beginning of a binary buffer.
 */
export function isValidPdfBuffer(buffer: Uint8Array): boolean {
  if (!buffer || buffer.length < 5) return false;
  // ASCII bytes for "%PDF-" => [0x25, 0x50, 0x44, 0x46, 0x2d]
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  );
}

/**
 * Normalizes a PDF file name for clean storage and download headers.
 */
export function sanitizePdfFileName(fileName: string): string {
  const base = fileName
    .trim()
    .replace(/^.*[\\/]/, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!base) return 'gynewell-monograph.pdf';
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
}

/**
 * Converts a filename like "postpartum_endocrine_guide.pdf" into a readable title.
 */
export function humanizePdfFileName(fileName: string): string {
  const stripped = fileName
    .replace(/^.*[\\/]/, '')
    .replace(/\.pdf$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!stripped) return 'Untitled GyneWell Clinical Monograph';

  return stripped
    .split(' ')
    .map(word => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

/**
 * Classifies extracted manuscript text into one of GyneWell's six clinical specialties.
 */
export function detectCategoryFromText(text: string): ProductCategory {
  const lower = text.toLowerCase();
  const scores: Record<ProductCategory, number> = {
    'Maternal Health': 0,
    'Endocrine & Hormonal': 0,
    'Pelvic Health': 0,
    'Clinical Nutrition': 0,
    'Perinatal Neurobiology': 0,
    'Pediatric Transitions': 0
  };

  const keywordMap: Record<ProductCategory, string[]> = {
    'Pelvic Health': ['pelvic', 'levator', 'fascia', 'prolapse', 'diastasis', 'urogynecology', 'perineal', 'biomechanical', 'linea alba'],
    'Endocrine & Hormonal': ['endocrine', 'hormon', 'thyroid', 'progesterone', 'estradiol', 'cortisol', 'luteal', 'menopause', 'perimenopause', 'ovarian', 'hpa axis', 'insulin'],
    'Clinical Nutrition': ['nutrition', 'micronutrient', 'ferritin', 'choline', 'lactation', 'breast milk', 'proteomics', 'vitamin', 'diet', 'collagen', 'dha', 'zinc'],
    'Perinatal Neurobiology': ['neurobiology', 'matrescence', 'fmri', 'grey matter', 'brain', 'synaptic', 'amygdala', 'neural', 'dopamin', 'neuroplastic', 'intrusive thoughts'],
    'Pediatric Transitions': ['pediatric', 'neonatal', 'newborn', 'infant', 'co-regulation', 'circadian', 'developmental milestone', 'vagal', 'first 1,000'],
    'Maternal Health': ['maternal', 'postpartum', 'obstetric', 'pregnancy', 'gynecology', 'placental', 'birth', 'puerperium', 'cesarean']
  };

  for (const [category, keywords] of Object.entries(keywordMap) as [ProductCategory, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        scores[category] += 1;
      }
    }
  }

  let bestCategory: ProductCategory = 'Maternal Health';
  let bestScore = 0;
  for (const cat of PRODUCT_CATEGORIES) {
    if (scores[cat] > bestScore) {
      bestScore = scores[cat];
      bestCategory = cat;
    }
  }
  return bestCategory;
}

/**
 * Extracts an ISBN-13 or ISBN-10 string from manuscript text if present.
 */
export function extractIsbnFromText(text: string): string | null {
  const isbn13Match = text.match(/\b(97[89][-\s]?(?:\d[-\s]?){9}\d)\b/);
  if (isbn13Match) {
    return isbn13Match[1].replace(/\s+/g, '-');
  }
  const labeledMatch = text.match(/ISBN(?:-1[03])?\s*[:#]?\s*([0-9X-]{10,17})/i);
  if (labeledMatch) {
    return labeledMatch[1].trim();
  }
  return null;
}

function generateFallbackIsbn(seedText: string): string {
  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    hash = (hash * 31 + seedText.charCodeAt(i)) % 1000;
  }
  const pair = String(Math.abs(hash) % 90 + 10);
  const check = String(Math.abs(hash) % 10);
  return `978-1-954821-${pair}-${check}`;
}

function isMeaningfulMetaString(val?: string | null): val is string {
  if (!val) return false;
  const cleaned = val.trim();
  if (cleaned.length < 3) return false;
  const genericPatterns = [
    /^untitled$/i,
    /^document\d*$/i,
    /^microsoft word/i,
    /^slide\s*\d*$/i,
    /\.docx?$/i,
    /\.pdf$/i
  ];
  return !genericPatterns.some(rx => rx.test(cleaned));
}

function normalizePageText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitIntoParagraphs(text: string): string[] {
  const clean = normalizePageText(text);
  if (!clean) return [];

  // Split by blank lines first
  const doubleNewlineParts = clean
    .split(/\n\s*\n/)
    .map(p => p.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 20);

  if (doubleNewlineParts.length >= 2) {
    return doubleNewlineParts.slice(0, 8);
  }

  // Fallback: chunk long single-block extracted PDF text into readable paragraphs by sentence boundaries
  const flattened = clean.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  const sentences = flattened.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [flattened];
  const paragraphs: string[] = [];
  let buffer = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    if ((buffer + ' ' + trimmed).trim().length > 320 && buffer.length > 0) {
      paragraphs.push(buffer.trim());
      buffer = trimmed;
    } else {
      buffer = buffer ? `${buffer} ${trimmed}` : trimmed;
    }
  }
  if (buffer.trim()) {
    paragraphs.push(buffer.trim());
  }

  return paragraphs.slice(0, 8);
}

function estimateReadingMinutes(paragraphs: string[]): number {
  const words = paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 200));
}

function parseRomanOrInt(token: string, fallback: number): number {
  const asInt = parseInt(token, 10);
  if (!Number.isNaN(asInt) && asInt > 0) return asInt;
  const romanMap: Record<string, number> = {
    I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10
  };
  return romanMap[token.toUpperCase()] || fallback;
}

/**
 * Pure parser that transforms extracted PDF page text and metadata into a
 * structured GyneWell clinical e-book draft ready for admin review and publishing.
 */
export function parseExtractedPdfText(input: PdfExtractionInput): Omit<ParsedPdfDraft, 'uploadId'> {
  const normalizedPages = (input.pages.length > 0 ? input.pages : ['']).map(normalizePageText);
  const fullText = normalizedPages.filter(Boolean).join('\n\n');
  const pageCount = Math.max(1, input.pages.length);

  const words = fullText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const fileSizeMb = Number(Math.max(0.05, input.fileSizeBytes / (1024 * 1024)).toFixed(2));
  const safeFileName = sanitizePdfFileName(input.fileName);

  // Page 1 lines for title/subtitle/author heuristics
  const firstPageLines = (normalizedPages[0] || '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // Title detection
  let title = '';
  if (isMeaningfulMetaString(input.metadata?.title)) {
    title = input.metadata!.title!.trim();
  } else {
    const candidateLine = firstPageLines.find(
      line =>
        line.length >= 6 &&
        line.length <= 120 &&
        !/^(chapter|section|isbn|copyright|table of contents|page \d+)/i.test(line)
    );
    title = candidateLine || humanizePdfFileName(safeFileName);
  }

  // Author detection
  let author = '';
  if (isMeaningfulMetaString(input.metadata?.author)) {
    author = input.metadata!.author!.trim();
  } else {
    const byLine = firstPageLines.find(line =>
      /^(?:by\s+|author\s*:\s*|dr\.\s+)/i.test(line) && line.length <= 100
    );
    if (byLine) {
      author = byLine.replace(/^(?:by\s+|author\s*:\s*)/i, '').trim();
    } else {
      author = 'Dr. Oluremi Ilupeju, MD, FACOG';
    }
  }

  // Subtitle detection
  let subtitle = '';
  if (isMeaningfulMetaString(input.metadata?.subject)) {
    subtitle = input.metadata!.subject!.trim();
  } else {
    const titleIdx = firstPageLines.findIndex(l => l === title);
    const subtitleCandidate = firstPageLines.find(
      (line, idx) =>
        idx > Math.max(-1, titleIdx) &&
        line !== author &&
        !line.includes(author) &&
        line.length >= 12 &&
        line.length <= 160 &&
        !/^(chapter|section|isbn|copyright|by\s+|dr\.\s+)/i.test(line)
    );
    subtitle = subtitleCandidate || 'Peer-Reviewed Clinical PDF Monograph — GyneWell Press';
  }

  // ISBN & Category
  const isbn = extractIsbnFromText(fullText) || generateFallbackIsbn(`${title}-${safeFileName}`);
  const category = detectCategoryFromText(`${title}\n${subtitle}\n${fullText.slice(0, 4000)}`);

  // Chapter extraction via explicit "Chapter N" or "Section N" headers
  const chapterHeaderRegex = /(?:^|\n)\s*(?:Chapter|CHAPTER|Section|SECTION)\s+(\d+|[IVX]+)\s*(?:[:.\-–—]\s*|\n\s*)([^\n]{3,120})/g;
  const matches: Array<{ index: number; endOfHeader: number; num: number; heading: string }> = [];
  let m: RegExpExecArray | null;

  while ((m = chapterHeaderRegex.exec(fullText)) !== null) {
    const heading = m[2].trim().replace(/\s+/g, ' ');
    matches.push({
      index: m.index,
      endOfHeader: m.index + m[0].length,
      num: parseRomanOrInt(m[1], matches.length + 1),
      heading
    });
  }

  const sampleChapters: Chapter[] = [];
  if (matches.length > 0) {
    const limitedMatches = matches.slice(0, 6);
    for (let i = 0; i < limitedMatches.length; i++) {
      const current = limitedMatches[i];
      const next = limitedMatches[i + 1];
      const sliceEnd = next ? next.index : Math.min(fullText.length, current.endOfHeader + 3000);
      const bodyRaw = fullText.slice(current.endOfHeader, sliceEnd).trim();
      const paragraphs = splitIntoParagraphs(bodyRaw);

      sampleChapters.push({
        id: `parsed-chap-${i + 1}`,
        chapterNumber: current.num,
        title: current.heading,
        subtitle: `Extracted from ${safeFileName}`,
        readingTimeMinutes: estimateReadingMinutes(paragraphs),
        content: paragraphs.length > 0
          ? paragraphs
          : [`Clinical section content extracted from ${current.heading} in ${safeFileName}.`]
      });
    }
  } else {
    // Fallback: build clean page-grouped preview sections from extracted pages
    const nonEmptyPages = normalizedPages
      .map((text, idx) => ({ pageNum: idx + 1, text }))
      .filter(p => p.text.length > 0);

    if (nonEmptyPages.length === 0) {
      sampleChapters.push({
        id: 'parsed-chap-1',
        chapterNumber: 1,
        title: 'Monograph Overview',
        subtitle: `PDF Document (${pageCount} ${pageCount === 1 ? 'Page' : 'Pages'})`,
        readingTimeMinutes: 4,
        content: [
          `This PDF monograph (${safeFileName}) has been verified and packaged for instant download and clinical library access.`
        ]
      });
    } else {
      const previewPages = nonEmptyPages.slice(0, 4);
      previewPages.forEach((pg, idx) => {
        const lines = pg.text.split('\n').map(l => l.trim()).filter(Boolean);
        const firstLine = lines[0] || `Section ${idx + 1}`;
        const sectionTitle =
          idx === 0
            ? 'Introduction & Clinical Overview'
            : firstLine.length >= 6 && firstLine.length <= 90
              ? firstLine
              : `Clinical Section — Page ${pg.pageNum}`;

        const bodyText = idx === 0 && lines.length > 1 ? lines.slice(1).join('\n') : pg.text;
        const paragraphs = splitIntoParagraphs(bodyText);

        sampleChapters.push({
          id: `parsed-chap-${idx + 1}`,
          chapterNumber: idx + 1,
          title: sectionTitle,
          subtitle: `Parsed from Page ${pg.pageNum} of ${safeFileName}`,
          readingTimeMinutes: estimateReadingMinutes(paragraphs),
          content: paragraphs.length > 0 ? paragraphs : [pg.text]
        });
      });
    }
  }

  // Table of Contents
  const tableOfContents = sampleChapters.map(c => c.title);

  // Synopsis extraction: prefer explicit Abstract/Overview/Synopsis block, else first chapter prose
  let synopsis = '';
  const abstractMatch = fullText.match(/(?:abstract|synopsis|executive summary|overview)\s*[:\-]?\s*\n?([\s\S]{40,420}?)(?:\n\s*\n|Chapter\s+\d|Section\s+\d|$)/i);
  if (abstractMatch && abstractMatch[1]) {
    synopsis = abstractMatch[1].replace(/\s+/g, ' ').trim();
  } else {
    const firstPara = sampleChapters[0]?.content.find(p => p.length > 40) || fullText.slice(0, 300);
    synopsis = firstPara.replace(/\s+/g, ' ').trim();
  }
  if (synopsis.length > 320) {
    synopsis = `${synopsis.slice(0, 317).trim()}...`;
  }
  if (!synopsis) {
    synopsis = `Peer-reviewed clinical PDF monograph (${pageCount} pages) covering evidence-based protocols in ${category}.`;
  }

  // Suggested price & CME credits based on page length
  const suggestedPrice =
    pageCount <= 40 ? 19.00 :
    pageCount <= 150 ? 24.00 :
    pageCount <= 350 ? 28.00 : 32.00;

  const cmeCredits = Math.min(24, Math.max(2, Math.round(pageCount / 18)));
  const rawExcerpt = fullText.replace(/\s+/g, ' ').trim().slice(0, 480);

  return {
    fileName: safeFileName,
    fileSizeMb,
    pages: pageCount,
    wordCount,
    title,
    subtitle,
    author,
    category,
    isbn,
    editionVersion: 'v1.0 (PDF Clinical Release)',
    suggestedPrice,
    cmeCredits,
    synopsis,
    tableOfContents,
    sampleChapters,
    rawExcerpt
  };
}
