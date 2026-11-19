# PROJECT MEMORY & SYSTEM ARCHITECTURE: GyneWell Care & Wellness

> **CRITICAL INSTRUCTION FOR ALL AI MODELS (SYSTEM MEMORY PROTOCOL)**:
> This file is the single source of persistent memory for the **GyneWell** application.
> 1. **Read this file first** whenever continuing, modifying, debugging, or extending this project.
> 2. **Update this file immediately** after making any architectural, feature, database, routing, or state changes.
> 3. **Preserve core non-negotiable rules**:
>    - **Brand**: GyneWell (*Care & Wellness*), Medical Director **Dr. Oluremi Ilupeju, MD, FACOG**.
>    - **Palette & Typography**: Warm botanical editorial (`#faf8f5`, `#f4efe9`, `#3b4349`, `#7ea8a4`, `#c98b8b`, `#ddd7cd`), **100% sans-serif** (`Plus Jakarta Sans` / `Manrope`).
>    - **100% PDF-Only**: GyneWell sells digital clinical monographs in **PDF format only**. No physical stock levels, no inventory counts, no EPUB/audio/hardcover variants.
>    - **Role-Based Visibility (RBAC)**: The **Admin Panel** button and administrative controls must NEVER be visible to customers or guests. They are only rendered when an authenticated user with `role === 'admin'` is logged in.

---

## 1. Project Overview & Identity
- **Name**: GyneWell (*Care & Wellness*)
- **Tagline**: *"Care You Trust, Wellness You Deserve. For Her. For Health. For Life."*
- **Leadership**: Directed by **Dr. Oluremi Ilupeju, MD, FACOG** (Board-Certified Obstetrician & Gynecologist).
- **Core Domain**: Clinical publishing platform providing evidence-based maternal health monographs, peer-reviewed clinical PDFs, continuing medical education (CME), in-browser clinical reading with note annotation, and instant DRM-free PDF delivery.
- **Brand Assets in Workspace**:
  - Portrait / Avatar: `/public/assets/aistudio/Dr_Oluremi_Ilupeju_d7f8ed13.webp`
  - Primary Logo Mark: `/public/assets/aistudio/GyneWell_dp_1d15eb01.png`
  - Header / Cover Banner: `/public/assets/aistudio/GyneWell_Cover_24b322f1.png`
  - Secondary Graphic: `/public/assets/aistudio/image.png_60a00d67_2K_3b3c6d39.jpg`

---

## 2. Current Technical Architecture (What We Have Right Now)

### Tech Stack
- **Framework**: React 19 SPA powered by Vite 8.
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss";` in `src/index.css`) with sans-serif typography and warm botanical theme.
- **Server**: Full-stack Express server (`server.ts`) running on Node 22 native TypeScript / tsx on port 3000.
- **PDF Processing**:
  - `unpdf`: Server-side extraction of text, pages, and metadata from uploaded PDF buffers.
  - `pdf-lib`: Server-side generation and streaming of valid multi-page PDF documents.
- **Testing**: Node's built-in test runner (`node:test`, `node:assert/strict`) executed with `npx --yes tsx --test`.

### Application File Structure
```
/
├── PROJECT_MEMORY.md            # THIS FILE: Persistent project memory & guidelines
├── server.ts                    # Full-stack Express backend & API proxy
├── index.html                   # HTML entry point with synchronized metadata
├── metadata.json                # Project capabilities & description
├── package.json                 # Dependencies & build scripts
├── uploads/pdfs/                # Server storage for uploaded monograph PDFs
├── src/
│   ├── main.tsx                 # React DOM root entry
│   ├── App.tsx                  # Main application state, tab router, cart & session
│   ├── types.ts                 # TypeScript interfaces (Product, UserProfile, Order, etc.)
│   ├── index.css                # Global Tailwind CSS imports & theme rules
│   ├── components/
│   │   ├── Navbar.tsx           # Single-row brand navbar (RBAC-gated Admin Panel button)
│   │   ├── HeroSpotlight.tsx    # Featured clinical monograph hero banner
│   │   ├── MonographCatalog.tsx # Compendium filterable grid (PDF-only, CME, badges)
│   │   ├── ClinicalReader.tsx   # Interactive reader with chapters, notes & download link
│   │   ├── AdminPanel.tsx       # 3-step PDF Upload/Parse/Publish modal & sales metrics
│   │   ├── AuthModal.tsx        # Unified customer & admin login/reg (no visible admin buttons)
│   │   ├── CartDrawer.tsx       # Instant digital slide-out cart with promo code engine
│   │   ├── CheckoutModal.tsx    # Payment simulation (Card Luhn check / Google Pay)
│   │   └── CustomerProfile.tsx  # Clinician library, synced notes, order history & downloads
│   ├── data/
│   │   └── monographs.ts        # Seeded peer-reviewed clinical monographs (all PDF)
│   └── utils/
│       ├── pdf-parser.ts        # Pure PDF buffer validator, category classifier, ISBN & TOC extractor
│       ├── pdf-parser.test.ts   # 6 unit tests for PDF extraction and sanitization
│       ├── shop-logic.ts        # Promo engine, Luhn validator, metrics math, RBAC helpers
│       └── shop-logic.test.ts   # 7 unit tests for pricing, licenses, and RBAC guards
```

