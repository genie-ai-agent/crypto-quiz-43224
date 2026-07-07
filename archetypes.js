// The 6 Cryptogal investor archetypes, with psychological signatures.
// `psych` describes the mind we're profiling; used to render the "mind read" block.
const ARCHETYPES = {
  diamond: {
    key: 'diamond',
    emoji: '💎',
    name: 'Diamond Hands Darling',
    tag: 'The Long-Term Believer',
    desc: "You bought and you're not selling. Not for a 2x, not for a 30% dip, not for your ex's texts. You've read the whitepaper, you believe in the mission, and you'll be here when everyone else has rage-quit. Time in the market > timing the market, always.",
    traits: {
      style: 'HODL until the sun explodes',
      risk: 'Moderate (patient risk)',
      vibe: 'Zen but stubborn',
      spirit: 'A vintage handbag that only appreciates'
    },
    quote: "Panic is temporary. Conviction is forever. Pass the matcha.",
    psych: {
      strengths: [
        'Emotional regulation in volatility — red candles genuinely don\u2019t hurt you the way they hurt everyone else.',
        'Time-horizon advantage. You compound in years while your peers churn in weeks.',
        'Immune to CT hype cycles. Nothing gets you out of a position you actually believe in.'
      ],
      blindspots: [
        'Conviction can quietly turn into stubbornness. Falling in love with a bag makes it hard to sell a broken thesis.',
        'You underweight the value of taking profit. \u201CI\u2019ll sell at $X\u201D and then you don\u2019t.',
        'Long horizons can mask under-diversification. Being right about one thing is not a portfolio.'
      ],
      questions: [
        'What would actually change your mind about your biggest bag?',
        'When was the last time you took profit \u2014 not a plan to, but actually did?'
      ]
    }
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
    quote: "I don't chase pumps. Pumps chase me. Occasionally. In their dreams.",
    psych: {
      strengths: [
        'Rules-based. You have a plan and you actually follow it, which puts you ahead of ~90% of crypto.',
        'Low regret exposure. You rarely wake up to a rug because you weren\u2019t there in the first place.',
        'You know the difference between boring and losing. Boring compounds. Losing screams.'
      ],
      blindspots: [
        'Your risk floor is so low it might also be your ceiling. Occasional asymmetric bets could pay for your caution 10x over.',
        'A \u201Ctop-20 only\u201D rule can quietly become a \u201Cnever early\u201D rule.',
        'Discipline can drift into snobbery. Not everything unfamiliar is a rug.'
      ],
      questions: [
        'What would a 3\u20135% \u201Cchaos allocation\u201D look like for you \u2014 and can you actually stomach it?',
        'Is your caution a plan, or is it fear wearing a nice blazer?'
      ]
    }
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
    quote: "If I wanted safety I would've kept my money in a savings account. Weak.",
    psych: {
      strengths: [
        'Speed. You spot narratives forming while other people are still reading the article.',
        'Loss tolerance most humans do not have. You can take an L and log back in.',
        'Real edge in early-cycle chaos where boring investors literally cannot function.'
      ],
      blindspots: [
        'Your brain slightly confuses excitement with expected value. They are not the same thing.',
        'You size positions emotionally, not mathematically. One bad size can undo ten good calls.',
        'FOMO is a real cost, not a personality trait. You pay for it whether you notice or not.'
      ],
      questions: [
        'What\u2019s the biggest position size you\u2019ll take on a coin under $10M mcap \u2014 and why that number?',
        'When was the last time you passed on a play because of size, not thesis?'
      ]
    }
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
    quote: "Ask me about my APR. Actually don't, we'll be here all night.",
    psych: {
      strengths: [
        'Systems thinker. You optimize processes, not just positions.',
        'You take on the right kind of risk: technical/protocol, not directional. Very underrated.',
        'Compounding beats picking. You\u2019re playing a math game most people don\u2019t know is available.'
      ],
      blindspots: [
        'Smart-contract risk hides inside \u201Csafe\u201D APYs. High yield is compensation for something.',
        'Yield chasing can drift into over-collateralized fragility. One depeg cascade and it\u2019s a bad week.',
        'You may under-allocate to pure directional upside. Compounding 8% is beautiful; it\u2019s also slow.'
      ],
      questions: [
        'If every DeFi protocol you use halved in TVL tomorrow, does your yield still exist?',
        'What\u2019s the actual source of the yield you\u2019re earning? (If you can\u2019t answer, you\u2019re the yield.)'
      ]
    }
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
    quote: "I don't get FOMO. I get footnotes.",
    psych: {
      strengths: [
        'Signal filtering. You can tell a real thesis from a Twitter thread in about 90 seconds.',
        'Position durability. When it dips, you know what you own, so you don\u2019t flinch.',
        'You\u2019re early to real things, which is where the actual outsized returns live.'
      ],
      blindspots: [
        'Analysis paralysis. \u201COne more report\u201D has cost you more entries than any bad pick.',
        'Being right early and being right on time pay very differently. Timing is a skill you may be under-training.',
        'You underweight narrative. Fundamentals eventually win, but liquidity moves on stories first.'
      ],
      questions: [
        'What\u2019s the trigger that would make you actually buy \u2014 written down, not \u201Cwhen I\u2019m ready\u201D?',
        'Have you built a position at a price you liked in the last 30 days, or just been \u201Cwatching\u201D?'
      ]
    }
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
    quote: "It's not JPEGs, it's identity. Sit down.",
    psych: {
      strengths: [
        'Taste as edge. You spot cultural momentum months before it prices in on charts.',
        'Network capital. Your community pings you first, which is a real, if invisible, asset.',
        'You bring meaning to a market that mostly runs on numbers. That\u2019s not fluff \u2014 it\u2019s the actual product.'
      ],
      blindspots: [
        'Community-driven conviction is very hard to unwind from. It feels like betraying friends to sell.',
        'Illiquidity risk hides inside \u201Cthe floor is holding.\u201D It isn\u2019t, until it isn\u2019t.',
        'Your identity and your bag are entangled. When one hurts, the other bleeds too.'
      ],
      questions: [
        'What price/floor level would make you actually take profit \u2014 written down, not \u201Cif it gets crazy\u201D?',
        'Which parts of your portfolio are investments and which are memberships? Both are fine \u2014 but be honest which is which.'
      ]
    }
  }
};
