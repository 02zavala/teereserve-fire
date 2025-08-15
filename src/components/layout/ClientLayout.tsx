
"use client";

import { AppProviders } from '@/context/AppProviders';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Locale } from '@/i18n-config';

interface ClientLayoutProps {
  children: React.ReactNode;
  lang: Locale;
}

export function ClientLayout({ children, lang }: ClientLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppProviders>
        <ErrorBoundary>
          <Suspense fallback={
              <div className="flex h-screen w-full items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
          }>
              {children}
          </Suspense>
        </ErrorBoundary>
      </AppProviders>
    </ThemeProvider>
  );
}
