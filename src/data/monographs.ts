import { Product } from '../types.ts';

export const MONOGRAPHS_INITIAL_DATA: Product[] = [
  {
    id: 'postpartum-healing',
    title: 'The Restorative Postpartum',
    subtitle: 'A Clinical Guide to Endocrine, Maternal, and Pelvic Healing',
    author: 'Dr. Oluremi Ilupeju',
    authorTitle: 'MD, FACOG',
    authorCredentials: 'Board-Certified Obstetrician & Gynecologist, Medical Director of GyneWell Care & Wellness',
    authorAvatar: '/assets/aistudio/Dr_Oluremi_Ilupeju_d7f8ed13.webp',
    coverImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
    price: 48.00,
    digitalPrice: 28.00,
    formats: ['Hardcover', 'Paperback', 'EPUB', 'Audiobook'],
    category: 'Maternal Health',
    rating: 4.95,
    reviewCount: 384,
    pages: 368,
    publishYear: 2026,
    edition: '2nd Clinical Edition',
    isbn: '978-1-954821-42-0',
    cmeCredits: 18,
    isFeatured: true,
    peerReviewQuote: 'An extraordinary clinical synthesis that shifts postpartum medicine from crisis-response to cellular and endocrine restoration.',
    peerReviewSource: 'The American Journal of Maternal-Fetal Medicine Review',
    stock: 24,
    lowStockThreshold: 15,
    synopsis: 'The Restorative Postpartum dismantles the outdated "6-week clearance" paradigm, providing an evidence-grounded framework across physiological, neuroendocrine, immunological, and biomechanical recovery.',
    tableOfContents: [
      'The Neuroendocrine Shift in Early Postpartum',
      'Microvascular Repair & Fascial Reconstitution',
      'The HPA Axis & Maternal Sleep Fragmentation',
      'Micronutrient Depletion: Biomarkers & Repletion',
      'Clinical Clearance Beyond Six Weeks: An Algorithm'
    ],
    sampleChapters: [
      {
        id: 'chap-1',
        chapterNumber: 1,
        title: 'The Neuroendocrine Shift in Early Postpartum',
        subtitle: 'Progesterone withdrawal, oxytocin receptor sensitization, and maternal brain remodeling',
        readingTimeMinutes: 12,
        content: [
          'Within seventy-two hours following placental delivery, circulating levels of estradiol and progesterone plummet by more than ninety-eight percent. This precipitous hormone drop is the most dramatic endocrine shift documented in human physiology.',
          'Concurrently, the anterior pituitary dramatically elevates prolactin secretion to sustain lactation, while hypothalamic oxytocin pathways undergo neuroplastic upregulation. In a sensitized state, maternal neural circuits exhibit elevated resting-state functional connectivity across the amygdala, insular cortex, and medial prefrontal regions.',
          'Standard obstetric guidelines often under-evaluate the clinical repercussions of this biochemical vacuum. When sleep deprivation is superimposed upon rapid steroid withdrawal, the hypothalamic-pituitary-adrenal (HPA) axis struggles to maintain homeostatic cortisol rhythms, resulting in elevated nocturnal inflammatory cytokines (IL-6 and TNF-alpha).'
        ],
        medicalNotes: [
          {
            id: 'mn-1',
            badge: 'Clinical Evidence (Level 1A)',
            title: 'Endocrine Transition Physiology',
            content: 'Serum progesterone falls from ~150 ng/mL at term to <1 ng/mL by day 7 postpartum. Rapid down-regulation of GABA-A receptor alpha-4 subunits during this drop correlates with heightened physiological anxiety and disrupted circadian sleep architecture.',
            citation: 'GyneWell Clinical Monograph Series, Vol. 44, pp. 112–129 (2026).'
          },
          {
            id: 'mn-2',
            badge: 'Diagnostic Biomarker Alert',
            title: 'Thyroid vs. Postpartum Fatigue',
            content: 'Always obtain early postpartum TSH, Free T4, and anti-TPO antibodies between weeks 6 and 12. Postpartum thyroiditis occurs in 7-10% of women and is frequently misdiagnosed as simple maternal exhaustion.',
            citation: 'ACOG Clinical Guidelines No. 248: Endocrine Disorders in Pregnancy and Postpartum.'
          }
        ]
      },
      {
        id: 'chap-2',
        chapterNumber: 2,
        title: 'Microvascular Repair & Fascial Reconstitution',
        subtitle: 'Capillary angiogenesis, collagen turnover, and pelvic floor biomechanics',
        readingTimeMinutes: 15,
        content: [
          'The uterine placental site encompasses an area of approximately 8.5 centimeters in diameter immediately post-expulsion. Hemostasis is initially achieved through myometrial contractility (the "living ligatures"), followed by progressive endovascular thrombosis and granulation tissue remodeling.',
          'Simultaneously, the levator ani muscle complex and endopelvic fascia have undergone elongation strains reaching up to 210% of their resting length during the second stage of labor. Collagen type III synthesized during early wound healing must steadily be reorganized into high-tensile collagen type I over a 16-to-24-week restorative horizon.',
          'Clearance for high-impact physical loads at six weeks assumes an obsolete rate of fascial maturation. Diagnostic dynamic ultrasound reveals that structural pelvic stiffness does not achieve pre-gestational tensile equilibrium until at least 4 to 6 months postpartum.'
        ],
        medicalNotes: [
          {
            id: 'mn-3',
            badge: 'Clinical Ultrasound Guidance',
            title: 'Pelvic Fascial Integrity Timeline',
            content: 'High-resolution transperineal ultrasound confirms that levator hiatus distension resolves by only 40% at six weeks, reaching 85-90% resolution at month six. Premature intra-abdominal pressure loading significantly escalates risk of apical prolapse.',
            citation: 'International Urogynecological Journal, 36(4): 782-791.'
          }
        ]
      },
      {
        id: 'chap-3',
        chapterNumber: 3,
        title: 'Micronutrient Depletion: Biomarkers & Repletion',
        subtitle: 'Serum ferritin, choline stores, omega-3 index, and cellular mitochondrial recovery',
        readingTimeMinutes: 14,
        content: [
          'Gestational expansion of maternal blood volume combined with delivery blood loss causes profound latent iron deficiency in upwards of 45% of postpartum individuals, even when standard hemoglobin levels appear borderline normal.',
          'Ferritin levels below 50 ng/mL impair thyroid peroxidase activity and mitochondrial ATP production in cardiomyocytes and skeletal muscle. Furthermore, the active transfer of docosahexaenoic acid (DHA) and choline into breast milk drains maternal cerebral lipid reserves unless targeted nutritional repletion is initiated.',
          'We advocate for a comprehensive nutritional panel at four weeks postpartum: ferritin, soluble transferrin receptor, serum zinc, methylmalonic acid (MMA), and the erythrocyte Omega-3 Index.'
        ],
        medicalNotes: [
          {
            id: 'mn-4',
            badge: 'Target Laboratory Range',
            title: 'Serum Ferritin Optimization',
            content: 'Target postpartum ferritin should exceed 50-70 ng/mL for optimal neurocognitive function and hair follicle telogen phase restoration, rather than conventional lab lower bounds of 12-15 ng/mL.',
            citation: 'British Journal of Haematology, Consensus on Obstetric Iron Deficiency (2024).'
          }
        ]
      }
    ]
  },
  {
    id: 'perinatal-neurobiology',
    title: 'Perinatal Neurobiology & Matrescence',
    subtitle: 'Functional MRI Mapping of Maternal Brain Plasticity & Protective Adaptation',
    author: 'Dr. Oluremi Ilupeju & Dr. Sarah Vance',
    authorTitle: 'MD, FACOG & PhD in Behavioral Neuroscience',
    authorCredentials: 'Co-directors of the GyneWell Cognitive & Maternal Health Collaborative',
    authorAvatar: '/assets/aistudio/Dr_Oluremi_Ilupeju_d7f8ed13.webp',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    price: 52.00,
    digitalPrice: 32.00,
    formats: ['Hardcover', 'EPUB', 'Audiobook'],
    category: 'Perinatal Neurobiology',
    rating: 4.92,
    reviewCount: 219,
    pages: 412,
    publishYear: 2026,
    edition: '1st Monograph Edition',
    isbn: '978-1-954821-43-7',
    cmeCredits: 20,
    isFeatured: false,
    peerReviewQuote: 'Groundbreaking longitudinal fMRI work demonstrating that maternal grey matter pruning is a finely tuned evolutionary mastery, not cognitive decline.',
    peerReviewSource: 'Nature Medicine & Maternal Neuroscience',
    stock: 18,
    lowStockThreshold: 12,
    synopsis: 'Explores structural brain remodeling during pregnancy and postpartum. Provides clinical protocols for managing intrusive thoughts, sensory overload, and sleep fragmentation resilience.',
    tableOfContents: [
      'Structural Grey Matter Specialization in Human Mothers',
      'The Salience Network & Maternal Threat Vigilance',
      'Dopaminergic Bonding Circuits vs. Postpartum Anhedonia',
      'Sensory Gating and Sensory Processing Sensitivities',
      'Clinical Interventions for Perinatal Obsessive Symptoms'
    ],
    sampleChapters: [
      {
        id: 'chap-neuro-1',
        chapterNumber: 1,
        title: 'Structural Grey Matter Specialization',
        subtitle: 'Synaptic pruning as neuroarchitectural efficiency for attachment',
        readingTimeMinutes: 10,
        content: [
          'Longitudinal neuroimaging reveals that pregnancy induces symmetrical volume reductions in grey matter across the Theory of Mind network—primarily within the anterior and posterior midline, bilateral lateral prefrontal cortex, and superior temporal sulcus.',
          'Rather than signifying cognitive impairment (the popular misnomer "mommy brain"), these volumetric reductions mirror the synaptic pruning observed during human adolescence, representing neural specialization optimized for infant cue decoding and empathetic attunement.'
        ],
        medicalNotes: [
          {
            id: 'mn-neuro-1',
            badge: 'Neuroimaging Reference',
            title: 'Longitudinal Grey Matter Retention',
            content: 'These neural adaptations endure for at least six years postpartum, establishing a persistent neurobiological maternal signature that enhances long-term social cognition and stress resilience.',
            citation: 'Vance S., Ilupeju O., et al. Nature Neuroscience 29: 418-431.'
          }
        ]
      }
    ]
  },
  {
    id: 'endocrine-arc',
    title: 'The Endocrine Arc',
    subtitle: 'Hormonal Symphony from Menarche through Postpartum and Perimenopause',
    author: 'Dr. Oluremi Ilupeju',
    authorTitle: 'MD, FACOG',
    authorCredentials: 'Fellow of the American College of Obstetricians and Gynecologists',
    authorAvatar: '/assets/aistudio/Dr_Oluremi_Ilupeju_d7f8ed13.webp',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    price: 44.00,
    digitalPrice: 26.00,
    formats: ['Hardcover', 'Paperback', 'EPUB'],
    category: 'Endocrine & Hormonal',
    rating: 4.88,
    reviewCount: 165,
    pages: 320,
    publishYear: 2025,
    edition: 'Revised Edition',
    isbn: '978-1-954821-39-0',
    cmeCredits: 15,
    isFeatured: false,
    peerReviewQuote: 'The definitive text on female steroid hormone dynamics, HPA-HPO crosstalk, and holistic endocrine stabilization.',
    peerReviewSource: 'Endocrine Reviews in Obstetrics',
    stock: 8,
    lowStockThreshold: 10,
    synopsis: 'A comprehensive medical monograph charting the life-course hormonal transitions in women. Emphasizes cycle tracking, luteal phase defect correction, and bioidentical therapeutic horizons.',
    tableOfContents: [
      'The Hypothalamic-Pituitary-Ovarian Regulatory Feedback Loop',
      'Luteal Phase Insufficiency & Progesterone Receptors',
      'Adrenal-Ovarian Crosstalk: Cortisol Steal Decoded',
      'Insulin Resistance and Ovarian Androgen Biosynthesis',
      'The Perimenopausal Transition: Diagnostic Algorithms'
    ],
    sampleChapters: [
      {
        id: 'chap-endo-1',
        chapterNumber: 1,
        title: 'The Hypothalamic-Pituitary-Ovarian Loop',
        subtitle: 'Pulsatile GnRH, LH surge kinetics, and follicular selection',
        readingTimeMinutes: 11,
        content: [
          'Pulsatile release of gonadotropin-releasing hormone (GnRH) from the arcuate nucleus of the hypothalamus dictates the delicate balance of FSH and LH secretion by anterior pituitary gonadotropes.',
          'Subtle metabolic stressors, including subclinical caloric deficits or circadian disruption, slow GnRH pulse frequency, yielding inadequate follicular recruitment and truncated luteal phases with suboptimal progesterone synthesis.'
        ],
        medicalNotes: [
          {
            id: 'mn-endo-1',
            badge: 'Endocrine Practice Pearl',
            title: 'Salivary vs. Serum Progesterone Testing',
            content: 'Serum testing measured 7 days post-ovulation (mid-luteal) remains the diagnostic gold standard. Values below 10 ng/mL in natural cycles suggest suboptimal corpus luteum function.',
            citation: 'GyneWell Clinical Protocols in Reproductive Endocrinology (2025).'
          }
        ]
      }
    ]
  },
  {
    id: 'biomechanical-pelvic-health',
    title: 'Biomechanical Pelvic Floor Restoration',
    subtitle: 'A Surgical and Conservative Protocol for Apical and Functional Recovery',
    author: 'Dr. Oluremi Ilupeju & Dr. Elena Rostova',
    authorTitle: 'MD, FACOG & DPT, PRPC',
    authorCredentials: 'GyneWell Pelvic Health & Restorative Surgical Medicine Division',
    authorAvatar: '/assets/aistudio/Dr_Oluremi_Ilupeju_d7f8ed13.webp',
    coverImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    price: 49.00,
    digitalPrice: 29.00,
    formats: ['Hardcover', 'Paperback', 'EPUB'],
    category: 'Pelvic Health',
    rating: 4.96,
    reviewCount: 142,
    pages: 356,
    publishYear: 2026,
    edition: '1st Edition',
    isbn: '978-1-954821-45-1',
    cmeCredits: 16,
    isFeatured: false,
    peerReviewQuote: 'Bridging the chasm between surgical urogynecology and conservative pelvic physical therapy with peerless anatomical rigor.',
    peerReviewSource: 'Journal of Pelvic Medicine & Surgery',
    stock: 31,
    lowStockThreshold: 10,
    synopsis: 'Detailed clinical reference on levator ani avulsion diagnosis, intra-abdominal pressure management, diastasis recti abdominis rehabilitation, and nerve glides.',
    tableOfContents: [
      'Functional Anatomy of the Endopelvic Fascia',
      'Levator Ani Avulsion: 3D Ultrasound Diagnostic Criteria',
      'Breath, Diaphragm, and Pelvic Floor Pressure Synergy',
      'Diastasis Recti: Linea Alba Tensile Stiffness Restoration',
      'Return to Running: A 12-Step Biomechanical Protocol'
    ],
    sampleChapters: [
      {
        id: 'chap-pelvic-1',
        chapterNumber: 1,
        title: 'Functional Anatomy of the Endopelvic Fascia',
        subtitle: 'DeLancey Level I, II, and III support systems',
        readingTimeMinutes: 13,
        content: [
          'DeLancey’s landmark classification delineates pelvic organ support into three contiguous levels: Level I suspends the vaginal apex via the uterosacral-cardinal ligament complex; Level II attaches the mid-vagina laterally to the arcus tendineus fasciae pelvis; and Level III fuses the distal vagina with the perineal membrane.',
          'Failure to identify Level I apical laxity frequently leads to recurrence following isolated anterior colporrhaphy. Conservative rehabilitation must restore co-contraction between transversus abdominis and the pubococcygeus.'
        ]
      }
    ]
  },
  {
    id: 'clinical-nutrition-lactation',
    title: 'Clinical Nutrition in Lactation & Tissue Repair',
    subtitle: 'Biochemistry of Maternal Micronutrient Repletion and Milk Proteomics',
    author: 'Dr. Marcus Chen & Dr. Oluremi Ilupeju',
    authorTitle: 'MD, CNS & MD, FACOG',
    authorCredentials: 'Nutritional Biochemistry & Human Milk Research Fellows, GyneWell Press',
    authorAvatar: '/assets/aistudio/Dr_Oluremi_Ilupeju_d7f8ed13.webp',
    coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    price: 42.00,
    digitalPrice: 25.00,
    formats: ['Paperback', 'EPUB', 'Audiobook'],
    category: 'Clinical Nutrition',
    rating: 4.87,
    reviewCount: 98,
    pages: 288,
    publishYear: 2025,
    edition: 'Clinical Handbook',
    isbn: '978-1-954821-38-3',
    cmeCredits: 12,
    isFeatured: false,
    peerReviewQuote: 'Vital reading for maternal clinicians, pediatricians, and registered dietitians seeking mechanistic depth over dietary platitudes.',
    peerReviewSource: 'American Journal of Clinical Nutrition',
    stock: 6,
    lowStockThreshold: 10,
    synopsis: 'A deep molecular dive into human milk oligosaccharides (HMOs), bioactive peptide transfer, antioxidant status, and micronutrient repletion for healing maternal tissues.',
    tableOfContents: [
      'Human Milk Proteomics & Immunological Transference',
      'The Choline Deficit in Exclusive Lactation',
      'Collagen Hydrolysates and Glycine Availability in Perineal Healing',
      'Eicosanoid Pathways and Mammary Gland Duct Patency',
      'Maternal Microbiome Diversity and Neonatal Gut Seeding'
    ],
    sampleChapters: [
      {
        id: 'chap-nutr-1',
        chapterNumber: 1,
        title: 'Human Milk Proteomics & Immunological Transference',
        subtitle: 'Secretory IgA, lactoferrin, and bioactive cytokine modulation',
        readingTimeMinutes: 9,
        content: [
          'Human breast milk is a dynamically responsive living tissue containing millions of maternal leukocytes, immunoglobulins, and microRNAs tailored to the infant’s immunological environment.',
          'Maternal protein intake directly affects the concentration of essential amino acids in milk serum. Maintaining a minimum maternal protein intake of 1.7 to 1.9 g/kg/day during the initial 12 weeks supports both tissue healing and milk casein synthesis.'
        ]
      }
    ]
  },
  {
    id: 'pediatric-transitions',
    title: 'Pediatric Transitions: The First 1,000 Hours',
    subtitle: 'Maternal-Infant Co-Regulation, Circadian Entrainment, and Neonatal Neurodevelopment',
    author: 'Dr. Oluremi Ilupeju & Dr. Kwame Mensah',
    authorTitle: 'MD, FACOG & MD, FAAP',
    authorCredentials: 'GyneWell Maternal & Neonatal Collaborative Specialists',
    authorAvatar: '/assets/aistudio/Dr_Oluremi_Ilupeju_d7f8ed13.webp',
    coverImage: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800',
    price: 46.00,
    digitalPrice: 27.00,
    formats: ['Hardcover', 'Paperback', 'EPUB'],
    category: 'Pediatric Transitions',
    rating: 4.93,
    reviewCount: 112,
    pages: 310,
    publishYear: 2026,
    edition: '1st Edition',
    isbn: '978-1-954821-47-5',
    cmeCredits: 14,
    isFeatured: false,
    peerReviewQuote: 'A tour de force uniting obstetric recovery with pediatric developmental milestones in one harmonious framework.',
    peerReviewSource: 'Pediatric Academic Societies Review',
    stock: 22,
    lowStockThreshold: 10,
    synopsis: 'Examines physiological synchrony between mother and infant. Explains heart rate variability attunement, melatonin transference via nighttime breast milk, and sensory regulation.',
    tableOfContents: [
      'The Biology of Co-Regulation & Autonomic Calibration',
      'Circadian Phase Entrainment in Neonates',
      'The Gut-Brain Axis in Early Infancy',
      'Maternal Stress Biomarkers and Infant Cortisol Reactivity',
      'Developmental Milestones Through a Maternal Health Lens'
    ],
    sampleChapters: [
      {
        id: 'chap-ped-1',
        chapterNumber: 1,
        title: 'The Biology of Co-Regulation',
        subtitle: 'Vagal nerve stimulation and cardiac coupling between parent and child',
        readingTimeMinutes: 11,
        content: [
          'The human newborn is born neurobiologically incomplete, requiring external regulatory inputs—skin-to-skin contact, vocal cadence, and vestibular rocking—to calibrate its autonomic nervous system.',
          'When an infant is held against maternal chest skin, high-frequency heart rate variability (HRV) metrics in both dyad members synchronize within eight minutes, lowering infant salivary cortisol and stabilizing blood glucose.'
        ]
      }
    ]
  }
];
