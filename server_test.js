// server_test.js
const express = require('express');
const app = express();

// pasang protection patch — patch sudah mendaftarkan express.json({limit:...}) dan middleware lainnya
require('./protection-patch.js')(app);

const port = process.env.PORT || 3000;

// root
app.get('/', (req, res) => {
  res.send('Simple Express server berjalan dengan normal');
});

// endpoint bebas contoh
app.get('/free', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Ini endpoint bebas (GET /free)',
    timestamp: new Date().toISOString(),
  });
});

// endpoint untuk meng-echo body (POST)
app.post('/echo', (req, res) => {
  const body = req.body;
  res.json({
    received: body,
    message: 'Data diterima dan dikembalikan (echo)'
  });
});

// contoh endpoint bebas tambahan: query params
app.get('/greet', (req, res) => {
  const name = req.query.name || 'teman';
  res.json({ greeting: `Halo, ${name}!` });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
