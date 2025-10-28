// protection-patch.js
const express = require('express'); // <- PENTING
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

module.exports = function (app) {
  const RATE_WINDOW_MS = 60 * 1000;
  const RATE_MAX = 100;
  const SLOWDOWN_WINDOW_MS = 60 * 1000;
  const SLOWDOWN_DELAY_AFTER = 50;
  const SLOWDOWN_DELAY_MS = 50;

  // jika behind proxy
  app.set('trust proxy', true);

  // security headers
  app.use(helmet());

  // Batasi ukuran body JSON DI SINI (pastikan server_test.js TIDAK juga memanggil express.json())
  app.use(express.json({ limit: '100kb' }));

  // hard rate limiter
  const limiter = rateLimit({
    windowMs: RATE_WINDOW_MS,
    max: RATE_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ error: 'Too many requests, please try again later.' });
    },
  });

  // soft slowdown
  const speedLimiter = slowDown({
    windowMs: SLOWDOWN_WINDOW_MS,
    delayAfter: SLOWDOWN_DELAY_AFTER,
    delayMs: SLOWDOWN_DELAY_MS,
  });

  // terapkan (global) — ubah ke route-specific jika perlu
  app.use(speedLimiter);
  app.use(limiter);

  // logger ringan
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`);
    next();
  });
};
