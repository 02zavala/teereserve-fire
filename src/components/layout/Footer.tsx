import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone, Globe, MapPin } from 'lucide-react';
import type { getDictionary } from "@/lib/get-dictionary";
import { ProtectedDashboardLink } from "./ProtectedDashboardLink";


const GolfIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
      <path d="M12 7a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1z"/>
      <circle cx="12" cy="15" r="1"/>
    </svg>
  );

interface FooterProps {
    dictionary: Awaited<ReturnType<typeof getDictionary>>['footer'];
}


export function Footer({ dictionary }: FooterProps) {
  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
             <div className="flex items-center space-x-2 mb-4">
                <GolfIcon className="h-10 w-10 text-primary" />
                <span className="text-xl font-bold font-headline text-primary">
                  TeeReserve Golf
                </span>
            </div>
            <p className="text-muted-foreground text-sm">
              {dictionary.platformDescription}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
                {dictionary.footer.platform}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/courses" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.footer.courses}
                </Link>
              </li>
              <li>
                <Link 
                  href="/courses" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.footer.reservations}
                </Link>
              </li>
               <ProtectedDashboardLink dictionary={dictionary.footer} />
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {dictionary.footer.support}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/help" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.footer.helpCenter}
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.footer.contact}
                </Link>
              </li>
              <li>
                <Link 
                  href="/api/status" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {dictionary.footer.apiStatus}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {dictionary.footer.contactTitle}
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <a 
                  href="mailto:info@teereserve.golf"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  info@teereserve.golf
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <a 
                  href="tel:+526241352986"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  +52 624 135 2986
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-primary" />
                <a 
                  href="https://teereserve.golf"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  teereserve.golf
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">
                {dictionary.footer.followUs}
              </h4>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/teereservegolf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://x.com/TeeReserveGolf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                  aria-label="X (Twitter)"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/teereservegolf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} TeeReserve Golf. {dictionary.footer.allRightsReserved}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link 
                href="/privacy" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {dictionary.footer.privacyPolicy}
              </Link>
              <Link 
                href="/terms" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {dictionary.footer.termsOfService}
              </Link>
              <p className="text-accent font-medium">
                {dictionary.footer.premiumExperience}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
