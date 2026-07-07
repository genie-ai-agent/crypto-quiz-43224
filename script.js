// TOP50.QUIZ — live crypto quiz over CoinGecko trending + top-mcap padding

const TRENDING_API = 'https://api.coingecko.com/api/v3/search/trending';
const MARKETS_API = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h';
const CACHE_KEY_PREFIX = 'top50quiz::v2::';
const QUIZ_LEN = 10;
const TARGET_COUNT = 50;

const $ = (id) => document.getElementById(id);

const state = {
  coins: [],
  questions: [],
  cursor: 0,
  score: 0,
  answers: [],
};

// ---------- formatting ----------
const fmtUSD = (n) => {
  if (n == null || isNaN(n)) return '--';
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1) return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return '$' + n.toPrecision(3);
};
const fmtPct = (n) => {
  if (n == null || isNaN(n)) return '--';
  const s = n >= 0 ? '+' : '';
  return s + n.toFixed(2) + '%';
};
const pctClass = (n) => (n >= 0 ? 'delta-up' : 'delta-down');

// ---------- data ----------
function cacheKey() {
  const d = new Date();
  const day = d.toISOString().slice(0, 10);
  return CACHE_KEY_PREFIX + day;
}

// CoinGecko trending returns market_cap/price as USD-formatted strings like "$1,234,567"
function parseUSDString(s) {
  if (typeof s === 'number') return s;
  if (!s || typeof s !== 'string') return null;
  const cleaned = s.replace(/[$,\s]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

async function loadCoins() {
  const key = cacheKey();
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached && Array.isArray(cached.coins) && cached.coins.length >= 40) return cached;
    }
  } catch (_) {}

  // 1) trending (15 coins, search-volume based)
  const trendRes = await fetch(TRENDING_API, { headers: { 'accept': 'application/json' } });
  if (!trendRes.ok) throw new Error('trending ' + trendRes.status);
  const trendJson = await trendRes.json();
  const trending = (trendJson.coins || []).map((entry) => {
    const c = entry.item || {};
    const d = c.data || {};
    return {
      id: c.id,
      symbol: (c.symbol || '').toUpperCase(),
      name: c.name,
      image: c.large || c.small || c.thumb,
      price: parseUSDString(d.price),
      mcap: parseUSDString(d.market_cap),
      rank: c.market_cap_rank,
      vol: parseUSDString(d.total_volume),
      change24h: d.price_change_percentage_24h && typeof d.price_change_percentage_24h.usd === 'number'
        ? d.price_change_percentage_24h.usd
        : null,
      trending: true,
    };
  }).filter((c) => c.id && c.name && c.symbol);

  // 2) pad with top-mcap coins to reach 50
  const marketsRes = await fetch(MARKETS_API, { headers: { 'accept': 'application/json' } });
  if (!marketsRes.ok) throw new Error('markets ' + marketsRes.status);
  const marketsJson = await marketsRes.json();
  const trendingIds = new Set(trending.map((c) => c.id));
  const padding = marketsJson
    .filter((c) => !trendingIds.has(c.id))
    .map((c) => ({
      id: c.id,
      symbol: (c.symbol || '').toUpperCase(),
      name: c.name,
      image: c.image,
      price: c.current_price,
      mcap: c.market_cap,
      rank: c.market_cap_rank,
      vol: c.total_volume,
      change24h: c.price_change_percentage_24h,
      trending: false,
    }));

  // patch trending entries missing price/mcap/rank/change with markets data if present
  const marketsById = new Map(marketsJson.map((c) => [c.id, c]));
  for (const t of trending) {
    const m = marketsById.get(t.id);
    if (m) {
      if (t.price == null) t.price = m.current_price;
      if (t.mcap == null) t.mcap = m.market_cap;
      if (t.rank == null) t.rank = m.market_cap_rank;
      if (t.vol == null) t.vol = m.total_volume;
      if (t.change24h == null) t.change24h = m.price_change_percentage_24h;
    }
  }

  const combined = [...trending, ...padding].slice(0, TARGET_COUNT);
  // require enough usable fields for question generation
  const usable = combined.filter((c) => c.price != null && c.mcap != null);
  const finalList = usable.length >= 40 ? usable : combined;

  const payload = {
    coins: finalList,
    trendingCount: trending.length,
    fetchedAt: new Date().toISOString(),
  };
  try { localStorage.setItem(key, JSON.stringify(payload)); } catch (_) {}
  return payload;
}

