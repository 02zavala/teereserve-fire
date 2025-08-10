import type { Metadata } from 'next'
import { Playfair_Display, PT_Sans } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/components/layout/ThemeProvider'

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
  title: 'TeeReserve',
  description: 'Book your next golf adventure in Los Cabos.',
  icons: {
    icon: '/favicon.ico',
  },
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    lang: string;
  };
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }]
}


export default function RootLayout({
  children,
  params
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
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
