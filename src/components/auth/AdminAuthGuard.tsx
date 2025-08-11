
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types";
import { Loader2 } from "lucide-react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);

    const lang = pathname.split('/')[1] || 'en';

    useEffect(() => {
        if (loading) {
            return; // Wait until Firebase auth state is loaded
        }

        if (!user) {
            router.push(`/${lang}/login?redirect=${pathname}`);
            return;
        }

        const checkAdminRole = async () => {
            const userDocRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const userProfile = docSnap.data() as UserProfile;
                if (userProfile.role === 'Admin' || userProfile.role === 'SuperAdmin') {
                    setIsAuthorized(true);
                } else {
                    router.push(`/${lang}`); // Redirect non-admins to home
                }
            } else {
                router.push(`/${lang}`); // Redirect if no profile found
            }
            setIsVerifying(false);
        };

        checkAdminRole();

    }, [user, loading, router, lang, pathname]);

    if (isVerifying) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Verifying access...</p>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Render nothing while redirecting
    }

    return <>{children}</>;
}
