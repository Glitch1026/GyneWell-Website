import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidPdfBuffer,
  sanitizePdfFileName,
  detectCategoryFromText,
  extractIsbnFromText,
  parseExtractedPdfText
} from './pdf-parser.ts';

test('isValidPdfBuffer validates %PDF- magic header and rejects non-PDF buffers', () => {
  const validPdfBytes = new TextEncoder().encode('%PDF-1.7\n1 0 obj\n<<>>\nendobj');
  assert.equal(isValidPdfBuffer(validPdfBytes), true);

  const plainTextBytes = new TextEncoder().encode('Hello, this is a TXT document');
  assert.equal(isValidPdfBuffer(plainTextBytes), false);

  const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
  assert.equal(isValidPdfBuffer(pngHeader), false);

  assert.equal(isValidPdfBuffer(new Uint8Array([])), false);
});

test('sanitizePdfFileName normalizes paths and guarantees a .pdf extension', () => {
  assert.equal(sanitizePdfFileName('My Clinical Guide (2026).pdf'), 'My-Clinical-Guide-2026-.pdf');
  assert.equal(sanitizePdfFileName('C:\\docs\\pelvic_floor'), 'pelvic_floor.pdf');
  assert.equal(sanitizePdfFileName('   '), 'gynewell-monograph.pdf');
});

test('detectCategoryFromText classifies GyneWell clinical domains accurately', () => {
  assert.equal(
    detectCategoryFromText('Biomechanical Pelvic Floor Restoration and levator ani avulsion with diastasis recti'),
    'Pelvic Health'
  );
  assert.equal(
    detectCategoryFromText('Serum progesterone, thyroiditis, cortisol rhythms, and luteal phase endocrine dynamics'),
    'Endocrine & Hormonal'
  );
  assert.equal(
    detectCategoryFromText('Maternal ferritin, choline, breast milk proteomics, and clinical nutrition in lactation'),
    'Clinical Nutrition'
  );
  assert.equal(
    detectCategoryFromText('Longitudinal fMRI mapping of matrescence, grey matter pruning, and synaptic plasticity'),
    'Perinatal Neurobiology'
  );
  assert.equal(
    detectCategoryFromText('Neonatal circadian entrainment, vagal co-regulation, and infant developmental milestones'),
    'Pediatric Transitions'
  );
});

test('extractIsbnFromText locates ISBN-13 codes in text', () => {
  assert.equal(extractIsbnFromText('Published by GyneWell Press. ISBN: 978-1-954821-88-4.'), '978-1-954821-88-4');
  assert.equal(extractIsbnFromText('No identifier included here.'), null);
});

test('parseExtractedPdfText extracts metadata, chapters, TOC, and clinical synopsis from multi-page PDF text', () => {
  const pages = [
    [
      'Postpartum Thyroid & Adrenal Recovery',
      'Clinical Biomarkers for Endocrine Stabilization After Birth',
      'By Dr. Oluremi Ilupeju, MD, FACOG',
      'ISBN: 978-1-954821-72-3',
      'Abstract: This monograph presents a peer-reviewed diagnostic framework for postpartum thyroiditis and HPA axis recalibration across the first twelve months.'
    ].join('\n'),
    [
      'Chapter 1: Postpartum Thyroiditis Screening',
      'Postpartum thyroiditis affects up to ten percent of women within twelve months of delivery. Clinicians should evaluate TSH, free T4, free T3, and anti-TPO antibodies whenever maternal fatigue persists past eight weeks.',
      '',
      'Early recognition prevents misdiagnosis as routine postpartum exhaustion and supports healthy lactation metabolism.'
    ].join('\n'),
    [
      'Chapter 2: Cortisol Rhythms & Sleep Architecture',
      'Fragmented nocturnal sleep elevates evening cortisol and inflammatory cytokines. Structured circadian anchoring restores morning cortisol awakening responses and endocrine resilience.'
    ].join('\n')
  ];

  const draft = parseExtractedPdfText({
    pages,
    fileName: 'postpartum_thyroid_recovery.pdf',
    fileSizeBytes: 2_621_440, // 2.5 MB
    metadata: {
      title: 'Postpartum Thyroid & Adrenal Recovery',
      author: 'Dr. Oluremi Ilupeju, MD, FACOG'
    }
  });

  assert.equal(draft.title, 'Postpartum Thyroid & Adrenal Recovery');
  assert.equal(draft.author, 'Dr. Oluremi Ilupeju, MD, FACOG');
  assert.equal(draft.isbn, '978-1-954821-72-3');
  assert.equal(draft.category, 'Endocrine & Hormonal');
  assert.equal(draft.pages, 3);
  assert.equal(draft.fileSizeMb, 2.5);
  assert.ok(draft.wordCount > 70);
  assert.equal(draft.sampleChapters.length, 2);
  assert.equal(draft.sampleChapters[0].chapterNumber, 1);
  assert.equal(draft.sampleChapters[0].title, 'Postpartum Thyroiditis Screening');
  assert.equal(draft.sampleChapters[1].title, 'Cortisol Rhythms & Sleep Architecture');
  assert.deepEqual(draft.tableOfContents, [
    'Postpartum Thyroiditis Screening',
    'Cortisol Rhythms & Sleep Architecture'
  ]);
  assert.ok(draft.synopsis.includes('postpartum thyroiditis'));
});

test('parseExtractedPdfText handles minimal PDFs without metadata or explicit chapter markers', () => {
  const draft = parseExtractedPdfText({
    pages: ['Maternal iron repletion protocols require checking serum ferritin alongside complete blood counts at six weeks postpartum.'],
    fileName: 'maternal_iron_guide.pdf',
    fileSizeBytes: 512_000,
    metadata: { title: 'Untitled', author: '' }
  });

  assert.equal(draft.pages, 1);
  assert.equal(draft.fileName, 'maternal_iron_guide.pdf');
  assert.ok(draft.title.length > 0);
  assert.equal(draft.author, 'Dr. Oluremi Ilupeju, MD, FACOG');
  assert.equal(draft.sampleChapters.length, 1);
  assert.ok(draft.sampleChapters[0].content[0].includes('serum ferritin'));
});
