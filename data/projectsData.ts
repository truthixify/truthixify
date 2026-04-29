import type { Project } from '@/lib/types'

const projectsData: Project[] = [
  {
    slug: 'sukura',
    name: 'Sukura',
    tagline:
      'A zero-knowledge mixer on Solana — send and receive SOL privately, with fast finality.',
    href: 'https://sukura.vercel.app/',
    tags: ['zk', 'solana', 'privacy'],
  },
  {
    slug: 'word-mastermind',
    name: 'ZK Word Mastermind',
    tagline:
      'Classic code-breaking, reimagined for Web3 — provable fairness via zero-knowledge proofs.',
    href: 'https://word-mastermind.vercel.app/',
    tags: ['zk', 'game', 'web3'],
  },
  {
    slug: 'obscura',
    name: 'Obscura',
    tagline:
      'A privacy-focused shielded pool for Starknet — private deposits, transfers, and withdrawals using ZK + UTXOs.',
    href: 'https://obscura-app.vercel.app/',
    tags: ['zk', 'starknet', 'privacy'],
  },
  {
    slug: 'inkfundme',
    name: 'InkFundMe',
    tagline: 'Crowdfunding dApp on Polkadot with refunds, built with ink! + PAPI / ReactiveDOT.',
    href: 'https://inkfundme-tutorial.vercel.app/',
    repo: 'https://github.com/truthixify/inkfundme-tutorial',
    tags: ['polkadot', 'ink', 'react'],
  },
]

export default projectsData
