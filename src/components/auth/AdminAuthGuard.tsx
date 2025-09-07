
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
        const checkAuth = () => {
            // Wait until the initial loading is finished before doing any checks.
            if (loading) {
                return; // Still loading, wait for the next run
            }

            // If loading is finished and there's no user, redirect to login.
            if (!user) {
                router.push(`/${lang}/login?redirect=${pathname}`);
                return;
            }

            // If there is a user but the profile is loaded and they are not an admin, redirect to home.
            if (userProfile && userProfile.role !== 'Admin' && userProfile.role !== 'SuperAdmin') {
                router.push(`/${lang}`);
                return;
            }
        };

        checkAuth();

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
