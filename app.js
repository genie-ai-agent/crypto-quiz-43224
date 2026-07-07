// state
const ARCH_KEYS = ['diamond','bluechip','degen','yield','witch','muse'];
const DIM_KEYS = ['risk','patience','analytical','social','fomo','ego','loss_av','discipline'];

function blankScores() {
  const s = {}; ARCH_KEYS.forEach(k => s[k] = 0); return s;
}
function blankDims() {
  const s = {}; DIM_KEYS.forEach(k => s[k] = { sum: 0, n: 0 }); return s;
}

const state = {
  step: 'intro',
  qIndex: 0,
  scores: blankScores(),
  dims: blankDims(),
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
      <p class="sub">Twelve questions built to read the money-mind under the vibes. We're profiling risk tolerance, patience, FOMO, ego, discipline, the works. You'll get an archetype, a mirror, and a live coin shortlist that fits how you actually invest.</p>
      <button class="cta" id="start">Start the quiz ✨</button>
      <div class="meta-row">
        <span class="chip">12 questions</span>
        <span class="chip">~3 minutes</span>
        <span class="chip">6 archetypes</span>
        <span class="chip">mind read included</span>
      </div>
    </section>
  `;
  document.getElementById('start').addEventListener('click', () => {
    state.step = 'q';
    state.qIndex = 0;
    state.scores = blankScores();
    state.dims = blankDims();
    state.answers = [];
    render();
  });

  const params = new URLSearchParams(location.search);
  const shared = params.get('r');
  if (shared && ARCHETYPES[shared]) {
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
      ${q.sub ? `<div class="q-sub">${q.sub}</div>` : ''}
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
      const w = chosen.weights || {};
      Object.keys(w).forEach(k => { if (state.scores[k] != null) state.scores[k] += w[k]; });
      const d = chosen.dims || {};
      Object.keys(d).forEach(k => {
        if (state.dims[k]) { state.dims[k].sum += d[k]; state.dims[k].n += 1; }
      });
      state.answers.push({ q: state.qIndex, opt: i });
      state.qIndex += 1;
      if (state.qIndex >= QUESTIONS.length) state.step = 'result';
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function pickWinner() {
  if (state.forced && ARCHETYPES[state.forced]) return ARCHETYPES[state.forced];
  let bestKey = 'diamond', bestVal = -1;
  for (const k of ARCH_KEYS) {
    if (state.scores[k] > bestVal) { bestVal = state.scores[k]; bestKey = k; }
  }
  return ARCHETYPES[bestKey];
}

function secondaryArchetype(winnerKey) {
  let bestKey = null, bestVal = -1;
  for (const k of ARCH_KEYS) {
    if (k === winnerKey) continue;
    if (state.scores[k] > bestVal) { bestVal = state.scores[k]; bestKey = k; }
  }
  const winnerVal = state.scores[winnerKey] || 1;
  const ratio = bestVal / winnerVal;
  if (ratio >= 0.55) return { key: bestKey, ratio };
  return null;
}

function dimensionProfile() {
  const out = {};
  for (const k of DIM_KEYS) {
    const d = state.dims[k];
    if (!d || d.n === 0) { out[k] = 0.5; continue; }
    const avg = d.sum / d.n;
    out[k] = Math.max(0, Math.min(1, (avg + 1) / 2));
  }
  return out;
}

const DIM_LABELS = {
  risk:       { name: 'Risk appetite',    low: 'preservation', high: 'full send' },
  patience:   { name: 'Time horizon',     low: 'right now',    high: 'decades' },
  analytical: { name: 'Head vs gut',      low: 'gut',          high: 'spreadsheet' },
  social:     { name: 'Solo vs pack',     low: 'lone wolf',    high: 'group chat' },
  fomo:       { name: 'FOMO pull',        low: 'immune',       high: 'deeply online' },
  ego:        { name: 'Quiet vs loud',    low: 'quiet flex',   high: 'loud flex' },
  loss_av:    { name: 'Loss sensitivity', low: 'stone cold',   high: 'every red hurts' },
  discipline: { name: 'Impulse control',  low: 'impulsive',    high: 'systems' }
};

function buildMindRead(prof) {
  const notes = [];
  const push = (t) => notes.push(t);

  if (prof.risk >= 0.7 && prof.discipline < 0.4) {
    push("You take real risk and you take it a little impulsively. The upside is real; the downside is that one bad size can eat ten good calls. Position size is your biggest lever, not coin selection.");
  } else if (prof.risk >= 0.7 && prof.discipline >= 0.6) {
    push("High risk, high rules. You go hard, but you go hard on purpose. That combo is rarer than you think, and it's basically the whole game.");
  } else if (prof.risk <= 0.35 && prof.discipline >= 0.6) {
    push("You're cautious and rules-based, which is a genuinely under-priced edge in a market that runs on adrenaline. Just make sure the caution is strategy, not fear in a nice outfit.");
  } else if (prof.risk <= 0.35 && prof.discipline < 0.4) {
    push("You're cautious but a bit reactive. The caution is protecting you, but small emotional moves stack up. A written plan would do more for your P&L than any pick.");
  }

  if (prof.patience >= 0.65 && prof.fomo < 0.4) {
    push("Long horizons, low FOMO. This is the psychological profile that actually captures cycles. You can sit through boring, which is where compounding lives.");
  } else if (prof.patience < 0.4 && prof.fomo >= 0.6) {
    push("Short horizon, high FOMO. Every scroll feels like a call to action. Not fatal, but worth naming, because the market prices your attention whether you like it or not.");
  } else if (prof.fomo >= 0.65) {
    push("FOMO is a real line item in your P&L, not a personality quirk. Anything that lowers your screen time is probably alpha.");
  }

  if (prof.analytical >= 0.7 && prof.social < 0.4) {
    push("Your edge is analytical and solitary. Careful you don't research yourself out of every entry. Being right early and being right on time pay very differently.");
  } else if (prof.social >= 0.7 && prof.analytical < 0.4) {
    push("You get conviction from your people, not from a doc. That's a real edge in culture-driven markets, and a real risk when the group chat is wrong together.");
  } else if (prof.analytical >= 0.6 && prof.social >= 0.6) {
    push("You read the docs and you read the room. That's the whole game most of the time.");
  }

  if (prof.loss_av >= 0.7) {
    push("Losses land in your body, not just your spreadsheet. Smaller position sizes will improve your decisions more than better picks ever will. Sizing is self-care.");
  } else if (prof.loss_av <= 0.3) {
    push("You're unusually cool with red. That's a strength, and also a warning: cool with loss can drift into ignoring loss. Make sure the stop still exists, even if it doesn't hurt.");
  }

  if (prof.ego >= 0.7) {
    push("You want to be right out loud. Fine. Just track whether you're sizing to be right, or sizing to make money. Those are two different games with different scoreboards.");
  }

  if (!notes.length) {
    push("You're a balanced profile. No single dimension is running the show, which is genuinely valuable. The trap is drifting into whatever the market rewarded most recently.");
  }

  return notes.slice(0, 4);
}

function meterRow(key, pct) {
  const label = DIM_LABELS[key];
  const p = Math.round(pct * 100);
  return `
    <div class="meter">
      <div class="meter-head">
        <span class="meter-name">${label.name}</span>
        <span class="meter-val">${p}%</span>
      </div>
      <div class="meter-track"><div class="meter-fill" style="width:${p}%"></div></div>
      <div class="meter-anchors"><span>${label.low}</span><span>${label.high}</span></div>
    </div>
  `;
}

function renderResult() {
  const a = pickWinner();
  const sec = state.forced ? null : secondaryArchetype(a.key);
  progressPill.textContent = `${a.emoji} ${a.name}`;
  const traits = a.traits;
  const prof = state.forced ? null : dimensionProfile();
  const mind = prof ? buildMindRead(prof) : null;
  const meters = prof ? DIM_KEYS.map(k => meterRow(k, prof[k])).join('') : '';

  const secBlock = sec ? `
    <div class="secondary">
      <span class="secondary-eyebrow">with a strong streak of</span>
      <span class="secondary-name">${ARCHETYPES[sec.key].emoji} ${ARCHETYPES[sec.key].name}</span>
    </div>
  ` : '';

  const mindBlock = mind ? `
    <section class="mind-block">
      <div class="mind-eyebrow">🧠 your investor mind, read back to you</div>
      <ul class="mind-list">
        ${mind.map(m => `<li>${m}</li>`).join('')}
      </ul>
    </section>

    <section class="dims-block">
      <div class="dims-eyebrow">✨ your money-mind profile</div>
      <div class="meters">${meters}</div>
    </section>

    <section class="psych-block">
      <div class="psych-col">
        <div class="psych-head">🌸 your strengths</div>
        <ul>${a.psych.strengths.map(x => `<li>${x}</li>`).join('')}</ul>
      </div>
      <div class="psych-col">
        <div class="psych-head">👀 watch-outs</div>
        <ul>${a.psych.blindspots.map(x => `<li>${x}</li>`).join('')}</ul>
      </div>
      <div class="psych-col wide">
        <div class="psych-head">💬 sit with these</div>
        <ul>${a.psych.questions.map(x => `<li>${x}</li>`).join('')}</ul>
      </div>
    </section>
  ` : '';

  app.innerHTML = `
    <section class="card">
      <div class="result-crown">${a.emoji}</div>
      <div class="result-eyebrow">You are the</div>
      <h1 class="result-name">${a.name}</h1>
      <div class="result-tag">${a.tag}</div>
      ${secBlock}
      <p class="result-desc">${a.desc}</p>
      <div class="traits">
        <div class="trait"><div class="trait-label">Style</div><div class="trait-value">${traits.style}</div></div>
        <div class="trait"><div class="trait-label">Risk</div><div class="trait-value">${traits.risk}</div></div>
        <div class="trait"><div class="trait-label">Vibe</div><div class="trait-value">${traits.vibe}</div></div>
        <div class="trait"><div class="trait-label">Spirit</div><div class="trait-value">${traits.spirit}</div></div>
      </div>
      <div class="result-quote">${a.quote}</div>

      ${mindBlock}

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
    state.scores = blankScores();
    state.dims = blankDims();
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
    } catch (e) { /* cancelled */ }
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

(function bootstrap() {
  const params = new URLSearchParams(location.search);
  const shared = params.get('r');
  if (shared && ARCHETYPES[shared]) {
    state.step = 'result';
    state.forced = shared;
  }
  render();
})();
