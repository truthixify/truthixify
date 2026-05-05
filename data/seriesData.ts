import type { Series } from '@/lib/types'

export const series: Series[] = [
  {
    slug: 'polkadot-from-scratch',
    title: 'Polkadot From Scratch',
    summary:
      'A working tour through Polkadot 2.0 — from the smart contract layer to building real dApps with ink! and PAPI/ReactiveDOT.',
    status: 'completed',
    articleSlugs: ['polkadot-hub', 'inkfundme-tutorial'],
  },
  {
    slug: 'starknet-basecamp',
    title: 'The Basecamp Arc',
    summary:
      'From rejected grant to OD Fellow to teaching assistant — a two-part journey through Starknet Basecamp.',
    status: 'completed',
    articleSlugs: ['journey-through-basecamp-12', 'back-to-basecamp'],
  },
  {
    slug: 'zk-essays',
    title: 'Notes on Zero Knowledge',
    summary:
      'Short essays on commitments, proof systems, and the practical tradeoffs of building privacy-preserving apps.',
    status: 'in-progress',
    articleSlugs: ['unlocking-zk'],
  },
  {
    slug: 'ckb',
    title: 'Building on CKB',
    summary:
      'Guides and tutorials on building with Nervos CKB, from first principles to deployed scripts.',
    status: 'in-progress',
    articleSlugs: ['learn-ckb-in-45-minutes'],
  },
  {
    slug: 'ml-from-zero',
    title: 'ML From Zero',
    summary:
      'Documenting a ground-up rebuild of math, Python, and ML fundamentals — paired with the daily learning journal.',
    status: 'planned',
    articleSlugs: [],
  },
]

export const getSeries = (slug: string) => series.find((s) => s.slug === slug)
export const getSeriesTitle = (slug?: string) => (slug ? getSeries(slug)?.title : undefined)
