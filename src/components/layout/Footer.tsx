import Link from "next/link";

const GolfIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a5 5 0 0 0-5 5c0 1.5.64 2.85 1.66 3.84" />
      <path d="M12 22a5 5 0 0 1-5-5c0-1.5.64-2.85 1.66-3.84" />
      <path d="M22 12a5 5 0 0 1-5-5c-1.5 0-2.85.64-3.84 1.66" />
      <path d="M2 12a5 5 0 0 0-5 5c-1.5 0-2.85-.64-3.84-1.66" />
    </svg>
  );

export function Footer() {
    return (
        <footer className="border-t border-border/40 py-6 md:py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex items-center space-x-2">
                         <GolfIcon className="h-6 w-6 text-primary" />
                        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                            Built by TeeReserve.
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
                    </div>
                </div>
                <div className="mt-4 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} TeeReserve. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
