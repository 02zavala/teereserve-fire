import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 200 50"
                className="h-full w-auto"
                fill="currentColor"
            >
                <text 
                    x="10" 
                    y="40" 
                    fontFamily="var(--font-headline), serif"
                    fontSize="40" 
                    className="text-primary"
                    fill="hsl(var(--primary))"
                >
                    TeeReserve
                </text>
            </svg>
        </div>
    );
}