// ---------- utils ----------
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sampleN = (arr, n) => shuffle(arr).slice(0, n);

// ---------- question builders ----------
// Each builder returns { question (html), options: [{label, correct, meta?}], explain }

function qHigherMcap(coins) {
  const [a, b] = sampleN(coins, 2);
  const winner = a.mcap > b.mcap ? a : b;
  const opts = shuffle([a, b]).map((c) => ({
    label: `<img class="logo" src="${c.image}" alt="" onerror="this.style.display='none'"/><span class="body">${c.name} <span style="color:var(--text-faint)">(${c.symbol})</span></span>`,
    correct: c.id === winner.id,
    text: c.name,
  }));
  return {
    question: `Which coin has the <span class="highlight">higher market cap</span>?`,
    options: opts,
    explain: `${winner.name} · ${fmtUSD(winner.mcap)} > ${(a.id === winner.id ? b : a).name} · ${fmtUSD((a.id === winner.id ? b : a).mcap)}`,
  };
}

function qSymbol(coins) {
  const target = pick(coins);
  const distract = sampleN(coins.filter((c) => c.id !== target.id), 3);
  const opts = shuffle([target, ...distract]).map((c) => ({
    label: `<span class="body" style="color:var(--yellow);font-weight:700">${c.symbol}</span>`,
    correct: c.id === target.id,
    text: c.symbol,
  }));
  return {
    question: `What's the ticker symbol for <span class="highlight">${target.name}</span>?`,
    options: opts,
    explain: `${target.name} trades as ${target.symbol} · rank #${target.rank}`,
  };
}

function qNameFromSymbol(coins) {
  const target = pick(coins);
  const distract = sampleN(coins.filter((c) => c.id !== target.id), 3);
  const opts = shuffle([target, ...distract]).map((c) => ({
    label: `<img class="logo" src="${c.image}" alt="" onerror="this.style.display='none'"/><span class="body">${c.name}</span>`,
    correct: c.id === target.id,
    text: c.name,
  }));
  return {
    question: `Which coin trades under the symbol <span class="sym">${target.symbol}</span>?`,
    options: opts,
    explain: `${target.symbol} = ${target.name} · rank #${target.rank}`,
  };
}

function qHigherPrice(coins) {
  // pick two with meaningfully different prices
  let a, b, tries = 0;
  do {
    [a, b] = sampleN(coins, 2);
    tries++;
  } while (tries < 8 && Math.abs(Math.log10((a.price || 0.0001) / (b.price || 0.0001))) < 0.3);
  const winner = a.price > b.price ? a : b;
  const opts = shuffle([a, b]).map((c) => ({
    label: `<img class="logo" src="${c.image}" alt="" onerror="this.style.display='none'"/><span class="body">${c.name} <span style="color:var(--text-faint)">(${c.symbol})</span></span>`,
    correct: c.id === winner.id,
    text: c.name,
  }));
  return {
    question: `Which coin has the <span class="highlight">higher unit price</span> right now?`,
    options: opts,
    explain: `${winner.name} · ${fmtUSD(winner.price)} vs ${(a.id === winner.id ? b : a).name} · ${fmtUSD((a.id === winner.id ? b : a).price)}`,
  };
}

