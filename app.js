// state
const state = {
  step: 'intro', // intro | q | result
  qIndex: 0,
  scores: { diamond: 0, bluechip: 0, degen: 0, yield: 0, witch: 0, muse: 0 },
  answers: []
};

const app = document.getElementById('app');
const progressPill = document.getElementById('progress-pill');

// sparkles
(function makeSparkles() {
  const wrap = document.getElementById('sparkles');
  const n = 18;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
    s.style.animationDuration = (2 + Math.random() * 3).toFixed(2) + 's';
    s.style.width = s.style.height = (4 + Math.random() * 8).toFixed(1) + 'px';
    wrap.appendChild(s);
  }
})();

function render() {
  if (state.step === 'intro') return renderIntro();
  if (state.step === 'q') return renderQuestion();
  if (state.step === 'result') return renderResult();
}

function renderIntro() {
  progressPill.textContent = '✨ ready when you are';
  app.innerHTML = `
    <section class="card">
      <span class="eyebrow">Cryptogal Quiz</span>
      <h1 class="title">what kind of<br><span class="grad">crypto girl</span><br>are you, really?</h1>
      <p class="sub">Ten questions. Six archetypes. One shockingly accurate read on how you actually invest (or want to). Diamond hands? Degen queen? Yield goddess? Let's find out.</p>
      <button class="cta" id="start">Start the quiz ✨</button>
      <div class="meta-row">
        <span class="chip">10 questions</span>
        <span class="chip">~2 minutes</span>
        <span class="chip">6 archetypes</span>
        <span class="chip">shareable result</span>
      </div>
    </section>
  `;
  document.getElementById('start').addEventListener('click', () => {
    state.step = 'q';
    state.qIndex = 0;
    state.scores = { diamond: 0, bluechip: 0, degen: 0, yield: 0, witch: 0, muse: 0 };
    state.answers = [];
    render();
  });

  // if URL has a result share, offer to view it
  const params = new URLSearchParams(location.search);
  const shared = params.get('r');
  if (shared && ARCHETYPES[shared]) {
    const sub = document.querySelector('.sub');
    const btn = document.createElement('button');
    btn.className = 'cta secondary';
    btn.style.marginLeft = '10px';
    btn.textContent = `See the ${ARCHETYPES[shared].name} result →`;
    btn.addEventListener('click', () => {
      state.step = 'result';
      state.forced = shared;
      render();
    });
    document.getElementById('start').insertAdjacentElement('afterend', btn);
  }
}

function renderQuestion() {
  const q = QUESTIONS[state.qIndex];
  const total = QUESTIONS.length;
  const pct = ((state.qIndex) / total) * 100;
  progressPill.textContent = `💗 ${state.qIndex + 1} of ${total}`;
  app.innerHTML = `
    <section class="card">
      <div class="progress-track"><div class="progress-fill" style="width: ${pct}%"></div></div>
      <div class="q-num">Question ${state.qIndex + 1} / ${total}</div>
      <h2 class="q-text">${q.q}</h2>
      <div class="options">
        ${q.options.map((o, i) => `
          <button class="option" data-i="${i}">
            <span class="emoji">${o.emoji}</span>${o.text}
          </button>
        `).join('')}
      </div>
    </section>
  `;
  app.querySelectorAll('.option').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.i, 10);
      const chosen = q.options[i];
      state.scores[chosen.type] += 1;
      state.answers.push(chosen.type);
      state.qIndex += 1;
      if (state.qIndex >= QUESTIONS.length) {
        state.step = 'result';
      }
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function pickWinner() {
  if (state.forced && ARCHETYPES[state.forced]) return ARCHETYPES[state.forced];
  let bestKey = 'diamond', bestVal = -1;
  const order = ['diamond','bluechip','degen','yield','witch','muse'];
  for (const k of order) {
    if (state.scores[k] > bestVal) { bestVal = state.scores[k]; bestKey = k; }
  }
  return ARCHETYPES[bestKey];
}

