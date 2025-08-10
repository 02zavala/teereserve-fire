
"use client";

import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
          scriptProps={{
            async: false,
            defer: false,
            appendTo: "head",
            nonce: undefined,
          }}
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
        </GoogleReCaptchaProvider>
    )
}
