// 12 questions. Each option assigns weighted points across archetypes
// AND tags psychological dimensions we surface back to the user on the result page.
//
// Dimensions we're actually measuring:
//   risk       : appetite for volatility (0 = capital preservation, 1 = full send)
//   patience   : time horizon (0 = day trader energy, 1 = decade-long HODL)
//   analytical : how much research drives decisions (0 = vibes, 1 = spreadsheets)
//   social     : community/culture pull (0 = solo lone-wolf, 1 = group-chat native)
//   fomo       : susceptibility to hype (0 = immune, 1 = deeply online)
//   ego        : need to be right / bragging drive (0 = quiet, 1 = loud)
//   loss_av    : loss aversion (0 = stone cold, 1 = every red candle hurts)
//   discipline : rules-based vs impulsive (0 = impulsive, 1 = systems-driven)
//
// Scoring: each option has `weights` (archetype -> points) so answers can nudge
// multiple archetypes at once (real people are mixes), and `dims` (dimension -> delta in [-1,1]).

const QUESTIONS = [
  {
    q: "You just got a surprise $2,000. What actually happens?",
    sub: "Be honest with yourself. Nobody's watching.",
    options: [
      {
        emoji: '💎',
        text: "Straight into BTC and ETH. Set a calendar reminder to look at it in a year.",
        weights: { bluechip: 2, diamond: 1 },
        dims: { risk: -0.2, patience: 0.8, discipline: 0.6, fomo: -0.4 }
      },
      {
        emoji: '🔥',
        text: "There's a coin trending on my timeline right now. I'm in. Send it.",
        weights: { degen: 3 },
        dims: { risk: 0.9, patience: -0.7, fomo: 0.8, discipline: -0.6 }
      },
      {
        emoji: '🌸',
        text: "Split it: some staked at a solid APY, some in stables earning yield.",
        weights: { yield: 3 },
        dims: { risk: -0.1, patience: 0.5, discipline: 0.7, analytical: 0.3 }
      },
      {
        emoji: '🔮',
        text: "Nothing until I've read three research reports and checked the on-chain data.",
        weights: { witch: 3 },
        dims: { analytical: 0.9, discipline: 0.7, fomo: -0.6, patience: 0.4 }
      }
    ]
  },
  {
    q: "Your favorite coin just dropped 30% overnight. First 60 seconds:",
    sub: "The gut reaction, not the polished one.",
    options: [
      {
        emoji: '💎',
        text: "Buy more. This is the sale I've been waiting for.",
        weights: { diamond: 3, bluechip: 1 },
        dims: { risk: 0.3, patience: 0.8, loss_av: -0.5, discipline: 0.4 }
      },
      {
        emoji: '👑',
        text: "Check if the thesis still holds. If yes, ignore the price and move on.",
        weights: { bluechip: 2, witch: 1, diamond: 1 },
        dims: { analytical: 0.6, loss_av: -0.3, discipline: 0.7 }
      },
      {
        emoji: '😵',
        text: "Stomach drops. I stare at the chart. I might not sleep tonight.",
        weights: { degen: 1, muse: 1 },
        dims: { loss_av: 0.9, discipline: -0.3, ego: 0.2 }
      },
      {
        emoji: '🔥',
        text: "Cut it and rotate into whatever's pumping. Bye.",
        weights: { degen: 3 },
        dims: { risk: 0.7, patience: -0.8, loss_av: 0.4, discipline: -0.5, fomo: 0.6 }
      }
    ]
  },
  {
    q: "Pick your poison at the crypto brunch:",
    options: [
      {
        emoji: '🌸',
        text: "Talking APYs and which protocols got audited this quarter.",
        weights: { yield: 3 },
        dims: { analytical: 0.7, discipline: 0.6, social: 0.4 }
      },
      {
        emoji: '🎨',
        text: "Showing everyone my new PFP and the artist behind it.",
        weights: { muse: 3 },
        dims: { social: 0.9, ego: 0.5, analytical: -0.2 }
      },
      {
        emoji: '🔮',
        text: "Debating tokenomics with the quiet nerd in the corner.",
        weights: { witch: 3 },
        dims: { analytical: 0.9, social: 0.2, fomo: -0.5 }
      },
      {
        emoji: '🔥',
        text: "Screaming about last night's 10x. Or last night's rug. Both.",
        weights: { degen: 3 },
        dims: { social: 0.8, ego: 0.7, fomo: 0.7, risk: 0.5 }
      }
    ]
  },
  {
    q: "What actually lives in your wallet right now?",
    options: [
      {
        emoji: '👑',
        text: "BTC, ETH, one L1 I believe in, one stablecoin. That's it.",
        weights: { bluechip: 3 },
        dims: { risk: -0.4, discipline: 0.8, analytical: 0.3, patience: 0.5 }
      },
      {
        emoji: '🎨',
        text: "A tasteful NFT collection, some ETH for gas, a few culture tokens.",
        weights: { muse: 3 },
        dims: { social: 0.7, ego: 0.4, analytical: -0.1 }
      },
      {
        emoji: '🌸',
        text: "LP tokens, staked assets, yield receipts. It's a working portfolio.",
        weights: { yield: 3 },
        dims: { discipline: 0.8, analytical: 0.5, patience: 0.4 }
      },
      {
        emoji: '🔥',
        text: "47 memecoins, 3 rug pulls, and vibes. I regret nothing.",
        weights: { degen: 3 },
        dims: { risk: 0.9, discipline: -0.7, fomo: 0.7, ego: 0.3 }
      }
    ]
  },
  {
    q: "How do you find your next investment?",
    options: [
      {
        emoji: '🔮',
        text: "GitHub commits, audit reports, dev calls. Then, maybe.",
        weights: { witch: 3 },
        dims: { analytical: 1.0, discipline: 0.8, fomo: -0.8 }
      },
      {
        emoji: '🎨',
        text: "A Discord I got invited to by a friend with taste.",
        weights: { muse: 3 },
        dims: { social: 0.9, fomo: 0.2, analytical: -0.1 }
      },
      {
        emoji: '🔥',
        text: "Crypto Twitter screaming about it before 6am.",
        weights: { degen: 3 },
        dims: { fomo: 0.9, discipline: -0.6, social: 0.6, patience: -0.5 }
      },
      {
        emoji: '👑',
        text: "If it's not top 20 by market cap, I'm not interested.",
        weights: { bluechip: 3 },
        dims: { risk: -0.5, discipline: 0.7, fomo: -0.4 }
      }
    ]
  },
  {
    q: "Bear market. Everything's down 70%. What's your energy?",
    sub: "The truest reveal in this whole quiz.",
    options: [
      {
        emoji: '💎',
        text: "Accumulating quietly. This is where fortunes are made.",
        weights: { diamond: 3, witch: 1 },
        dims: { patience: 0.9, loss_av: -0.6, discipline: 0.7, ego: 0.2 }
      },
      {
        emoji: '🌸',
        text: "Farming stables. My yield doesn't care about the price.",
        weights: { yield: 3 },
        dims: { discipline: 0.8, risk: -0.4, patience: 0.5 }
      },
      {
        emoji: '🎨',
        text: "Buying floor-priced art from broke degens. It's actually a great time.",
        weights: { muse: 3 },
        dims: { social: 0.5, ego: 0.3, patience: 0.4, risk: 0.3 }
      },
      {
        emoji: '😬',
        text: "Refresh. Wince. Refresh again. Consider becoming a farmer.",
        weights: { degen: 2 },
        dims: { loss_av: 0.9, discipline: -0.3, patience: -0.4 }
      }
    ]
  },
  {
    q: "Someone in your group chat asks for a hot pick. You say:",
    options: [
      {
        emoji: '👑',
        text: "Just DCA into ETH, babe. Stop trying to be clever.",
        weights: { bluechip: 3 },
        dims: { discipline: 0.7, ego: 0.4, risk: -0.3 }
      },
      {
        emoji: '🔥',
        text: "Check this ticker. Don't ask questions. Trust me.",
        weights: { degen: 3 },
        dims: { ego: 0.8, risk: 0.7, social: 0.6, fomo: 0.5 }
      },
      {
        emoji: '🔮',
        text: "I'll send you my notes doc. Read it before you touch anything.",
        weights: { witch: 3 },
        dims: { analytical: 0.9, ego: 0.4, discipline: 0.6, social: 0.3 }
      },
      {
        emoji: '🌸',
        text: "Have you considered just staking? Boring works. Boring compounds.",
        weights: { yield: 3 },
        dims: { discipline: 0.8, patience: 0.6, risk: -0.4 }
      }
    ]
  },
  {
    q: "You're up 5x on a bag. What do you actually do?",
    sub: "The one that separates plans from wishes.",
    options: [
      {
        emoji: '💰',
        text: "Take my initial out, let the rest ride. Rules are rules.",
        weights: { yield: 2, bluechip: 1, witch: 1 },
        dims: { discipline: 0.9, loss_av: 0.2, patience: 0.4 }
      },
      {
        emoji: '💎',
        text: "Hold. If the thesis holds, 5x is just a warm-up.",
        weights: { diamond: 3 },
        dims: { patience: 0.9, risk: 0.4, loss_av: -0.4, discipline: 0.3 }
      },
      {
        emoji: '🔥',
        text: "Roll all of it into the next play. We're not stopping now.",
        weights: { degen: 3 },
        dims: { risk: 1.0, discipline: -0.7, fomo: 0.6, patience: -0.5 }
      },
      {
        emoji: '💅',
        text: "Sell it all and buy something real. This was always the plan.",
        weights: { bluechip: 2 },
        dims: { loss_av: 0.4, discipline: 0.5, risk: -0.5 }
      }
    ]
  },
  {
    q: "Your Saturday, in one sentence:",
    options: [
      {
        emoji: '🔮',
        text: "Whitepaper and a matcha latte. On purpose. It's fun for me.",
        weights: { witch: 3 },
        dims: { analytical: 0.9, patience: 0.5, social: -0.3 }
      },
      {
        emoji: '🌸',
        text: "Rebalancing my yield farms in a silk robe. Compounding is self-care.",
        weights: { yield: 3 },
        dims: { discipline: 0.7, analytical: 0.4 }
      },
      {
        emoji: '🎨',
        text: "NFT gallery opening, afterparty, three group chats going at once.",
        weights: { muse: 3 },
        dims: { social: 1.0, ego: 0.3, fomo: 0.2 }
      },
      {
        emoji: '💎',
        text: "Not checking my portfolio. On purpose. It's the whole point.",
        weights: { diamond: 3 },
        dims: { patience: 1.0, loss_av: -0.5, discipline: 0.6 }
      }
    ]
  },
  {
    q: "What does 'winning' actually feel like to you?",
    sub: "The motivation under the motivation.",
    options: [
      {
        emoji: '🌸',
        text: "Financial freedom on autopilot. My money works while I live.",
        weights: { yield: 3, bluechip: 1 },
        dims: { discipline: 0.6, patience: 0.7, risk: -0.2 }
      },
      {
        emoji: '💎',
        text: "Being right about something everyone else laughed at.",
        weights: { diamond: 2, witch: 2 },
        dims: { ego: 0.7, patience: 0.6, analytical: 0.4 }
      },
      {
        emoji: '🎨',
        text: "Building something with people I actually like being around.",
        weights: { muse: 3 },
        dims: { social: 0.9, ego: 0.2 }
      },
      {
        emoji: '🔥',
        text: "Life-changing money, this cycle. All or nothing energy.",
        weights: { degen: 3 },
        dims: { risk: 0.9, patience: -0.6, fomo: 0.5, ego: 0.5 }
      }
    ]
  },
  {
    q: "How often do you check your portfolio, really?",
    options: [
      {
        emoji: '📱',
        text: "Every 20 minutes. I know. I know.",
        weights: { degen: 3 },
        dims: { loss_av: 0.7, discipline: -0.6, patience: -0.8, fomo: 0.5 }
      },
      {
        emoji: '☕',
        text: "Once a day with my coffee. Just a vibe check.",
        weights: { yield: 2, muse: 1, bluechip: 1 },
        dims: { discipline: 0.5, patience: 0.3 }
      },
      {
        emoji: '📅',
        text: "Weekly, when I rebalance. It's a scheduled thing.",
        weights: { yield: 2, witch: 2, bluechip: 1 },
        dims: { discipline: 0.9, analytical: 0.5, patience: 0.5 }
      },
      {
        emoji: '🌙',
        text: "Barely. I'll look when it matters. Which is not today.",
        weights: { diamond: 3 },
        dims: { patience: 1.0, loss_av: -0.7, discipline: 0.6 }
      }
    ]
  },
  {
    q: "Pick your emotional support beverage:",
    sub: "Yes, this counts as data.",
    options: [
      {
        emoji: '☕',
        text: "An espresso. Focused, sharp, fundamentals only.",
        weights: { witch: 3 },
        dims: { analytical: 0.5, discipline: 0.4 }
      },
      {
        emoji: '🍸',
        text: "A dirty martini. High risk, high reward, and I'll ask for extra olives.",
        weights: { degen: 3 },
        dims: { risk: 0.7, ego: 0.4, fomo: 0.3 }
      },
      {
        emoji: '🍵',
        text: "Matcha. Long-term energy. Everything blooms eventually.",
        weights: { diamond: 2, yield: 1 },
        dims: { patience: 0.7, discipline: 0.3 }
      },
      {
        emoji: '🥂',
        text: "Champagne. We're celebrating quarterly gains, thank you.",
        weights: { bluechip: 3 },
        dims: { discipline: 0.4, ego: 0.5, patience: 0.3 }
      }
    ]
  }
];
