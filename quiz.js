// 10 questions. Each option maps to one archetype key.
const QUESTIONS = [
  {
    q: "You just got a surprise $2,000. What happens next?",
    options: [
      { emoji: '💎', text: "Straight into BTC and ETH. Don't check it for a year.", type: 'bluechip' },
      { emoji: '🔥', text: "There's a new coin trending. I'm in. Send it.", type: 'degen' },
      { emoji: '🌸', text: "Stake it somewhere earning 8%+ and let it work.", type: 'yield' },
      { emoji: '🔮', text: "Nothing until I've read three research reports.", type: 'witch' }
    ]
  },
  {
    q: "Your favorite coin just dropped 30% overnight. You...",
    options: [
      { emoji: '💎', text: "Buy more. Sale, baby.", type: 'diamond' },
      { emoji: '👑', text: "Check if the thesis still holds. Probably nothing.", type: 'bluechip' },
      { emoji: '🔮', text: "Read the on-chain data and news before touching anything.", type: 'witch' },
      { emoji: '🔥', text: "Rotate into whatever's pumping instead. Bye.", type: 'degen' }
    ]
  },
  {
    q: "Pick your poison at the crypto brunch:",
    options: [
      { emoji: '🌸', text: "Talking APYs and liquidity pools.", type: 'yield' },
      { emoji: '🎨', text: "Showing everyone my new PFP.", type: 'muse' },
      { emoji: '🔮', text: "Debating tokenomics with the quiet nerd.", type: 'witch' },
      { emoji: '🔥', text: "Screaming about last night's 10x.", type: 'degen' }
    ]
  },
  {
    q: "What lives in your wallet, honestly?",
    options: [
      { emoji: '👑', text: "BTC, ETH, one L1, one stablecoin. Done.", type: 'bluechip' },
      { emoji: '🎨', text: "A tasteful NFT collection and some ETH for gas.", type: 'muse' },
      { emoji: '🌸', text: "LP tokens, staked assets, and yield receipts.", type: 'yield' },
      { emoji: '🔥', text: "47 memecoins, 3 rug pulls, and vibes.", type: 'degen' }
    ]
  },
  {
    q: "How do you find your next investment?",
    options: [
      { emoji: '🔮', text: "GitHub commits, audit reports, and dev calls.", type: 'witch' },
      { emoji: '🎨', text: "A Discord I got invited to by a friend with taste.", type: 'muse' },
      { emoji: '🔥', text: "CT screaming about it before 6am.", type: 'degen' },
      { emoji: '👑', text: "If it's not top 20 by market cap, I'm not interested.", type: 'bluechip' }
    ]
  },
  {
    q: "Your ideal Saturday:",
    options: [
      { emoji: '🔮', text: "Reading a whitepaper with a matcha latte.", type: 'witch' },
      { emoji: '🌸', text: "Rebalancing my yield farms in a silk robe.", type: 'yield' },
      { emoji: '🎨', text: "An NFT gallery opening and afterparty.", type: 'muse' },
      { emoji: '💎', text: "Not checking my portfolio. On purpose.", type: 'diamond' }
    ]
  },
  {
    q: "Someone in your group chat asks for a hot pick. You say:",
    options: [
      { emoji: '👑', text: "Just DCA into ETH, babe. Stop trying to be clever.", type: 'bluechip' },
      { emoji: '🔥', text: "Check this ticker. Don't ask questions. Trust me.", type: 'degen' },
      { emoji: '🔮', text: "I'll send you my notes doc. Read it first.", type: 'witch' },
      { emoji: '🌸', text: "Have you considered just staking? Passive is powerful.", type: 'yield' }
    ]
  },
  {
    q: "Bear market. What's your energy?",
    options: [
      { emoji: '💎', text: "Accumulating quietly. This is where fortunes are made.", type: 'diamond' },
      { emoji: '🌸', text: "Farming stables. My yield doesn't care about the price.", type: 'yield' },
      { emoji: '🎨', text: "Buying floor-priced art from broke degens.", type: 'muse' },
      { emoji: '🔮', text: "Deep research season. Best builders ship in bears.", type: 'witch' }
    ]
  },
  {
    q: "What does 'winning' look like to you?",
    options: [
      { emoji: '🌸', text: "Financial freedom on autopilot.", type: 'yield' },
      { emoji: '💎', text: "Being right about something everyone else laughed at.", type: 'diamond' },
      { emoji: '🎨', text: "Building something with people I actually like.", type: 'muse' },
      { emoji: '🔥', text: "Life-changing money, this cycle. All or nothing.", type: 'degen' }
    ]
  },
  {
    q: "Pick your emotional support beverage:",
    options: [
      { emoji: '☕', text: "An espresso. Focused. Sharp. Fundamentals only.", type: 'witch' },
      { emoji: '🍸', text: "A dirty martini. High risk, high reward.", type: 'degen' },
      { emoji: '🍵', text: "Matcha. Long-term energy.", type: 'diamond' },
      { emoji: '🥂', text: "Champagne. We're celebrating quarterly gains.", type: 'bluechip' }
    ]
  }
];
