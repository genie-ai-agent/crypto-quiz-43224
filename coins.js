// Live coin fetch + archetype-based filtering.
// CoinGecko /coins/markets is public, no key, CORS-friendly.
// We cache the daily snapshot in localStorage to be polite.

const COINS_CACHE_KEY = 'cryptogal_markets_v1';
const COINS_CACHE_TTL_MIN = 60 * 6; // 6 hours

async function fetchTopMarkets() {
  // try cache
  try {
    const raw = localStorage.getItem(COINS_CACHE_KEY);
    if (raw) {
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts < COINS_CACHE_TTL_MIN * 60 * 1000 && Array.isArray(data) && data.length) {
        return data;
      }
    }
  } catch (e) { /* ignore */ }

  const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h%2C7d%2C30d';
  const res = await fetch(url);
  if (!res.ok) throw new Error('coingecko ' + res.status);
  const data = await res.json();
  try { localStorage.setItem(COINS_CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch (e) {}
  return data;
}

// Category tags we lean on. CoinGecko sometimes attaches a `categories` array;
// markets endpoint doesn't, so we work from id/symbol heuristics + rank + volatility.
const STABLES = new Set(['usdt','usdc','dai','usde','fdusd','tusd','usdd','pyusd','frax','lusd','gusd']);
const WRAPPED = new Set(['wbtc','weth','wsteth','steth','cbbtc','wbeth','reth','sfrxeth','meth','frxeth','tbtc','cbeth']);
const MEMES = new Set(['doge','shib','pepe','wif','bonk','floki','mog','popcat','brett','memex','turbo','ponke','myro','book','fartcoin','pnut','goat','moodeng','neiro','wen','slerf','bome','mew','act','ai16z','griffain','chillguy','pengu','trump','melania']);
const NFT_TOKENS = new Set(['ape','blur','looks','x2y2','sand','mana','axs','ilv','magic','gala','superrare','rare','imx','ronin']);
const DEFI_YIELD = new Set(['aave','crv','mkr','ldo','pendle','ena','sky','fxs','snx','comp','uni','rune','gmx','dydx','jup','jto','ondo','usdd','morpho','eigen','ether-fi','ethfi','rpl','frax','frxeth','sfrxeth','ssv','kmno']);
const L1_L2_BLUECHIP = new Set(['btc','eth','sol','bnb','xrp','ada','avax','dot','trx','ton','near','arb','op','matic','pol','sui','apt','sei','inj','tia','icp','fil','atom','hbar','kas','ltc','bch']);
const CULTURE_AI = new Set(['fet','render','rndr','tao','agix','ocean','worldcoin','wld','ai16z','virtual','virtuals','arkm']);

function classify(c) {
  const s = (c.symbol || '').toLowerCase();
  const id = (c.id || '').toLowerCase();
  if (STABLES.has(s) || STABLES.has(id)) return 'stable';
  if (WRAPPED.has(s) || WRAPPED.has(id)) return 'wrapped';
  if (MEMES.has(s) || MEMES.has(id)) return 'meme';
  if (NFT_TOKENS.has(s) || NFT_TOKENS.has(id) || CULTURE_AI.has(s) || CULTURE_AI.has(id)) return 'culture';
  if (DEFI_YIELD.has(s) || DEFI_YIELD.has(id)) return 'defi';
  if (L1_L2_BLUECHIP.has(s) || L1_L2_BLUECHIP.has(id)) return 'bluechip';
  return 'alt';
}

// Score volatility as abs(24h) + abs(7d)/2. Higher = spicier.
function spice(c) {
  const a = Math.abs(c.price_change_percentage_24h_in_currency || c.price_change_percentage_24h || 0);
  const b = Math.abs(c.price_change_percentage_7d_in_currency || 0);
  return a + b / 2;
}

// Rules per archetype. Returns filtered + sorted array (max ~6).
function pickCoinsFor(archetypeKey, all) {
  const tagged = all.map(c => ({ ...c, _cat: classify(c) }));
  const noStable = tagged.filter(c => c._cat !== 'stable' && c._cat !== 'wrapped');

  let picks = [];
  switch (archetypeKey) {
    case 'bluechip': {
      // Top-ranked L1/L2 blue chips, ordered by market cap.
      picks = noStable
        .filter(c => c._cat === 'bluechip' && c.market_cap_rank && c.market_cap_rank <= 25)
        .sort((a, b) => a.market_cap_rank - b.market_cap_rank)
        .slice(0, 6);
      break;
    }
    case 'diamond': {
      // Long-term believers: top 15 by mcap, ex-stables, ex-memes. BTC/ETH lead.
      picks = noStable
        .filter(c => c._cat !== 'meme' && c.market_cap_rank && c.market_cap_rank <= 15)
        .sort((a, b) => a.market_cap_rank - b.market_cap_rank)
        .slice(0, 6);
      break;
    }
    case 'degen': {
      // Memes + spiciest non-stables.
      const memes = noStable.filter(c => c._cat === 'meme').sort((a, b) => spice(b) - spice(a));
      const spicy = noStable.filter(c => c._cat !== 'meme').sort((a, b) => spice(b) - spice(a));
      picks = [...memes.slice(0, 4), ...spicy.slice(0, 2)].slice(0, 6);
      break;
    }
    case 'yield': {
      // DeFi / staking / restaking tokens. Fall back to top DeFi by mcap.
      picks = noStable
        .filter(c => c._cat === 'defi')
        .sort((a, b) => (a.market_cap_rank || 999) - (b.market_cap_rank || 999))
        .slice(0, 6);
      break;
    }
    case 'witch': {
      // Fundamentals nerds: infra + credible mid-caps outside top 10, rank 10-60, ex-meme.
      picks = noStable
        .filter(c => c._cat !== 'meme' && c.market_cap_rank && c.market_cap_rank >= 8 && c.market_cap_rank <= 60)
        .sort((a, b) => (a.market_cap_rank || 999) - (b.market_cap_rank || 999))
        .slice(0, 6);
      break;
    }
    case 'muse': {
      // Culture / NFT / AI-agent / gaming tokens.
      picks = noStable
        .filter(c => c._cat === 'culture')
        .sort((a, b) => (a.market_cap_rank || 999) - (b.market_cap_rank || 999))
        .slice(0, 6);
      break;
    }
    default:
      picks = noStable.slice(0, 6);
  }

  // Safety net: if a bucket came up short, backfill from top mcap ex-stable.
  if (picks.length < 4) {
    const have = new Set(picks.map(p => p.id));
    for (const c of noStable) {
      if (picks.length >= 6) break;
      if (!have.has(c.id)) { picks.push(c); have.add(c.id); }
    }
  }
  return picks;
}

// Copy blurb per archetype describing the shortlist.
const COIN_BLURB = {
  diamond: "Highest-conviction, top-ranked coins to buy and forget. Time in the market is the whole game.",
  bluechip: "The grown-up shortlist. Top-tier L1s and L2s with real liquidity and real users.",
  degen: "Spicy. Volatile. Very much not financial advice. Memes and the wildest movers.",
  yield: "Tokens tied to staking, restaking, and DeFi protocols where your bag can actually earn.",
  witch: "Mid-cap infra and credible builds worth a real research afternoon before you touch.",
  muse: "Culture, gaming, AI-agent, and metaverse plays. Where crypto meets creative."
};
