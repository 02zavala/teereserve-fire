
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
        // If still loading, wait.
        if (loading) {
            return;
        }

        // If not loading and no user, redirect to login.
        if (!user) {
            router.push(`/${lang}/login?redirect=${pathname}`);
            return;
        }

        // If user exists but profile is still loading, wait. The hook will re-run when userProfile is available.
        if (!userProfile) {
            return;
        }
        
        // At this point, we have user and userProfile. Check authorization.
        const isAuthorized = userProfile.role === 'Admin' || userProfile.role === 'SuperAdmin';
        if (!isAuthorized) {
            router.push(`/${lang}`); // Redirect non-admins to home.
        }

    }, [user, userProfile, loading, router, lang, pathname]);

    // Show loader while waiting for auth state or user profile to be fully loaded.
    if (loading || !userProfile) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Verifying access...</p>
            </div>
        );
    }
    
    // Once everything is loaded, if the user is authorized, show the content.
    // If not authorized, the useEffect will have already initiated a redirect.
    if (userProfile.role === 'Admin' || userProfile.role === 'SuperAdmin') {
        return <>{children}</>;
    }

    // Render nothing while redirecting non-admin users. This avoids a flash of content.
    return null;
}
