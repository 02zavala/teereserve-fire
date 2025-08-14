
"use client";

import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/AuthContext'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
        >
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
        </GoogleReCaptchaProvider>
    )
}
