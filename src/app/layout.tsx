import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Wayfinder - Intelligent LLM Routing Control Plane',
  description:
    'Optimize model selection with policy enforcement, learned routing decisions, and semantic caching. Reduce costs while maintaining quality.',
  keywords: [
    'LLM routing',
    'AI model selection',
    'cost optimization',
    'semantic caching',
    'policy enforcement',
  ],
  authors: [{ name: 'Wayfinder' }],
  openGraph: {
    title: 'Wayfinder - Intelligent LLM Routing Control Plane',
    description:
      'Optimize model selection with policy enforcement, learned routing decisions, and semantic caching.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
