
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
        // Add timeout to prevent infinite loading in admin guard
        const adminLoadingTimeout = setTimeout(() => {
            if (loading) {
                console.warn("AdminAuthGuard loading timeout reached, redirecting to login");
                router.push(`/${lang}/login?redirect=${pathname}`);
            }
        }, 8000); // 8 second timeout for admin auth

        // Wait until the initial loading is finished before doing any checks.
        if (!loading) {
            clearTimeout(adminLoadingTimeout);
            // If there's no user, redirect to login.
            if (!user) {
                router.push(`/${lang}/login?redirect=${pathname}`);
            }
            // If there is a user but the profile is loaded and they are not an admin, redirect to home.
            else if (userProfile && userProfile.role !== 'Admin' && userProfile.role !== 'SuperAdmin') {
                router.push(`/${lang}`);
            }
        }

        return () => clearTimeout(adminLoadingTimeout);
    }, [user, userProfile, loading, router, lang, pathname]);

    // While loading, or if the user is logged in but the profile is still loading, show a spinner.
    if (loading || (user && !userProfile)) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Verifying access...</p>
            </div>
        );
    }

    // If the user is authenticated and has a valid admin role, render the children.
    if (user && userProfile && (userProfile.role === 'Admin' || userProfile.role === 'SuperAdmin')) {
        return <>{children}</>;
    }

    // This is a fallback state for when redirection is in progress.
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Redirecting...</p>
        </div>
    );
}
