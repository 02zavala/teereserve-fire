
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
        // Don't do anything until loading is false.
        if (loading) {
            return;
        }

        // If not loading and there's no user, redirect to login.
        if (!user) {
            router.push(`/${lang}/login?redirect=${pathname}`);
            return;
        }

        // If we have a user but are still waiting for the profile, do nothing yet.
        // The effect will re-run when userProfile is available.
        if (!userProfile) {
            return;
        }

        // Once we have the profile, check the role.
        const isAuthorized = userProfile.role === 'Admin' || userProfile.role === 'SuperAdmin';

        if (!isAuthorized) {
            router.push(`/${lang}`); // Redirect non-admins to home.
        }

    }, [user, userProfile, loading, router, lang, pathname]);

    // Show loader while waiting for auth state or user profile.
    if (loading || !userProfile) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Verifying access...</p>
            </div>
        );
    }
    
    // If the user is an admin, show the protected content.
    // If not, the useEffect will have already initiated a redirect.
    if (userProfile.role === 'Admin' || userProfile.role === 'SuperAdmin') {
        return <>{children}</>;
    }

    // Render nothing while redirecting non-admin users.
    return null;
}
