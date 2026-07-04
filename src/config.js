const DEFAULT_TOKEN_CA = 'BAlLS7x1pUXs2U8hQW5Yd7S13v1kPnQZ9Mpump';
const SOL_MINT = 'So11111111111111111111111111111111111111112';

function envStr(key, fallback = '') {
  const value = import.meta.env[key];
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

const tokenCa = envStr('VITE_TOKEN_CA', DEFAULT_TOKEN_CA);

export const appConfig = {
  token: {
    contractAddress: tokenCa,
    symbol: envStr('VITE_TOKEN_SYMBOL', '$BALLS'),
    buyUrl: envStr('VITE_BUY_URL', `https://pump.fun/coin/${tokenCa}`),
    dexscreenerUrl: envStr('VITE_DEXSCREENER_URL', `https://dexscreener.com/solana/${tokenCa}`),
  },
  social: {
    twitterUrl: envStr('VITE_TWITTER_URL', 'https://x.com'),
    telegramUrl: envStr('VITE_TELEGRAM_URL', ''),
  },
  jupiter: {
    apiKey: envStr('VITE_JUP_API_KEY', ''),
    solMint: SOL_MINT,
    priceUrl: envStr('VITE_JUP_PRICE_URL', `https://api.jup.ag/price/v3?ids=${SOL_MINT}`),
  },
  solana: {
    rpcUrl: envStr('VITE_SOLANA_RPC', 'https://api.mainnet-beta.solana.com'),
  },
  rewardApi: {
    baseUrl: envStr('VITE_REWARD_API_URL', '/api'),
    demoMode: envStr('VITE_REWARD_DEMO_MODE', 'false') === 'true',
    disabled: envStr('VITE_REWARD_API_URL', '/api') === 'disabled',
  },
};

export function getPublicEnvStatus() {
  return {
    tokenCa: Boolean(appConfig.token.contractAddress),
    jupiterKey: Boolean(appConfig.jupiter.apiKey),
    rewardApi: !appConfig.rewardApi.disabled && !appConfig.rewardApi.demoMode,
    rewardDemo: appConfig.rewardApi.demoMode,
    solanaRpc: Boolean(appConfig.solana.rpcUrl),
  };
}
