import Link from "next/link";
import { Golf } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border/40 py-6 md:py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex items-center space-x-2">
                         <Golf className="h-6 w-6 text-primary" />
                        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                            Built by TeeTime Concierge.
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
                    </div>
                </div>
                <div className="mt-4 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} TeeTime Concierge. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
