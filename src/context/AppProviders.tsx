
"use client";

import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/AuthContext'

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
    )
}
