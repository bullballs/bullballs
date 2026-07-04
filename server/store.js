import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.CLAIMS_DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'claims.json');

function defaultData() {
  return { claims: [], players: {} };
}

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return defaultData();
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return {
      claims: Array.isArray(parsed.claims) ? parsed.claims : [],
      players: parsed.players && typeof parsed.players === 'object' ? parsed.players : {},
    };
  } catch {
    return defaultData();
  }
}

function writeData(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function getPlayerRecord(playerId) {
  const data = readData();
  return data.players[playerId] || null;
}

export function getClaimsByPlayer(playerId, limit = 20) {
  const data = readData();
  return data.claims
    .filter((claim) => claim.playerId === playerId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

export function getAllClaims(limit = 100) {
  const data = readData();
  return [...data.claims].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export function createClaim(payload) {
  const data = readData();
  const now = Date.now();

  if (!data.players[payload.playerId]) {
    data.players[payload.playerId] = { firstSeenAt: now, lastClaimAt: null };
  }

  const claim = {
    id: randomUUID(),
    playerId: payload.playerId,
    wallet: payload.wallet,
    usd: payload.usd,
    sol: payload.sol,
    solPrice: payload.solPrice,
    milestoneIdx: payload.milestoneIdx,
    score: payload.score,
    cps: payload.cps,
    status: payload.reviewRequired ? 'review' : 'queued',
    reviewRequired: Boolean(payload.reviewRequired),
    reviewReason: payload.reviewReason || null,
    createdAt: now,
  };

  data.claims.push(claim);
  data.players[payload.playerId].lastClaimAt = now;
  writeData(data);

  return claim;
}
