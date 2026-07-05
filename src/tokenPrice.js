import { appConfig } from './config';

export function formatTokenUsdPrice(price) {
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null;
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(5);
  if (price >= 0.0001) return price.toFixed(6);
  return price.toFixed(8);
}

export async function fetchTokenUsdPrice() {
  const mint = appConfig.token.contractAddress;
  const url = `https://api.jup.ag/price/v3?ids=${encodeURIComponent(mint)}`;
  const headers = {};
  if (appConfig.jupiter.apiKey) {
    headers['x-api-key'] = appConfig.jupiter.apiKey;
  }

  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error('Token price fetch failed');

  const data = await res.json();
  const price = data?.[mint]?.usdPrice;
  if (typeof price !== 'number' || price <= 0) throw new Error('Invalid token price');
  return price;
}
