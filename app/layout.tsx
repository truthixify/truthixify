import 'css/tailwind.css'

import { Inter, JetBrains_Mono, Fraunces } from 'next/font/google'
import { ThemeProviders } from './theme-providers'
import { HeaderWrapper } from '@/components/header-wrapper'
import { SiteFooter } from '@/components/site-footer'
import { Metadata } from 'next'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
})

const SITE_URL = 'https://truthixify.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'truthxify',
    template: '%s — truthxify',
  },
  description:
    'Articles, series, and a daily journal by truthxify — on AI, cryptography, distributed systems, and whatever else has my attention.',
  openGraph: {
    title: 'truthxify',
    description:
      'Articles, series, and a daily journal by truthxify — on AI, cryptography, distributed systems, and whatever else has my attention.',
    url: './',
    siteName: 'truthxify',
    images: ['/og-image.jpg'],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${SITE_URL}/rss.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: 'truthxify',
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <link rel="apple-touch-icon" sizes="76x76" href="/static/favicons/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/static/favicons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/static/favicons/favicon-16x16.png" />
      <link rel="manifest" href="/static/favicons/site.webmanifest" />
      <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
      <body className="bg-background text-foreground flex min-h-screen flex-col antialiased">
        <ThemeProviders>
          <HeaderWrapper />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </ThemeProviders>
      </body>
    </html>
  )
}
