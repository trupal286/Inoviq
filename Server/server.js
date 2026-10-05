/* ==========================================================================
   INOVIQ — Express.js Server
   MongoDB + JWT Authentication + Card CRUD API
   ========================================================================== */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');

const app = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ── API Routes ── */
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);

/* ── Serve static files from Client ── */
app.use(express.static(path.join(__dirname, '../Client')));
app.use(express.static(path.join(__dirname, '../Client/Pages')));
app.use('/Style', express.static(path.join(__dirname, '../Client/Style')));

/* ── Page Routes (serve HTML pages) ── */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Client/Pages/dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../Client/Pages/login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../Client/Pages/signup.html'));
});

app.get('/create-card', (req, res) => {
  res.sendFile(path.join(__dirname, '../Client/Pages/create-card.html'));
});

/* ── Connect to MongoDB then start server ── */
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n  ╔══════════════════════════════════════════╗`);
    console.log(`  ║        INOVIQ SERVER — v2.0.0            ║`);
    console.log(`  ╠══════════════════════════════════════════╣`);
    console.log(`  ║  ➜  Local:   http://127.0.0.1:${PORT}       ║`);
    console.log(`  ║  ➜  API:     http://127.0.0.1:${PORT}/api   ║`);
    console.log(`  ╚══════════════════════════════════════════╝\n`);
  });
});