function q24hMove(coins) {
  const pool = coins.filter((c) => typeof c.change24h === 'number');
  if (pool.length < 4) return qSymbol(coins);
  const [a, b] = sampleN(pool, 2);
  const winner = a.change24h > b.change24h ? a : b;
  const loser = a.id === winner.id ? b : a;
  const opts = shuffle([a, b]).map((c) => ({
    label: `<img class="logo" src="${c.image}" alt="" onerror="this.style.display='none'"/><span class="body">${c.name} <span style="color:var(--text-faint)">(${c.symbol})</span></span>`,
    correct: c.id === winner.id,
    text: c.name,
  }));
  return {
    question: `Which coin performed <span class="highlight">better in the last 24h</span>?`,
    options: opts,
    explain: `${winner.name} <span class="${pctClass(winner.change24h)}">${fmtPct(winner.change24h)}</span> vs ${loser.name} <span class="${pctClass(loser.change24h)}">${fmtPct(loser.change24h)}</span>`,
  };
}

function qRank(coins) {
  // pick from top 20 for tighter distractors
  const pool = coins.slice(0, 25);
  const target = pick(pool);
  // 4 distinct ranks near target
  const ranks = new Set([target.rank]);
  while (ranks.size < 4) {
    const delta = (Math.floor(Math.random() * 8) + 1) * (Math.random() < 0.5 ? -1 : 1);
    const r = target.rank + delta;
    if (r >= 1 && r <= 50) ranks.add(r);
  }
  const opts = shuffle([...ranks]).map((r) => ({
    label: `<span class="body" style="font-weight:700">#${r}</span>`,
    correct: r === target.rank,
    text: '#' + r,
  }));
  return {
    question: `What is <span class="highlight">${target.name}</span>'s current market-cap rank?`,
    options: opts,
    explain: `${target.name} sits at rank #${target.rank} · ${fmtUSD(target.mcap)} mcap`,
  };
}

function qLogo(coins) {
  const target = pick(coins);
  const distract = sampleN(coins.filter((c) => c.id !== target.id), 3);
  const opts = shuffle([target, ...distract]).map((c) => ({
    label: `<span class="body">${c.name}</span>`,
    correct: c.id === target.id,
    text: c.name,
  }));
  return {
    question: `Identify this coin:<br><img src="${target.image}" alt="logo" style="width:64px;height:64px;margin-top:12px;object-fit:contain;" onerror="this.style.display='none'"/>`,
    options: opts,
    explain: `That's ${target.name} (${target.symbol}) · rank #${target.rank}`,
  };
}

const BUILDERS = [
  qHigherMcap,
  qSymbol,
  qNameFromSymbol,
  qHigherPrice,
  q24hMove,
  qRank,
  qLogo,
];

function generateQuiz(coins) {
  // ensure variety: shuffle builders and cycle through, so all types appear when possible
  const pool = shuffle(BUILDERS);
  const qs = [];
  for (let i = 0; i < QUIZ_LEN; i++) {
    const builder = pool[i % pool.length];
    qs.push(builder(coins));
  }
  return qs;
}

// ---------- rendering ----------
function setStatus(kind, text) {
  const el = $('status');
  el.classList.remove('live', 'error');
  if (kind) el.classList.add(kind);
  $('status-text').textContent = text;
}

function renderIntroMeta(payload) {
  const coins = payload.coins;
  $('m-count').textContent = String(coins.length);
  const total = coins.reduce((s, c) => s + (c.mcap || 0), 0);
  $('m-mcap').textContent = fmtUSD(total);
  const withPct = coins.filter((c) => typeof c.change24h === 'number');
  const avg = withPct.reduce((s, c) => s + c.change24h, 0) / (withPct.length || 1);
  const avgEl = $('m-avg');
  avgEl.innerHTML = `<span class="${pctClass(avg)}">${fmtPct(avg)}</span>`;
  const now = new Date();
  $('m-sync').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  // trending badge list
  const tl = $('trending-list');
  if (tl) {
    const trending = coins.filter((c) => c.trending);
    tl.innerHTML = trending.map((c) => `<span class="trend-pill">🔥 ${c.symbol}</span>`).join('');
  }
}

