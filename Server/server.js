const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from Client/Pages (HTML, JS) and Client (CSS)
app.use(express.static(path.join(__dirname, '../Client/Pages')));
app.use(express.static(path.join(__dirname, '../Client')));

// Root → dashboard.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Client/Pages/dashboard.html'));
});

app.listen(PORT, () => {
  console.log(`\n  Inoviq running at:\n`);
  console.log(`  ➜  Local:   http://127.0.0.1:${PORT}`);
  console.log(`  ➜  Network: http://192.168.0.112:${PORT}\n`);
});