function renderResult() {
  const a = pickWinner();
  progressPill.textContent = `${a.emoji} ${a.name}`;
  const traits = a.traits;
  app.innerHTML = `
    <section class="card">
      <div class="result-crown">${a.emoji}</div>
      <div class="result-eyebrow">You are the</div>
      <h1 class="result-name">${a.name}</h1>
      <div class="result-tag">${a.tag}</div>
      <p class="result-desc">${a.desc}</p>
      <div class="traits">
        <div class="trait"><div class="trait-label">Style</div><div class="trait-value">${traits.style}</div></div>
        <div class="trait"><div class="trait-label">Risk</div><div class="trait-value">${traits.risk}</div></div>
        <div class="trait"><div class="trait-label">Vibe</div><div class="trait-value">${traits.vibe}</div></div>
        <div class="trait"><div class="trait-label">Spirit</div><div class="trait-value">${traits.spirit}</div></div>
      </div>
      <div class="result-quote">${a.quote}</div>

      <section class="coins-block">
        <div class="coins-eyebrow">✨ Coins for your vibe</div>
        <h3 class="coins-title">Your ${a.name} shortlist</h3>
        <p class="coins-blurb">${COIN_BLURB[a.key] || ''}</p>
        <div class="coins-grid" id="coins-grid">
          <div class="coins-loading">pulling live prices from CoinGecko… 💗</div>
        </div>
        <div class="coins-foot">live data · CoinGecko · not financial advice, obvi</div>
      </section>

      <div class="result-actions">
        <button class="cta" id="share">Share my result 💌</button>
        <button class="cta secondary" id="retake">Retake quiz</button>
      </div>
    </section>
    <div class="toast" id="toast">Link copied ✨</div>
  `;
  loadCoinsFor(a);
  document.getElementById('retake').addEventListener('click', () => {
    state.step = 'intro';
    state.forced = null;
    history.replaceState(null, '', location.pathname);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.getElementById('share').addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?r=${a.key}`;
    const shareText = `I'm a ${a.name} ${a.emoji} on the Cryptogal Quiz. What are you?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Cryptogal Quiz', text: shareText, url });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${url}`);
        showToast('Link copied ✨');
      }
    } catch (e) { /* user cancelled */ }
  });
}

async function loadCoinsFor(a) {
  const grid = document.getElementById('coins-grid');
  if (!grid) return;
  try {
    const all = await fetchTopMarkets();
    const picks = pickCoinsFor(a.key, all);
    if (!picks.length) {
      grid.innerHTML = `<div class="coins-loading">couldn't load coins right now, try again in a bit 🌸</div>`;
      return;
    }
    grid.innerHTML = picks.map(c => coinCard(c)).join('');
  } catch (e) {
    grid.innerHTML = `<div class="coins-loading">couldn't reach CoinGecko right now 💫 try again in a minute</div>`;
  }
}

function fmtPrice(n) {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (n >= 1) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (n >= 0.01) return '$' + n.toFixed(3);
  if (n >= 0.0001) return '$' + n.toFixed(5);
  return '$' + n.toExponential(2);
}
function fmtPct(n) {
  if (n == null || isNaN(n)) return '—';
  const s = n >= 0 ? '+' : '';
  return `${s}${n.toFixed(2)}%`;
}

function coinCard(c) {
  const chg = c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h ?? 0;
  const up = chg >= 0;
  return `
    <a class="coin-card ${up ? 'up' : 'down'}" href="https://www.coingecko.com/en/coins/${c.id}" target="_blank" rel="noopener">
      <div class="coin-head">
        <img class="coin-logo" src="${c.image}" alt="" loading="lazy" />
        <div class="coin-id">
          <div class="coin-name">${c.name}</div>
          <div class="coin-sym">${(c.symbol || '').toUpperCase()} · #${c.market_cap_rank ?? '—'}</div>
        </div>
      </div>
      <div class="coin-nums">
        <div class="coin-price">${fmtPrice(c.current_price)}</div>
        <div class="coin-chg ${up ? 'up' : 'down'}">${fmtPct(chg)}</div>
      </div>
    </a>
  `;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

// handle direct-share landing: if ?r=key, jump straight to that result
(function bootstrap() {
  const params = new URLSearchParams(location.search);
  const shared = params.get('r');
  if (shared && ARCHETYPES[shared]) {
    state.step = 'result';
    state.forced = shared;
  }
  render();
})();
