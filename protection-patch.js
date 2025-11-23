// protection-patch.js
const express = require('express'); 
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

module.exports = function (app) {
  const RATE_WINDOW_MS = 60 * 1000;
  const RATE_MAX = 100;
  const SLOWDOWN_WINDOW_MS = 60 * 1000;
  const SLOWDOWN_DELAY_AFTER = 50;

  // express-slow-down terbaru TIDAK menerima angka di delayMs
  const SLOWDOWN_DELAY_MS = () => 50;

  // Hilangkan warning dari express-slow-down
  const VALIDATE_OPTIONS = { delayMs: false };

  // jika behind proxy
  app.set('trust proxy', true);

  // security headers
  app.use(helmet());

  // Batasi ukuran body JSON
  app.use(express.json({ limit: '100kb' }));

  // Hard rate limiter
  const limiter = rateLimit({
    windowMs: RATE_WINDOW_MS,
    max: RATE_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ error: 'Too many requests, please try again later.' });
    },
  });

  // Soft slowdown — BAGIAN YANG DIPERBAIKI
  const speedLimiter = slowDown({
    windowMs: SLOWDOWN_WINDOW_MS,
    delayAfter: SLOWDOWN_DELAY_AFTER,
    delayMs: SLOWDOWN_DELAY_MS,   // ← bukan angka lagi
    validate: VALIDATE_OPTIONS,   // ← hilangkan warning
  });

  // terapkan global
  app.use(speedLimiter);
  app.use(limiter);

  // logger ringan
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`);
    next();
  });
};
