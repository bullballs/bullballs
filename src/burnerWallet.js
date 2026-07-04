import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const BURNER_WALLET_KEY = 'balls_burner_wallet';
const LEGACY_WALLET_KEY = 'balls_withdraw_wallet';

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function createBurnerRecord() {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKeyBase58: bs58.encode(keypair.secretKey),
    createdAt: Date.now(),
  };
}

function parseBurnerRecord(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.publicKey === 'string' &&
      typeof parsed.secretKeyBase58 === 'string' &&
      parsed.publicKey.length >= 32
    ) {
      return parsed;
    }
  } catch {
    // ignore invalid storage
  }
  return null;
}

export function getBurnerWallet() {
  const stored = parseBurnerRecord(readStorage(BURNER_WALLET_KEY));
  if (stored) return stored;

  const legacyAddress = readStorage(LEGACY_WALLET_KEY)?.trim();
  if (legacyAddress) {
    const migrated = {
      publicKey: legacyAddress,
      secretKeyBase58: null,
      createdAt: Date.now(),
      migratedLegacy: true,
    };
    saveBurnerWallet(migrated);
    return migrated;
  }

  return null;
}

export function getOrCreateBurnerWallet() {
  const existing = getBurnerWallet();
  if (existing) return existing;

  const wallet = createBurnerRecord();
  saveBurnerWallet(wallet);
  return wallet;
}

export function saveBurnerWallet(wallet) {
  writeStorage(BURNER_WALLET_KEY, JSON.stringify(wallet));
}

export function generateNewBurnerWallet() {
  const wallet = createBurnerRecord();
  saveBurnerWallet(wallet);
  try {
    localStorage.removeItem(LEGACY_WALLET_KEY);
  } catch {
    // ignore
  }
  return wallet;
}

export function getBurnerPublicKey() {
  return getBurnerWallet()?.publicKey || '';
}

export function exportBurnerPrivateKey(wallet) {
  if (!wallet?.secretKeyBase58) return null;
  return wallet.secretKeyBase58;
}

export function formatWalletAddress(address) {
  if (!address || address.length < 8) return address || '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
