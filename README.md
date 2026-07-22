# Inoviq
Inoviq is a web app that digitalizes visiting cards users create a custom or template-based digital business card and save it securely in their personal in-app dashboard, no more paper cards to lose.
---

## Problem Statement

Physical visiting cards are easy to lose and tedious to re-type into a phone. This app lets a user:
- Create a digital visiting card (custom design or template-based)
- Generate a QR code for that card to share instantly
- Scan someone else's QR code (or a physical printed card / logo) to import their details
- Save the scanned/shared card as a full contact entry (not just a phone number) inside the app

---
## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | AngularJS, HTML5, CSS3 |
| Backend / API | Django, Django REST Framework |
| Database | MongoDB (via Djongo / PyMongo) |
| QR Generation | `qrcode` (Python) or `angularjs-qrcode` (frontend) |
| OCR / Card Scanning | Tesseract OCR / Google Vision API / OpenCV (for logo detection) |
| Auth | Django + JWT (Token-based auth for SPA) |
| Deployment | Nginx + Gunicorn + Docker (optional) |

---
## Core Features

1. **Card Creation**
   - Blank custom card builder (drag-drop fields, choose colors/fonts/logo)
   - Ready-made templates (select + fill in details)
2. **QR Code Sharing**
   - Each saved card auto-generates a unique QR code
   - QR encodes a link/token to fetch full card data (not just vCard text, so branding/logo is preserved)
3. **Scan to Save**
   - Scan another user's QR → preview card → Save to My Contacts
   - Scan a physical card (camera) → OCR extracts text fields → user confirms/edits → Save
   - Scan/detect a logo on a card → match/store as company branding image
4. **Contact Storage**
   - Every saved contact stores: Name, Designation, Company Name, Company Logo, Phone Number(s), Email, Website, Work Address, Work Info/Bio, Social Links, Tags/Notes
5. **My Cards Dashboard**
   - View, edit, delete own cards
   - View, search, filter saved contacts (received cards)
6. **Export**
   - Export a contact to phone's native contacts (vCard `.vcf` download)

---
## Project Structure 

```
visiting-card-app/
├── backend/                  # Django project
│   ├── manage.py
│   ├── config/                # settings, urls, wsgi
│   ├── users/                 # auth app
│   ├── cards/                 # card CRUD + QR generation
│   ├── scanning/              # OCR + logo detection app
│   ├── contacts/              # saved contacts app
│   └── templates_module/      # ready-made templates app
├── frontend/                  # AngularJS app
│   ├── app/
│   │   ├── components/        # card-builder, qr-scanner, contact-list, template-gallery
│   │   ├── services/          # api.service.js, auth.service.js
│   │   ├── controllers/
│   │   └── views/             # html partials
│   ├── assets/                # css, images, fonts
│   └── index.html
├── docs/
│   ├── README.md
│   └── WORKFLOW.md
└── docker-compose.yml
```

---
## Folder Structure 

inoviq/
├── backend/                              # Django project
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   │
│   ├── config/                           # project-level settings
│   │   ├── __init__.py
│   │   ├── settings.py                   # MongoDB/Djongo config, JWT, CORS
│   │   ├── urls.py                       # root URL router → includes each app's urls
│   │   └── wsgi.py
│   │
│   ├── users/                            # auth app
│   │   ├── models.py                     # User document (mongoengine/Djongo)
│   │   ├── serializers.py                # signup/login serializers
│   │   ├── views.py                      # SignupView, LoginView, MeView
│   │   ├── urls.py
│   │   └── permissions.py                # JWT auth guard
│   │
│   ├── templates_module/                 # ready-made template definitions
│   │   ├── models.py                     # Template document (name, previewImage, layoutId)
│   │   ├── serializers.py
│   │   ├── views.py                      # list templates
│   │   ├── urls.py
│   │   └── fixtures/
│   │       └── default_templates.json    # seed data for the template gallery
│   │
│   ├── cards/                            # card creation + QR
│   │   ├── models.py                     # Card document (all fields: name, designation, company, logo, phone, email, website, address, workInfo, socials, tags)
│   │   ├── serializers.py
│   │   ├── views.py                      # CRUD (create/edit/delete/list own cards)
│   │   ├── urls.py
│   │   ├── qr_generator.py               # builds QR (encodes a link/token, not raw text)
│   │   └── tests.py
│   │
│   ├── scanning/                         # OCR + logo detection
│   │   ├── views.py                      # ScanUploadView (accepts photo/QR token)
│   │   ├── urls.py
│   │   ├── ocr_service.py                # Tesseract / Google Vision text extraction
│   │   ├── logo_detector.py              # OpenCV logo/region detection
│   │   └── utils.py                      # image preprocessing (crop, deskew, grayscale)
│   │
│   ├── contacts/                         # saved/received contacts
│   │   ├── models.py                     # Contact document (linked to source card or manual scan)
│   │   ├── serializers.py
│   │   ├── views.py                      # save/list/search/filter/delete contacts
│   │   ├── urls.py
│   │   └── vcf_export.py                 # generates .vcf for "export to phone contacts"
│   │
│   └── common/
│       ├── mongo_utils.py                # shared Djongo/PyMongo connection helpers
│       └── pagination.py
│
├── frontend/                             # AngularJS app
│   ├── index.html
│   ├── app/
│   │   ├── app.module.js                 # angular.module('inoviqApp', [...])
│   │   ├── app.routes.js                 # ngRoute / ui-router config
│   │   │
│   │   ├── components/
│   │   │   ├── card-builder/
│   │   │   │   ├── card-builder.component.js
│   │   │   │   ├── card-builder.html
│   │   │   │   └── card-builder.css
│   │   │   ├── template-gallery/
│   │   │   │   ├── template-gallery.component.js
│   │   │   │   └── template-gallery.html
│   │   │   ├── qr-display/
│   │   │   │   ├── qr-display.component.js   # renders generated QR (angularjs-qrcode)
│   │   │   │   └── qr-display.html
│   │   │   ├── qr-scanner/
│   │   │   │   ├── qr-scanner.component.js   # camera access, decode QR/photo
│   │   │   │   └── qr-scanner.html
│   │   │   └── contact-list/
│   │   │       ├── contact-list.component.js
│   │   │       └── contact-list.html
│   │   │
│   │   ├── controllers/
│   │   │   ├── dashboard.controller.js
│   │   │   ├── login.controller.js
│   │   │   └── signup.controller.js
│   │   │
│   │   ├── services/
│   │   │   ├── api.service.js            # $http wrapper for all backend calls
│   │   │   ├── auth.service.js           # JWT storage, login/logout
│   │   │   ├── card.service.js
│   │   │   ├── scan.service.js
│   │   │   └── contact.service.js
│   │   │
│   │   └── views/
│   │       ├── login.html
│   │       ├── signup.html
│   │       ├── dashboard.html
│   │       ├── create-card.html
│   │       └── my-contacts.html
│   │
│   └── assets/
│       ├── css/
│       │   └── theme.css                 # lavender/white shared theme
│       ├── images/
│       └── fonts/
│
├── docs/
│   ├── README.md
│   └── WORKFLOW.md
│
├── docker-compose.yml                    # backend + mongo + nginx services
└── .gitignore

---