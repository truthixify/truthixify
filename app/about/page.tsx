import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'About truthxify — building across AI, cryptography, and distributed systems.',
}

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">About</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">truthxify</h1>

      <div className="prose-reading mt-10">
        <p>
          I&apos;m a builder working across AI, cryptography, and distributed systems. Most of my
          recent work has been in the Polkadot ecosystem — building dApps with ink! and contributing
          to the smart contract layer — alongside ongoing work in AI.
        </p>
        <p>
          This site is split in three. <Link href="/articles">Articles</Link> are long-form pieces —
          sometimes a roll-up of what I&apos;ve been working on, sometimes a tutorial, sometimes
          just an opinion or an interest I wanted to write about. <Link href="/series">Series</Link>{' '}
          are multi-part collections held together by a single thread. The{' '}
          <Link href="/journals">journal</Link> is the raw, daily, unfiltered version — synced from
          a public GitHub repo.
        </p>
        <h2>Currently</h2>
        <ul>
          <li>Going deeper on AI — fundamentals, applied work, and everything in between</li>
          <li>Building on CKB (Nervos) and writing about it</li>
          <li>Exploring the intersection of ZK and AI</li>
        </ul>
        <h2>Elsewhere</h2>
        <ul>
          <li>
            <a href="https://x.com/truthixifi" target="_blank" rel="noreferrer">
              X (@truthixifi)
            </a>
          </li>
          <li>
            <a href="https://github.com/truthixify" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a href="https://truthixify.vercel.app/" target="_blank" rel="noreferrer">
              Current live site
            </a>
          </li>
        </ul>
      </div>
    </article>
  )
}
