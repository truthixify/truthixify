import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Now',
  description:
    "What truthxify is focused on right now — current work, what I'm learning, and where I am.",
}

export default function NowPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">Now</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
        What I&apos;m doing now
      </h1>
      <p className="text-muted-foreground mt-4 text-sm">
        A snapshot of where my attention is. Inspired by{' '}
        <a
          href="https://nownownow.com/about"
          target="_blank"
          rel="noreferrer"
          className="decoration-accent/60 hover:decoration-accent underline underline-offset-4"
        >
          Derek Sivers&apos; /now page
        </a>
        .
      </p>

      <div className="prose-reading mt-12">
        <h2>Working on</h2>
        <ul>
          <li>
            Running the{' '}
            <a href="https://github.com/truthixify/lfc" target="_blank" rel="noreferrer">
              <strong>Loss Function Collective</strong>
            </a>{' '}
            — a small reading group for devs learning AI/ML together. Read, implement, discuss,
            ship. No passive consumption.
          </li>
          <li>
            Quiet R&amp;D at the intersection of <strong>AI and cryptography</strong> — figuring out
            which parts are real and which are hype.
          </li>
          <li>
            Actively building on <strong>CKB</strong> (Nervos) right now — shipping small tools and
            writing about what I learn along the way.
          </li>
          <li>
            Porting this site into a long-term Next.js setup with a GitHub-synced daily journal.
          </li>
        </ul>

        <h2>Learning</h2>
        <ul>
          <li>
            <strong>Machine learning</strong> from the ground up — transformers, training dynamics,
            evals.
          </li>
          <li>
            <strong>Agents</strong> and agentic systems — tool use, planning, evals, and what
            actually ships.
          </li>
          <li>
            Deeper into <strong>cryptography</strong>: FHE, stealth addresses, and TEEs.
          </li>
          <li>Distributed systems patterns I keep brushing up against in practice.</li>
        </ul>

        <h2>Status</h2>
        <ul>
          <li>Based in Nigeria, working on internet time.</li>
          <li>
            Open to interesting conversations and collaborations — especially around AI and
            cryptography. Reach out on{' '}
            <a href="https://x.com/truthixifi" target="_blank" rel="noreferrer">
              X
            </a>
            .
          </li>
          <li>
            Open to <strong>full-time</strong> and <strong>open source</strong> roles.
          </li>
        </ul>
      </div>
    </article>
  )
}
