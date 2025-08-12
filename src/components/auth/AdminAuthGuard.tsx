
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
        // Don't do anything until the initial loading is complete
        if (loading) {
            return;
        }

        // If not logged in, redirect to login page
        if (!user) {
            router.push(`/${lang}/login?redirect=${pathname}`);
            return;
        }
        
        // If logged in, but profile is not yet loaded, wait.
        // Once profile is loaded, check the role.
        if (userProfile) {
            const isAuthorized = userProfile.role === 'Admin' || userProfile.role === 'SuperAdmin';
            if (!isAuthorized) {
                // If not an admin, redirect to home.
                router.push(`/${lang}`);
            }
        }

    }, [user, userProfile, loading, router, lang, pathname]);

    // Show a loader while the initial auth state is being determined,
    // or while waiting for the user profile to load after authentication.
    if (loading || !userProfile) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Verifying access...</p>
            </div>
        );
    }
    
    // If the user is authenticated and has an admin role, render the children.
    if (userProfile.role === 'Admin' || userProfile.role === 'SuperAdmin') {
        return <>{children}</>;
    }

    // Fallback: show a loader while redirecting non-admin users.
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Redirecting...</p>
        </div>
    );
}
