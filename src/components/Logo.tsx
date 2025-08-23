
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("relative", className)}>
            <Image
                src="/logo.svg"
                alt="TeeReserve Logo"
                fill
                className="object-contain dark:invert"
                priority
            />
        </div>
    );
}