function renderQuestion() {
  const q = state.questions[state.cursor];
  $('q-num').textContent = String(state.cursor + 1);
  $('q-score').textContent = String(state.score);
  $('progress-fill').style.width = `${((state.cursor) / QUIZ_LEN) * 100 + 10}%`;
  $('question').innerHTML = q.question;
  const opts = $('options');
  opts.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.innerHTML = `<span class="prefix">[${String.fromCharCode(65 + i)}]</span>${opt.label}`;
    btn.addEventListener('click', () => handleAnswer(i));
    opts.appendChild(btn);
  });
  $('feedback').textContent = '';
  $('feedback').className = 'feedback';
  $('next-btn').hidden = true;
}

function handleAnswer(idx) {
  const q = state.questions[state.cursor];
  const buttons = [...document.querySelectorAll('.option')];
  const chosen = q.options[idx];
  const correctIdx = q.options.findIndex((o) => o.correct);
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === correctIdx) b.classList.add('correct');
    else if (i === idx) b.classList.add('wrong');
    else b.classList.add('faded');
  });

  const fb = $('feedback');
  if (chosen.correct) {
    state.score++;
    fb.className = 'feedback ok';
    fb.innerHTML = `&gt; correct <span class="arrow">::</span> ${q.explain}`;
  } else {
    fb.className = 'feedback bad';
    fb.innerHTML = `&gt; incorrect <span class="arrow">::</span> ${q.explain}`;
  }
  state.answers.push({ q: q.question.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), ok: chosen.correct });
  $('q-score').textContent = String(state.score);
  $('progress-fill').style.width = `${((state.cursor + 1) / QUIZ_LEN) * 100}%`;
  $('next-btn').hidden = false;
}

function nextOrFinish() {
  state.cursor++;
  if (state.cursor >= QUIZ_LEN) {
    showResult();
  } else {
    renderQuestion();
  }
}

function showResult() {
  $('quiz-screen').classList.add('hidden');
  $('result-screen').classList.remove('hidden');
  $('final-score').textContent = String(state.score);
  const s = state.score;
  let verdict;
  if (s === 10) verdict = 'flawless run. you either work in this space or you should.';
  else if (s >= 8) verdict = 'sharp. you follow the market close.';
  else if (s >= 6) verdict = 'solid. some gaps in the mid-caps.';
  else if (s >= 4) verdict = 'the top 10 you know. everything below gets fuzzy.';
  else verdict = 'the charts have not been kind. or you have not been looking.';
  $('verdict').textContent = verdict;

  const sum = $('summary');
  sum.innerHTML = '';
  state.answers.forEach((a, i) => {
    const row = document.createElement('div');
    row.className = 'summary-row ' + (a.ok ? 'ok' : 'bad');
    row.innerHTML = `<span class="qi">${String(i + 1).padStart(2, '0')}</span><span class="qt">${a.q}</span><span class="mark">${a.ok ? 'OK' : 'X'}</span>`;
    sum.appendChild(row);
  });
}

function startQuiz() {
  state.questions = generateQuiz(state.coins);
  state.cursor = 0;
  state.score = 0;
  state.answers = [];
  $('intro-screen').classList.add('hidden');
  $('result-screen').classList.add('hidden');
  $('quiz-screen').classList.remove('hidden');
  renderQuestion();
}

// ---------- boot ----------
async function boot() {
  setStatus(null, 'syncing_coingecko...');
  try {
    const payload = await loadCoins();
    state.coins = payload.coins;
    state.trendingCount = payload.trendingCount || 0;
    renderIntroMeta(payload);
    setStatus('live', 'live · ' + payload.coins.length + ' coins · ' + state.trendingCount + ' trending');
    const btn = $('start-btn');
    btn.disabled = false;
  } catch (err) {
    console.error(err);
    setStatus('error', 'sync failed');
    $('m-count').textContent = 'err';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  $('start-btn').addEventListener('click', startQuiz);
  $('next-btn').addEventListener('click', nextOrFinish);
  $('retry-btn').addEventListener('click', startQuiz);

  const foot = $('foot-time');
  const tick = () => {
    const d = new Date();
    foot.textContent = d.toISOString().replace('T', ' ').slice(0, 19) + ' utc';
  };
  tick();
  setInterval(tick, 1000);

  boot();
});
