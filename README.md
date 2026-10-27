<p align="center">
  <img src="inoviq-logo.svg" alt="INOVIQ Logo" width="220" />
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
  <img src="https://img.shields.io/badge/Design-Tactile%20System-52352D?style=flat-square" alt="Tactile Design System" />
  <img src="https://img.shields.io/badge/License-MIT-blue.style=flat-square" alt="License MIT" />
</p>

---

##  Overview

**INOVIQ** reimagines how professionals network and exchange contact details. Traditional paper visiting cards get lost, torn, or misplaced. INOVIQ provides a tactile, interactive digital card experience that feels as tangible as real paper stock, enriched with:

- **Interactive 3D Tilt Physics & Specular Lighting:** Cards react to cursor movement and gyroscopic perspective.
- **Two Specialized Studio Modes:** Switch between **Edit Mode** (flat, stationary card for millimeter-precise editing) and **3D Preview** (interactive physical perspective tilt).
- **Instant Contact Sharing via QR:** Any smartphone camera scans the generated QR code to immediately import all credentials directly into phone contacts (vCard).
- **Physical Card Scanner & OCR Importer:** Scan physical visiting cards via camera to convert them directly into digital catalog entries.
- **Persistent Vault & Catalog:** Organize cards by categories (Business, Science, Sports, Culture, Cinema, Tourism) with search and instant flip preview.

---

##  Features

###  1. Interactive 3D Card Studio (`/create-card`)
- **React 18 Engine:** High-performance, reactive canvas with zero layout lag.
- **Dual Studio Modes:**
  - ** Edit Mode:** Keeps the card flat and motionless for easy typing, uploading, and positioning.
  - ** 3D Preview Mode:** Engages dynamic 3D cursor-following tilt and specular glare reflections.
- **Freeform Drag & Resize:** Reposition or scale your QR code and custom logo directly on the card canvas.
- **Curated Tactile Palettes:** Choose from signature finishes like *Inoviq Soot & Mist*, *Plaster Paper Light*, *Cyberpunk Monolith*, *Emerald Executive*, and *Midnight Hologram*.
- **Editorial Typography System:** Powered by `Fraunces` editorial serif, `Work Sans`, and `IBM Plex Mono`.
- **One-Click High-Res PNG Export:** Render 3x resolution print-ready digital cards using `html2canvas`.

###  2. Digital Card Catalog & Vault (`/saved-cards.html`)
- Categorize your personal collection into business, science, sports, and creative folders.
- Search cards in real-time by name, company, or job role.
- 3D Inspect Modal: Click any card to pop up an interactive 3D flip card with front identity and live back QR code.

###  3. Camera Scanner & Import (`/scan.html`)
- Live camera stream integration via `html5-qrcode`.
- Scan QR codes or physical cards to capture contact information on the fly.
- Auto-formats vCard payloads directly into your personal catalog.

###  4. Secure Authentication & Profile (`/login.html`, `/signup.html`, `/profile.html`)
- User registration and login powered by **JWT (JSON Web Tokens)** and **bcryptjs** password hashing.
- Token management via HTTP-only / secure cookie sessions.
- Profile dashboard to edit details, manage account credentials, and inspect card statistics.

###  5. Tactile Light / Dark Mode
- Seamless theme switching between warm **Plaster Paper** and deep **Soot Charcoal** modes.
- Instant, flash-free theme hydration stored in `localStorage`.

---

##  Tactile Design System & Palette

INOVIQ is styled with a bespoke, human-crafted tactile design system inspired by architectural stationery and matte printmaking:

| Swatch | Color Name | Hex Code | Purpose |
|:---:|:---|:---:|:---|
|  | **Eucalyptus** | `#98AA9D` | Secondary accents, status pills |
|  | **Mist** | `#B3C9D6` | Subtle highlight borders & hover fills |
|  | **Plaster** | `#F2EFE2` | Light mode canvas background |
|  | **Soot** | `#2D3536` | Dark mode base & deep ink text |
|  | **Moss** | `#697C70` | Active folder tabs & primary accents |
|  | **Baby Blue** | `#B1D4D0` | Aurora glows & ambient lighting |
|  | **Espresso** | `#52352D` | Primary action buttons & contrast stamps |

---

##  Technology Stack

- **Frontend:**
  - **HTML5 & Vanilla CSS3:** Custom tactile design system, CSS 3D transforms (`perspective`, `rotateX`, `rotateY`), custom properties.
  - **AngularJS (1.8.3):** Manages Catalog, Dashboard, Scan, and Authentication controllers.
  - **React 18 & Babel Standalone:** Powers the drag-and-transform Card Studio.
  - **qrcodejs & html5-qrcode:** Client-side QR generation and live camera decoding.
  - **html2canvas:** High-resolution card PNG rasterization.
- **Backend:**
  - **Node.js & Express.js:** RESTful API and static assets server.
  - **MongoDB & Mongoose:** Card documents, user accounts, and authentication storage (Atlas cloud or local fallback).
  - **JWT & bcryptjs:** Cryptographic authentication, password salting, and secure cookie sessions.

---

##  Project Structure

```
Inoviq/
├── Client/
│   ├── Pages/
│   │   ├── dashboard.html     # Main landing page & hero 3D card stage
│   │   ├── create-card.html   # React 3D Card Studio (Edit vs 3D Preview)
│   │   ├── saved-cards.html   # Card Catalog, categories & inspect modal
│   │   ├── scan.html          # Camera QR scanner & card importer
│   │   ├── profile.html       # User profile & account settings
│   │   ├── login.html         # Member login page
│   │   └── signup.html        # Account creation & password strength check
│   ├── Style/
│   │   ├── style.css          # Master Design System (tokens, nav, theme)
│   │   ├── studio.css         # 3D Card Studio layout, tilt physics, glare
│   │   ├── dashboard.css      # Catalog view and layout styles
│   │   └── signup.css         # Auth form styles
│   └── app.js                 # AngularJS core app & controllers
├── Server/
│   ├── config/
│   │   └── db.js              # MongoDB Atlas / local connection logic
│   ├── models/
│   │   ├── User.js            # User mongoose schema & password hashing
│   │   └── Card.js            # Card schema (transforms, colors, identity)
│   ├── routes/
│   │   ├── auth.js            # /api/auth (signup, login, me, logout)
│   │   └── cards.js           # /api/cards (CRUD operations)
│   └── server.js              # Express server entry point
├── inoviq-logo.svg            # Official INOVIQ brandmark logo
├── .env.example               # Environment variables template
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

---

##  Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance running on `127.0.0.1:27017` or a MongoDB Atlas Cloud URI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/trupal286/Inoviq.git
   cd Inoviq
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to configure your settings:
   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/inoviq
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   ```
   *(Note: The server will automatically attempt a fallback to `mongodb://127.0.0.1:27017/inoviq` if an Atlas cloud cluster is unreachable).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

##  API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|:---:|:---|:---|:---:|
| `POST` | `/api/auth/signup` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate and issue JWT cookie | No |
| `GET` | `/api/auth/me` | Get currently logged-in user profile | Yes (JWT) |
| `POST` | `/api/auth/logout` | Clear session cookie | No |
| `GET` | `/api/cards` | Retrieve user's catalog of cards | Yes (JWT) |
| `POST` | `/api/cards` | Create and save a new card | Yes (JWT) |
| `PUT` | `/api/cards/:id` | Update card credentials or visual styles | Yes (JWT) |
| `DELETE` | `/api/cards/:id` | Delete card from catalog | Yes (JWT) |

---

##  License

This project is licensed under the **MIT License**.
