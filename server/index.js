import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClaim, getAllClaims, getClaimsByPlayer } from './store.js';
import { validateWithdrawRequest } from './validate.js';

const app = express();
const PORT = Number(process.env.PORT || process.env.REWARD_API_PORT || 3001);
const ADMIN_KEY = process.env.REWARD_ADMIN_KEY || '';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set('trust proxy', 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0) {
        callback(null, true);
        return;
      }
      callback(null, allowedOrigins.includes(origin));
    },
  })
);
app.use(express.json({ limit: '32kb' }));

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'balls-reward-api',
    message: 'BULL BALLS reward payout API',
    endpoints: {
      health: 'GET /api/health',
      withdraw: 'POST /api/withdraw',
      history: 'GET /api/withdraw/history/:playerId',
      adminClaims: 'GET /api/admin/claims (header: x-admin-key)',
    },
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'balls-reward-api',
    storage: process.env.CLAIMS_DATA_DIR ? 'volume' : 'local',
  });
});

app.post('/api/withdraw', (req, res) => {
  try {
    const payload = validateWithdrawRequest(req.body);
    const claim = createClaim(payload);
    res.status(201).json({
      ok: true,
      claimId: claim.id,
      status: claim.status,
      reviewRequired: claim.reviewRequired,
      message:
        claim.status === 'review'
          ? 'Claim queued for manual review before payout.'
          : 'Claim queued for SOL payout.',
    });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message || 'Withdraw rejected.' });
  }
});

app.get('/api/withdraw/history/:playerId', (req, res) => {
  const playerId = req.params.playerId?.trim();
  if (!playerId) {
    res.status(400).json({ ok: false, error: 'Missing player id.' });
    return;
  }
  res.json({ ok: true, claims: getClaimsByPlayer(playerId) });
});

app.get('/api/admin/claims', (req, res) => {
  if (!ADMIN_KEY || req.headers['x-admin-key'] !== ADMIN_KEY) {
    res.status(401).json({ ok: false, error: 'Unauthorized.' });
    return;
  }
  res.json({ ok: true, claims: getAllClaims(200) });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`BALLS reward API listening on port ${PORT}`);
  if (!ADMIN_KEY) {
    console.warn('WARNING: REWARD_ADMIN_KEY is not set — admin endpoints disabled.');
  }
  if (allowedOrigins.length > 0) {
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
  }
});
