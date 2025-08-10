
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/auth/UserNav";
import type { Locale } from "@/i18n-config";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "../Logo";


interface HeaderProps {
    dictionary: {
        home: string;
        findCourse: string;
        about: string;
        contact: string;
    },
    lang: Locale;
}

export function Header({ dictionary, lang }: HeaderProps) {
    const navLinks = [
        { href: `/${lang}`, label: dictionary.home },
        { href: `/${lang}/courses`, label: dictionary.findCourse },
        { href: `/${lang}/about`, label: dictionary.about },
        { href: `/${lang}/contact`, label: dictionary.contact },
    ];
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href={`/${lang}`} className="mr-6 flex items-center space-x-2">
                        <Logo className="h-10 w-auto" />
                    </Link>
                    <nav className="flex items-center gap-6 text-sm">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="transition-colors hover:text-foreground/80 text-foreground/60"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="pr-0">
                        <Link href={`/${lang}`} className="flex items-center space-x-2">
                           <Logo className="h-10 w-auto" />
                        </Link>
                        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                            <div className="flex flex-col space-y-3">
                                {navLinks.map(link => (
                                    <Link key={link.href} href={link.href} className="text-foreground">
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
                
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                       <LanguageSwitcher lang={lang} />
                    </div>
                    <nav className="flex items-center gap-2">
                        <ThemeToggle />
                        <UserNav />
                    </nav>
                </div>
            </div>
        </header>
    );
}
