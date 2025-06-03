interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'Sukura',
    description: `Sukura is a zero-knowledge mixer on Solana that lets you send and receive SOL privately. Shield your on-chain activity and preserve transaction confidentiality with fast finality.`,
    imgSrc: '/static/images/SukuraLogo.svg',
    href: 'https://sukura.vercel.app',
  },
  {
    title: 'ZK Word Mastermind',
    description: 'The classic code-breaking game, reimagined for Web3 — powered by Zero-Knowledge Proofs built with for provable fairness. No trust, just truth.',
    imgSrc: '/static/images/mastermind.png',
    href: 'https://word-mastermind.vercel.app/'
  }
]

export default projectsData
