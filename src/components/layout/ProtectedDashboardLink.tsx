"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import type { getDictionary } from "@/lib/get-dictionary";

interface ProtectedDashboardLinkProps {
    dictionary: Awaited<ReturnType<typeof getDictionary>>['footer'];
}

export function ProtectedDashboardLink({ dictionary }: ProtectedDashboardLinkProps) {
    const { user } = useAuth();
    const isAdmin = user && user.email?.endsWith('@teereserve.com');

    if (!isAdmin) {
        return null;
    }

    return (
        <li>
            <Link 
                href="/admin/dashboard" 
                className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
            >
                <span className="w-1 h-1 bg-primary/50 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                {dictionary.adminDashboard}
            </Link>
        </li>
    );
}
