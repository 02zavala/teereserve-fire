import Link from "next/link";
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Clock, Star } from 'lucide-react';
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
    <footer className="bg-card text-card-foreground mt-16 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 flex items-center justify-center">
                 <GolfIcon className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-headline text-primary">
                  TeeReserve
                </h3>
                <p className="font-semibold text-muted-foreground">
                  Golf
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {dictionary.platformDescription}
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-muted hover:bg-accent rounded-full flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-muted hover:bg-accent rounded-full flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-muted hover:bg-accent rounded-full flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">{dictionary.quickLinks}</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/courses" 
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                >
                  <span className="w-1 h-1 bg-primary/50 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                  {dictionary.golfCourses}
                </Link>
              </li>
              <li>
                <Link 
                  href="/courses" 
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                >
                  <span className="w-1 h-1 bg-primary/50 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                  {dictionary.book}
                </Link>
              </li>
              <li>
                <Link 
                  href="/" 
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                >
                  <span className="w-1 h-1 bg-primary/50 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                  {dictionary.aiRecommendations}
                </Link>
              </li>
              <li>
                <ProtectedDashboardLink dictionary={dictionary} />
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">{dictionary.contactInfo}</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-sm">{dictionary.reservations}</p>
                  <p className="text-foreground font-semibold">+52 (624) 135 2986</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-sm">Email</p>
                  <p className="text-foreground font-semibold">info@teereserve.golf</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-sm">{dictionary.offices}</p>
                  <p className="text-foreground font-semibold">Los Cabos, BCS</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Horarios y estadísticas */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">{dictionary.ourService}</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-sm">{dictionary.supportHours}</p>
                  <p className="text-foreground font-semibold">{dictionary.online247}</p>
                  <p className="text-muted-foreground text-xs">{dictionary.phoneHours}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-sm">{dictionary.rating}</p>
                  <p className="text-foreground font-semibold">4.8/5 ⭐</p>
                  <p className="text-muted-foreground text-xs">{dictionary.ratingCount}</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 mt-6">
                <h5 className="text-foreground font-semibold mb-2">{dictionary.needHelp}</h5>
                <Link 
                  href="/help"
                  className="text-primary hover:text-primary/80 text-sm transition-colors"
                >
                  {dictionary.helpCenter} →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} TeeReserve Golf. {dictionary.allRightsReserved}
            </div>
            <div className="flex flex-wrap gap-6">
              <Link 
                href="/privacy" 
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                {dictionary.privacyPolicy}
              </Link>
              <Link 
                href="/terms" 
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                {dictionary.termsOfService}
              </Link>
               <span className="text-muted-foreground text-sm">
                {dictionary.madeIn}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