### Verified Features & Working Journeys
1. **Customer Catalog & Sample Reading**: Browse monographs across 6 clinical specialties; view ratings, page counts, CME credits; click "Read Free Sample" to immediately load preview chapters in the reader.
2. **Instant Checkout & Licensing**: Add PDF to bag, apply promo codes (e.g. `CLINICAL10`, `WELLNESS20`), validate payment, generate encrypted license keys (`GW-LIC-...`), and unlock instant DRM-free download links.
3. **Interactive Clinical Reader**: Navigate chapters, track reading completion percentages, highlight quotes, save clinical notes, and download the full PDF when unlocked.
4. **Role-Based Admin Protection (RBAC)**:
   - For customers and guests: **No Admin Panel button** in header, mobile bar, or footer, and **no Administrator button** in the login modal.
   - For admins (`admin@gynewell.clinic`): Logging in through the standard sign-in form recognizes the admin account and reveals the **Admin Panel button**.
5. **Admin PDF Upload & Automated Parsing Pipeline**:
   - Strictly enforces `.pdf` files (validates extension, MIME type, and `%PDF-` binary magic header). Non-PDF files are rejected with an inline alert.
   - Automatically parses title, subtitle, author, ISBN, category, synopsis, and structured chapters.
   - Admin reviews/edits fields, selects a cover image, and clicks **"Post E-Book to Storefront"** to publish immediately to the live catalog.
6. **Direct PDF Delivery API**:
   - `GET /api/products/:id/pdf` streams the exact uploaded PDF binary or generates a multi-page PDF with ASCII-safe encoding for seeded monographs.

---

## 3. Architecture Answers: Zero-Cost Storage, Customer Profiles & Database

### A. How to Store PDF Products with Zero Cost?
In production, storing large PDF files directly in a database or paying expensive egress fees for book downloads is inefficient. The industry standard zero-cost solution:

1. **Recommended: Cloudflare R2 (Object Storage with $0 Egress)**
   - **Free Tier**: 10 GB of stored files per month forever, 1,000,000 Class A operations (uploads), 10,000,000 Class B operations (reads).
   - **Killer Advantage**: **$0 Egress Fees**. Unlike AWS S3 or Google Cloud Storage, Cloudflare charges zero dollars for bandwidth when customers download 20MB–50MB PDFs.
   - **Implementation**: Admin uploads PDF -> backend stores in R2 bucket via S3-compatible SDK -> download endpoint generates a pre-signed temporary download URL or streams securely to authorized buyers.
2. **Alternative: Firebase Storage (Google Cloud Storage via Spark Free Plan)**
   - **Free Tier**: 5 GB stored data, 1 GB/day download bandwidth, 20,000 upload ops/day, 50,000 download ops/day.
   - Seamlessly integrates if using Firebase Authentication and Firestore.
3. **Current Container Storage (Development / Staging)**:
   - PDFs are stored in `/uploads/pdfs/` on local disk inside the container. This costs $0 in AI Studio preview.

### B. How to Handle Customer Profiles & Role by Login Credentials?
1. **User Schema**:
   ```typescript
   interface UserProfile {
     id: string;
     email: string;
     name: string;
     role: 'customer' | 'admin';
     avatar?: string;
     provider: 'email' | 'google' | 'apple' | 'twitter';
     purchasedProductIds: string[]; // List of unlocked monograph IDs
     readingProgress: Record<string, { chapterId: string; progressPercent: number; lastReadAt: string }>;
     bookmarks: string[];
     notes: Array<{ id: string; productId: string; chapterId: string; text: string; quote?: string; createdAt: string }>;
     wishlist: string[];
     createdAt: string;
   }
   ```
