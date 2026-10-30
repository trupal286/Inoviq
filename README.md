<p align="center">
  <img src="inoviq-logo.svg" alt="INOVIQ Logo" width="240" />
</p>

<h1 align="center">INOVIQ — Digital Visiting Card Catalog & Tactile Studio</h1>

<p align="center">
  <strong>Hand someone your card, <em>without</em> the paper.</strong><br>
  A modern, tactile web application to design, customize, catalog, and exchange physical & digital visiting cards with real-time 3D physics, QR contact exchange, and cloud synchronization.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18%2B-27AE60?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-v4.22-black?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/AngularJS-1.8.3-E23237?style=flat-square&logo=angularjs&logoColor=white" alt="AngularJS" />
  <img src="https://img.shields.io/badge/Tests-40%20Passed%20(12%20Suites)-success?style=flat-square&logo=jest&logoColor=white" alt="Jest Tests" />
  <img src="https://img.shields.io/badge/Design-Tactile%20System-52352D?style=flat-square" alt="Tactile Design System" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License MIT" />
</p>

---

##  Table of Contents

1. [Overview](#-overview)
2. [Key Features & Modules](#-key-features--modules)
3. [Templates Catalog (12 Archetypes)](#-templates-catalog-12-archetypes)
4. [Card Formats & Studio Modes](#-card-formats--studio-modes)
5. [Tactile Design System & Palette](#-tactile-design-system--palette)
6. [Technology Stack](#-technology-stack)
7. [Project Structure](#-project-structure)
8. [Getting Started](#-getting-started)
9. [REST API Reference](#-rest-api-reference)
10. [Test Suites & Quality Assurance](#-test-suites--quality-assurance)
11. [Software Estimation & COCOMO Metrics](#-software-estimation--cocomo-metrics)
12. [Mobile & Network Sharing](#-mobile--network-sharing)
13. [License](#-license)

---

##  Overview

**INOVIQ** transforms traditional paper visiting cards into an interactive, digital tactile experience that feels as tangible as heavyweight paper stock while leveraging modern web technologies:

- **Interactive 3D Perspective Tilt & Specular Reflection:** Real-time physics engine that rotates the card in 3D space with cursor/touch gyroscopic glare.
- **Dual Studio Modes:** Seamless toggle between **Edit Mode** (motionless flat card for precise typing, uploading, and layout adjustments) and **3D Preview Mode** (interactive physical perspective tilt).
- **Instant vCard QR Contact Exchange:** Generates live QR codes conforming to the RFC vCard standard—scan with any smartphone camera to import directly into phone contacts without third-party apps.
- **Physical Card OCR Scanner:** Capture a snapshot of any printed physical card using your device camera to automatically extract credentials and import them into your digital vault.
- **Curated Ready-to-Use Templates:** 12 production-grade card archetypes spanning Executive, Tech, Legal, Design, Architecture, and Luxury domains.
- **Persistent Vault & Categorized Catalog:** Organize personal collections across six structured domains (*Business, Science, Sports, Culture, Cinema, Tourism*) with live search, 3D flip inspection, and editing.

---

##  Key Features & Modules

###  1. Interactive 3D Card Studio (`/create-card`)
- **React 18 Engine:** High-performance, reactive canvas with zero layout lag.
- **4 Distinct Physical Formats:** Landscape Business Card, Portrait Event Pass, Square Social Media Post, and Mobile Screen Bio Pass.
- **Freeform Drag & Scale:** Position or resize custom logos and QR codes anywhere across the card canvas.
- **Tactile Typography Hierarchy:** Editorial fonts featuring Google Fonts' `Fraunces`, `Work Sans`, and `IBM Plex Mono`.
- **High-Resolution PNG Export:** Rasterize print-ready 3x resolution digital cards via `html2canvas`.
- **Direct Cloud Sync:** One-click save to personal MongoDB catalog with instant updates.

###  2. Curated Templates Gallery (`/templates`)
- **12 Handcrafted Archetypes:** Browse ready-to-use card styles with live 3D flip preview (front identity and live back QR code).
- **1-Click Studio Pre-load:** Select any archetype to launch directly into the Card Studio with pre-filled palettes and typography.
- **Domain Filter Pills:** Quickly filter templates by *Studio*, *Tech*, *Creative*, *Finance*, and *Craft*.

###  3. Digital Card Catalog & Vault (`/saved-cards` / `/contacts`)
- **Folder Categorization:** Organize saved cards into Business, Science, Sports, Culture, Cinema, and Tourism folders.
- **Instant Search:** Filter contacts in real time by name, company, or job title.
- **3D Inspect Modal:** Click any catalog entry to open an interactive 3D flip card with front credentials and live back QR code.
- **Direct vCard Export:** One-click `.vcf` file generation for offline contact backup and address book sync.

###  4. Physical Card & QR Scanner (`/scan`)
- **Live Camera Stream:** Camera integration powered by `html5-qrcode`.
- **OCR Card Extraction:** Photo upload or camera capture converts physical card text into digital catalog entries.
- **Camera Fallback Handling:** Gracefully falls back to manual entry or image upload if camera permissions are unavailable.

###  5. Authentication, Profile & Access Control (`/login`, `/signup`, `/profile`)
- **JWT & bcryptjs:** Cryptographic token issuance with secure salted password hashing.
- **Protected Routes & Guest Modal:** Unauthenticated visitors are prompted with a non-intrusive tactile Auth Modal before accessing restricted actions.
- **Profile Management:** Update personal identity credentials, manage unique usernames, and review catalog metrics.

###  6. Tactile Light / Dark Mode
- **Dual Aesthetic Palettes:** Switch between warm **Plaster Paper** and deep **Soot Charcoal** themes.
- **Flash-Free Hydration:** Pre-paint theme application saved in `localStorage`.

---

##  Templates Catalog (12 Archetypes)

| # | Template Name | Category | Base Palette & Accents | Typography |
|:---:|:---|:---|:---|:---|
| **01** | **Ledger** | Studio & Consulting | Charcoal `#2D3536` • Mist `#B3C9D6` • Gold Chip | `Fraunces` Serif |
| **02** | **Midnight Desk** | Tech & Founders | Obsidian `#18181B` • Silver Foil • Crisp White | `Work Sans` |
| **03** | **Stamped** | Creative & Agency | Crimson Wax `#7F1D1D` • Warm Sand • Amber | `Fraunces` Serif |
| **04** | **Brass Rule** | Finance & Legal | Espresso Leather `#451A03` • Brass Rules • Warm Ivory | `Fraunces` Serif |
| **05** | **Eucalyptus & Moss** | Architecture & Sage | Forest Sage `#37473D` • Ivory `#F2EFE2` • Gold Chip | `Fraunces` Serif |
| **06** | **Plaster Paper Light** | Craft & Minimal | Textured Plaster `#F2EFE2` • Dark Espresso `#52352D` | `Work Sans` |
| **07** | **Baby Blue Aurora** | Product & SaaS | Sky Aurora `#B1D4D0` • Glass Aura • Slate Ink | `Work Sans` |
| **08** | **Royal Monolith** | Executive & Luxury | Midnight Navy `#0F172A` • Electric Cyan `#38BDF8` | `Fraunces` Serif |
| **09** | **Cyber Neon** | Web3 & Gaming | Cyber Black `#050814` • Neon Matrix `#00FF9D` • Cyan | `IBM Plex Mono` |
| **10** | **Swiss Grid** | Typography Systems | Bauhaus White `#FFFFFF` • Vermilion Dot `#EF4444` | `Work Sans` |
| **11** | **Espresso Heritage** | Hospitality & Craft | Roasted Mocha `#3B231C` • Antique Brass `#F5D166` | `Fraunces` Serif |
| **12** | **Velvet Sunset** | Media & Entertainment | Royal Plum `#4A154B` • Coral Dusk • Honey Gold | `Fraunces` Serif |

---

##  Card Formats & Studio Modes

### Physical Formats Supported

```
┌─────────────────────────────────┐   ┌─────────────────┐   ┌─────────────────┐   ┌───────────────┐
│                                 │   │                 │   │                 │   │               │
│      Landscape Business         │   │  Portrait Pass  │   │   Square Post   │   │  Mobile Bio   │
│         560 × 320 px            │   │  340 × 510 px   │   │  420 × 420 px   │   │ 320 × 570 px  │
│                                 │   │                 │   │                 │   │               │
└─────────────────────────────────┘   └─────────────────┘   └─────────────────┘   └───────────────┘
```

### Studio Operating Modes

| Mode | Purpose | Mechanics |
|:---|:---|:---|
| **Edit Mode** | Form input, drag-and-drop repositioning, logo upload, color selection | Card is rendered flat and stationary with `transform: none` to prevent parallax drift while editing |
| **3D Preview** | Visual verification, presentation, and perspective inspection | Real-time 3D rotation (`rotateX`, `rotateY`) calculated via cursor/touch vectors with specular light glare overlay |

---

##  Tactile Design System & Palette

INOVIQ utilizes an architectural stationery palette with tactile, high-contrast tokens:

| Swatch | Token Name | Hex Code | Purpose |
|:---:|:---|:---:|:---|
|  | `--eucalyptus` | `#9A8678` | Secondary status pills, accent badges |
|  | `--mist` | `#AEC4D4` | Hover fills, subtle highlight borders |
|  | `--plaster` | `#EFEFE2` | Light mode canvas & card backgrounds |
|  | `--soot` | `#0A0A0A` | Dark mode base, primary ink typography |
|  | `--moss` | `#4B4038` | Active folder tabs, card borders |
|  | `--baby-blue` | `#AEC4D4` | Ambient aurora glows & specular sheen |
|  | `--espresso` | `#4B4038` | Primary CTA buttons & tactile stamps |
|  | `--stamp-red` | `#9C3D3D` | Destructive confirmations & wax stamps |

---

##  Technology Stack

### Frontend Architecture
- **HTML5 & Semantic Markup:** Accessible landmarks, SEO meta descriptions, and viewport optimization.
- **Vanilla CSS3:** Custom Design System tokens, 3D CSS transforms (`perspective: 1200px`, `preserve-3d`), responsive media queries.
- **React 18 & Babel Standalone:** Powers the tactile drag-and-transform Card Studio without build step dependencies.
- **AngularJS (v1.8.3):** State management for Catalog, Dashboard, Authentication services, and Contacts Vault.
- **Libraries:**
  - `qrcodejs` — Client-side vector QR code generation.
  - `html5-qrcode` — Hardware-accelerated camera QR & card scanning.
  - `html2canvas` — Print-ready PNG rasterization.

### Backend Architecture
- **Node.js (v18+) & Express.js (v4.22):** RESTful JSON API server and static asset host.
- **MongoDB & Mongoose (v9):** Document storage for users and cards with Atlas cloud support and automatic local fallback (`127.0.0.1:27017`).
- **Security & Utilities:**
  - `jsonwebtoken` — Signed JWT token issuance for stateless authorization.
  - `bcryptjs` — Salted one-way password hashing (10 salt rounds).
  - `cookie-parser` & `cors` — Cross-origin resource sharing and cookie parsing.

---

##  Project Structure

```
Inoviq/
├── Client/
│   ├── Pages/
│   │   ├── dashboard.html          # Main landing hero & 3D showcase card
│   │   ├── create-card.html        # React 3D Card Studio (Edit vs 3D Preview)
│   │   ├── templates.html          # 12 Curated Card Archetypes & flip gallery
│   │   ├── saved-cards.html        # Contacts vault, category folders & 3D inspect
│   │   ├── scan.html               # Camera QR scanner & physical card OCR
│   │   ├── profile.html            # User account settings & catalog metrics
│   │   ├── login.html              # Member login interface
│   │   └── signup.html             # User registration & password strength checker
│   ├── Style/
│   │   ├── style.css               # Master Design System (tokens, nav, light/dark)
│   │   ├── studio.css              # 3D Card Studio layout, tilt physics & glare
│   │   ├── dashboard.css           # Catalog views, grid systems & category tabs
│   │   ├── auth-modal.css          # Tactile guest popup modal styling
│   │   └── signup.css              # Authentication form layouts
│   ├── services/
│   │   ├── auth.service.js         # AngularJS authentication state & JWT management
│   │   └── auth-modal.service.js   # Non-intrusive guest popup controller
│   ├── app.js                      # Core AngularJS controllers & card storage
│   ├── routes.config.js            # Frontend routing configuration
│   └── inoviq-logo.svg             # Official brandmark vector
├── Server/
│   ├── config/
│   │   └── db.js                   # MongoDB Atlas connection & local fallback
│   ├── middleware/
│   │   └── auth.js                 # JWT Bearer verification middleware
│   ├── models/
│   │   ├── User.js                 # User schema, credentials & password compare
│   │   └── Card.js                 # Card schema (identity, colors, transforms, QR)
│   ├── routes/
│   │   ├── auth.js                 # /api/auth (signup, login, me, profile)
│   │   └── cards.js                # /api/cards (CRUD operations)
│   ├── utils/
│   │   ├── contactService.js       # Contact storage & duplicate validation
│   │   ├── validationHelper.js     # Sanitization, OCR parsing & input validation
│   │   └── vcardHelper.js          # RFC-compliant vCard (.vcf) serializer
│   ├── seedAdmin.js                # Default administrator seed script
│   └── server.js                   # Express application entry point
├── tests/                          # Automated Jest test suites (12 suites, 40 tests)
│   ├── ts01_registration.test.js
│   ├── ts02_login_jwt.test.js
│   ├── ts03_custom_card.test.js
│   ├── ts04_template_card.test.js
│   ├── ts05_qr_code.test.js
│   ├── ts06_cyclomatic_scan_save.test.js
│   ├── ts07_ocr_scan.test.js
│   ├── ts08_logo_detection.test.js
│   ├── ts09_contact_storage.test.js
│   ├── ts10_dashboard_crud.test.js
│   ├── ts11_vcard_export.test.js
│   └── ts12_access_control.test.js
├── scripts/
│   └── cocomo-calculator.js        # COCOMO II & Halstead complexity metrics CLI
├── inoviq-logo.svg                 # Root logo asset
├── package.json                    # Dependencies, scripts, and project metadata
└── README.md                       # Comprehensive documentation
```

---

##  Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance on `127.0.0.1:27017` or MongoDB Atlas cloud connection URI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/trupal286/Inoviq.git
   cd Inoviq
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/inoviq
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   ```
   > **Note:** If MongoDB Atlas is unavailable, the server automatically attempts a fallback to `mongodb://127.0.0.1:27017/inoviq`.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - **Local Browser:** [http://127.0.0.1:3000](http://127.0.0.1:3000)
   - **On Same Wi-Fi (Phone):** `http://<YOUR_LOCAL_IP>:3000` *(displayed automatically in the console output)*

---

##  REST API Reference

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Payload / Params | Auth Required |
|:---:|:---|:---|:---|:---:|
| `POST` | `/api/auth/signup` | Register new user account | `{ firstName, lastName, email, phone, password, confirmPassword }` | No |
| `POST` | `/api/auth/login` | Authenticate and issue JWT | `{ identifier, password }` | No |
| `GET` | `/api/auth/me` | Fetch authenticated profile | None | **Yes** (Bearer) |
| `PUT` | `/api/auth/profile` | Update user identity details | `{ firstName, lastName, username, phone }` | **Yes** (Bearer) |

### Card Management Endpoints (`/api/cards`)

| Method | Endpoint | Description | Payload / Params | Auth Required |
|:---:|:---|:---|:---|:---:|
| `GET` | `/api/cards` | Retrieve all cards for authenticated user | None | **Yes** (Bearer) |
| `GET` | `/api/cards/:id` | Retrieve single card by ID | URL parameter `:id` | **Yes** (Bearer) |
| `POST` | `/api/cards` | Create and store new visiting card | `{ fullName, role, company, email, phone, website, format, palette, ... }` | **Yes** (Bearer) |
| `PUT` | `/api/cards/:id` | Update existing card details / styling | URL parameter `:id` + updated fields | **Yes** (Bearer) |
| `DELETE` | `/api/cards/:id` | Delete card from vault | URL parameter `:id` | **Yes** (Bearer) |

---

##  Test Suites & Quality Assurance

The codebase includes **12 automated Jest test suites** verifying **40 test cases** across positive paths, negative paths, boundary cases, and security assertions:

```bash
npm test
```

### Test Suite Summary

| Suite | Description | Key Scenarios Tested |
|:---|:---|:---|
| **TS-01: User Registration** | Registration validation | Valid registration, duplicate email rejection, weak password refusal |
| **TS-02: Login & JWT Auth** | Authentication & tokens | Correct credentials token issuance, wrong password handling, NoSQL injection resistance |
| **TS-03: Custom Card Creation** | Studio card generation | Valid creation with logo, empty name rejection, oversized logo validation (> 2MB) |
| **TS-04: Template Card Creation** | Template instantiation | Instantiation from catalog archetype, missing mandatory fields rejection |
| **TS-05: QR Code Generation** | QR data encoding & sharing | Preview URL encoding, deleted card scan handling, corrupted token rejection |
| **TS-06: Cyclomatic Scan & Save** | Structural white-box paths | 5 Cyclomatic Complexity basis paths (unauthorized, invalid QR, deleted, duplicate, success) + camera fallback |
| **TS-07: Physical Card OCR** | OCR text extraction | Clear photo field extraction, blurry photo manual fallback, invalid file rejection |
| **TS-08: Logo Detection** | Branding extraction | Visual logo extraction & placeholder fallback |
| **TS-09: Contact Storage** | Storage integrity & XSS | Contact persistence, duplicate email warnings, script tag sanitization |
| **TS-10: Dashboard CRUD** | Vault lifecycle | Field editing, card deletion upon confirmation, search filtering & unmatched keyword handling |
| **TS-11: vCard Export** | RFC-compliant export | Complete contact `.vcf` export, single-name fallback, missing contact handling |
| **TS-12: Access Control** | Authorization & security | Token revocation on logout, 401 on unauthorized access, expired token rejection, IDOR prevention |

---

##  Software Estimation & COCOMO Metrics

INOVIQ includes an automated estimation and Halstead complexity analysis CLI based on the **COCOMO II** model:

```bash
npm run cocomo:calc
```

### Codebase Sizing

| Component | Files | Hand-written Lines | Source KLOC |
|:---|:---:|:---:|:---:|
| **Client HTML Pages** | 8 | 3,553 | 3.55 |
| **Client CSS Stylesheets** | 6 | 3,929 | 3.93 |
| **Client JavaScript (Controllers/Services)** | 1 | 1,829 | 1.83 |
| **Server JavaScript (Routes, Models, Utils)** | 13 | 1,028 | 1.03 |
| **Total Product Source** | **28** | **10,339** | **10.34** |

*(Note: Automated test files, configuration files, and `node_modules` are excluded from product sizing).*

### Basic COCOMO Estimation

$$\text{Effort} = a \times (\text{KLOC})^b \quad [\text{Person-Months}]$$
$$\text{Schedule} = c \times (\text{Effort})^d \quad [\text{Months}]$$

| Development Mode | Effort Multipliers ($a, b, c, d$) | Estimated Effort | Schedule Duration | Avg Staff Required |
|:---|:---:|:---:|:---:|:---:|
| **Organic** *(Default)* | $2.4, 1.05, 2.5, 0.38$ | **27.8 PM** | **8.9 Months** | **3.1 Persons** |
| **Semi-detached** | $3.0, 1.12, 2.5, 0.35$ | **40.8 PM** | **9.2 Months** | **4.4 Persons** |
| **Embedded** | $3.6, 1.20, 2.5, 0.32$ | **59.3 PM** | **9.2 Months** | **6.4 Persons** |

---

##  Mobile & Network Sharing

INOVIQ is fully responsive across smartphones, tablets, and desktops:

1. **Local Network Auto-Discovery:** On startup, the Express server detects your machine's local IPv4 network address and prints direct connection links in the terminal:
   ```text
   ╔══════════════════════════════════════════════════════╗
   ║              INOVIQ SERVER — v2.0.0                  ║
   ╠══════════════════════════════════════════════════════╣
   ║  -> Local:    http://127.0.0.1:3000                  ║
   ║  -> On Phone: http://192.168.1.x:3000                ║
   ║  -> API:      http://127.0.0.1:3000/api              ║
   ╚══════════════════════════════════════════════════════╝
   ```
2. **Mobile Studio UI:**
   - Compact top toolbar featuring quick mode toggles (`[ ✎ | 👁 ]`), icon actions, and concise save buttons.
   - Dynamic viewport auto-scaling for 3D card canvases without horizontal clipping or scroll jump.
   - 16px form inputs preventing forced mobile viewport zooming on iOS Safari and Android Chrome.

---

##  License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
