
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("relative", className)}>
            <Image
                src="/logo.svg"
                alt="TeeReserve Logo"
                width={150}
                height={40}
                className="h-full w-auto dark:invert"
                priority
            />
        </div>
    );
}