2. **Credential Authentication Flow**:
   - **Customer Registration/Login**: Email + password or 1-tap Google/Apple OAuth. Role is automatically `'customer'`.
   - **Admin Authentication**: Admin logs in via the discreet Administrator login with verified admin email (e.g. `admin@gynewell.clinic`). Password verification grants `role: 'admin'`.
   - **Session Verification**: In production, backend issues an HTTP-only secure JWT containing `{ userId, role, email }`.
   - **Route & UI Enforcement**:
     - UI: `isAdminUser(currentUser)` gates navigation items and routes.
     - Backend: Middleware checks `req.user.role === 'admin'` before allowing access to `/api/admin/*` endpoints.

### C. Do We Need a Database?
- **In Development/Staging**: Currently running with in-memory state in `server.ts` + `/uploads/pdfs/` on disk.
- **For Production**: **YES**, a database is required. When a server container scales down or restarts, in-memory state would lose newly registered customers, purchased licenses, and uploaded books.
- **Zero-Cost Production Database Options**:
  1. **Firebase Firestore (Free Spark Plan)**:
     - 1 GB storage, 50,000 document reads/day, 20,000 document writes/day.
     - Perfect match for real-time customer reading sync, user profiles, orders, and products.
     - Can be provisioned via AI Studio's `set_up_firebase` tool.
  2. **Cloud SQL / PostgreSQL (Developer Free/Scale-to-Zero)**:
     - Relational tables (`users`, `products`, `orders`, `user_notes`, `licenses`) managed via Drizzle ORM.
     - Can be provisioned via AI Studio's `cloudsql-setup` tool.

---

## 4. Industry-Standard Production Requirements Checklist

### Phase 1: Security & Identity (RBAC)
- [x] Role-gated frontend navigation (Admin Panel button hidden from customers/guests).
- [x] Dedicated Administrator Sign-In mode with credential validation.
- [x] Defense-in-depth UI route guard redirecting unauthorized users back to catalog.
- [ ] Production bcrypt password hashing for all stored credentials.
- [ ] JWT / HTTP-only secure cookie session tokens with expiration and refresh flows.
- [ ] Server-side middleware (`requireAuth`, `requireAdmin`) protecting all `/api/admin/*` endpoints.

### Phase 2: Zero-Cost Persistent Storage & Database
- [ ] Provision persistent database (Firebase Firestore or PostgreSQL via Cloud SQL).
- [ ] Migrate `products`, `users`, `orders`, and `sync` collections/tables to persistent store.
- [ ] Connect Cloudflare R2 or Firebase Storage for persistent zero-cost PDF binary storage.
- [ ] Store uploaded PDF files with hash-based unique identifiers and checksum validation.

### Phase 3: E-Commerce & Checkout Integrity
- [x] Shopping cart drawer with subtotal, tax calculation, and promotional discount engine.
- [x] Credit card Luhn validation and MM/YY expiry checks.
- [x] Digital license key generation upon completed order (`GW-LIC-...`).
- [x] Order history saved to customer profile with receipt references.
- [ ] Real payment processor integration (Stripe Elements / Checkout or PayPal) using webhook callbacks for license issuance.

### Phase 4: PDF Processing, DRM & Delivery
- [x] Client and server `.pdf` extension and MIME type validation.
- [x] `%PDF-` magic binary header validation to prevent non-PDF file spoofing.
- [x] Server-side parsing of title, author, ISBN, category, page count, word count, TOC, and chapters.
- [x] In-browser Clinical Reader with chapter excerpts and custom note highlights.
- [x] Direct streaming download endpoint (`GET /api/products/:id/pdf`).
- [ ] Optional: Dynamic customer email & license watermarking on downloaded PDF cover page.

### Phase 5: Admin Management & Medical Director Tools
- [x] 3-step PDF Upload -> Review & Edit -> Publish modal.
- [x] Live sales telemetry and specialty category breakdown.
- [x] Product catalog manager with inline price & version editing.
- [ ] Admin PDF delete / unpublish capability.
- [ ] Customer account management and license revocation tools.

---

## 5. Maintenance Protocol for Future AI Models
Whenever modifying this codebase:
1. **Always read this file first** to understand brand constraints and current architecture.
2. **Never revert PDF-only rules**: Do not introduce stock counts, physical shipping, or non-PDF formats.
3. **Never expose the Admin Panel to non-admins**: Keep `isAdminUser(currentUser)` checks in place.
4. **Run verification after edits**:
   - Unit tests: `npx --yes tsx --test src/utils/shop-logic.test.ts src/utils/pdf-parser.test.ts`
   - Build: `compile_applet`
   - Lint: `lint_applet`
5. **Update this file**: Add any newly created components, endpoints, database schemas, or dependencies to Sections 2 and 4.
