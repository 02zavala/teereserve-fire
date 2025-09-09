import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Negotiator from 'negotiator';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import { i18n } from './i18n-config';

function detectLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((v, k) => (negotiatorHeaders[k] = v));
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  return matchLocale(languages, i18n.locales, i18n.defaultLocale) || i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const hasLocale = i18n.locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );

  if (!hasLocale) {
    const locale = detectLocale(request);
    const rest = pathname === '/' ? '' : pathname;
    return NextResponse.redirect(new URL(`/${locale}${rest}`, origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/|api/).*)'],
};
