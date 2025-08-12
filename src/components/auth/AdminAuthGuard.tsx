
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
            return; // Wait until loading is false
        }

        if (!user) {
            router.push(`/${lang}/login?redirect=${pathname}`);
            return;
        }

        // Now we know we have a user, but we might not have the profile yet.
        // The loading flag from useAuth should cover both.
        if (userProfile) {
            const isAuthorized = userProfile.role === 'Admin' || userProfile.role === 'SuperAdmin';
            if (!isAuthorized) {
                router.push(`/${lang}`); // Redirect non-admins to home.
            }
        }
        // If user exists but no profile, the context is still loading it.
        // The loader below will show. The effect will re-run when userProfile is available.

    }, [user, userProfile, loading, router, lang, pathname]);

    // Show loader while waiting for auth state or user profile to be fully loaded.
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Verifying access...</p>
            </div>
        );
    }
    
    // Once everything is loaded, if the user and profile exist, and the role is correct, show content.
    if (user && userProfile && (userProfile.role === 'Admin' || userProfile.role === 'SuperAdmin')) {
        return <>{children}</>;
    }

    // This will be shown briefly for non-admins while redirecting.
    // Or if there's a state mismatch (e.g., user but no profile after loading).
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Verifying access...</p>
        </div>
    );
}
