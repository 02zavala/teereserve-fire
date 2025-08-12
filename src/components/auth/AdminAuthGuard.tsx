
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const lang = pathname.split('/')[1] || 'en';

    useEffect(() => {
        if (loading) {
            // Still waiting for auth state to resolve, do nothing.
            return;
        }

        if (!user) {
            // No user found, redirect to login.
            router.push(`/${lang}/login?redirect=${pathname}`);
            return;
        }

        if (user && !userProfile) {
            // User object is present, but profile is still loading.
            // This happens right after login. We wait for the profile.
            return;
        }

        if (userProfile) {
            // Profile is loaded, now we can check the role.
            const isAuthorized = userProfile.role === 'Admin' || userProfile.role === 'SuperAdmin';
            if (!isAuthorized) {
                // Not an admin, redirect to home page.
                router.push(`/${lang}`);
            }
        }

    }, [user, userProfile, loading, router, lang, pathname]);

    // Show a loader if auth state is loading OR if we have a user but are still waiting for their profile.
    if (loading || (user && !userProfile)) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Verifying access...</p>
            </div>
        );
    }
    
    // If we've passed all checks and the user has an admin role, render the children.
    if (user && userProfile && (userProfile.role === 'Admin' || userProfile.role === 'SuperAdmin')) {
        return <>{children}</>;
    }

    // Fallback loader while redirecting non-admin users.
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Redirecting...</p>
        </div>
    );
}
