import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
    return (
        <Image 
            src="/logo.png"
            alt="TeeReserve Golf Logo"
            width={160}
            height={50}
            className={cn("w-auto", className)}
            priority
        />
    );
}
