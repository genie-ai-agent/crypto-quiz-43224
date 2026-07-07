// The 6 Cryptogal investor archetypes
const ARCHETYPES = {
  diamond: {
    key: 'diamond',
    emoji: '💎',
    name: 'Diamond Hands Darling',
    tag: 'The Long-Term Believer',
    desc: "You bought and you're not selling. Not for a 2x, not for a dip, not for your ex's texts. You've read the whitepaper, you believe in the mission, and you'll be here when everyone else has rage-quit. Time in the market > timing the market, always.",
    traits: {
      style: 'HODL until the sun explodes',
      risk: 'Medium (patient risk)',
      vibe: 'Zen but stubborn',
      spirit: 'A vintage handbag that only appreciates'
    },
    quote: "Panic is temporary. Conviction is forever. Pass the matcha."
  },
  bluechip: {
    key: 'bluechip',
    emoji: '👑',
    name: 'Blue-Chip Baddie',
    tag: 'The Sensible Sovereign',
    desc: "BTC, ETH, maybe a little SOL when you're feeling spicy. You don't do jpegs of frogs and you definitely don't do coins with dog mascots. You want a portfolio your future self and your financial advisor could both look at without wincing.",
    traits: {
      style: 'Blue chips and cold storage',
      risk: 'Low to moderate',
      vibe: 'Boss energy, minimal chaos',
      spirit: 'A tailored blazer in ETF form'
    },
    quote: "I don't chase pumps. Pumps chase me. Occasionally. In their dreams."
  },
  degen: {
    key: 'degen',
    emoji: '🔥',
    name: 'Degen Queen',
    tag: 'The High-Risk High-Reward Icon',
    desc: "You've aped into a coin because the logo was cute. You've been up 40x by lunch and down 90% by dinner and lived to tweet about it. Life is short, the chain is fast, and someone has to catch these moves. It might as well be you.",
    traits: {
      style: 'Memecoins, launches, chaos',
      risk: 'Maximum (and then some)',
      vibe: 'Casino chic',
      spirit: 'A glittery mini dress on a Tuesday'
    },
    quote: "If I wanted safety I would've kept my money in a savings account. Weak."
  },
  yield: {
    key: 'yield',
    emoji: '🌸',
    name: 'Yield Goddess',
    tag: 'The Passive Income Priestess',
    desc: "Your money makes money while you sleep, brunch, and reply-all. You know your APYs, your LP pairs, and which protocols have been audited by grown-ups. You'd rather stake than speculate, and honestly? The numbers agree with you.",
    traits: {
      style: 'Staking, LPs, DeFi yields',
      risk: 'Calculated',
      vibe: 'Serene and compounding',
      spirit: 'A silk robe and a spreadsheet'
    },
    quote: "Ask me about my APR. Actually don't, we'll be here all night."
  },
  witch: {
    key: 'witch',
    emoji: '🔮',
    name: 'Research Witch',
    tag: 'The Deep-Dive Analyst',
    desc: "You don't buy anything you haven't read the docs on. Twice. You've got a Notion full of tokenomics breakdowns and a group chat that calls you before they ape. Fundamentals over hype, always. When you're finally right, you don't even gloat. Much.",
    traits: {
      style: 'Fundamentals & tokenomics',
      risk: 'Moderate & researched',
      vibe: 'Cerebral, a little smug',
      spirit: 'Reading glasses at a full moon'
    },
    quote: "I don't get FOMO. I get footnotes."
  },
  muse: {
    key: 'muse',
    emoji: '🎨',
    name: 'NFT Muse',
    tag: 'The Culture Collector',
    desc: "For you, crypto is culture. Art, identity, community, vibes. Your wallet is a mood board. You've made friends in Discords you'll never meet IRL and you're weirdly okay with that. The bag matters, but the taste matters more.",
    traits: {
      style: 'NFTs, culture, community',
      risk: 'Emotional (in a chic way)',
      vibe: 'Gallery opening energy',
      spirit: 'A curated Are.na and a good coffee'
    },
    quote: "It's not JPEGs, it's identity. Sit down."
  }
};
