const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from Client root, Client/Pages, and Client/Style
app.use(express.static(path.join(__dirname, '../Client')));
app.use(express.static(path.join(__dirname, '../Client/Pages')));
app.use('/Style', express.static(path.join(__dirname, '../Client/Style')));

// Routes
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

app.listen(PORT, () => {
  console.log(`\n  Inoviq running at:\n`);
  console.log(`  ➜  Local:   http://127.0.0.1:${PORT}`);
  console.log(`  ➜  Network: http://192.168.0.112:${PORT}\n`);
});

