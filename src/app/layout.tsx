import type { Metadata } from 'next'
import { Playfair_Display, PT_Sans } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ClientLayout } from '@/components/layout/ClientLayout'
import type { Locale } from '@/i18n-config'

const fontHeadline = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
})

const fontBody = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'TeeTime Concierge',
  description: 'Book your next golf adventure in Los Cabos.',
  manifest: '/manifest.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: ['/favicon.ico', '/favicon.svg'],
    apple: '/apple-touch-icon.svg',
    shortcut: '/favicon.ico',
  },
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: { lang: Locale };
}

export default function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  return (
    <html lang={params.lang} suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          fontHeadline.variable,
          fontBody.variable
        )}
      >
        <ClientLayout lang={params.lang}>
            {children}
        </ClientLayout>
      </body>
    </html>
  )
}
