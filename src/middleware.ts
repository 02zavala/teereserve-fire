import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './i18n-config'
import Negotiator from 'negotiator'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import { SecurityUtils } from './lib/security';

// Función para generar CSRF token compatible con edge runtime
function generateCSRFToken(): string {
  // Usar Math.random como fallback para edge runtime
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Rate limiting storage (en producción usar Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Configuración de rate limiting
const RATE_LIMITS = {
  api: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
  auth: { requests: 5, window: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  upload: { requests: 10, window: 60 * 1000 }, // 10 uploads per minute
};

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  const locales: string[] = i18n.locales as any
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

  const locale = matchLocale(languages, locales, i18n.defaultLocale)
  return locale
}

// Función para obtener IP del cliente
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

// Rate limiting
function checkRateLimit(ip: string, endpoint: string): boolean {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  
  // Determinar límites según el endpoint
  let limits = RATE_LIMITS.api;
  if (endpoint.includes('/auth/')) {
    limits = RATE_LIMITS.auth;
  } else if (endpoint.includes('/upload')) {
    limits = RATE_LIMITS.upload;
  }
  
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    // Crear nuevo record o resetear
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limits.window
    });
    return true;
  }
  
  if (record.count >= limits.requests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Validar headers de seguridad
function validateSecurityHeaders(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent');
  
  // Bloquear user agents sospechosos
  if (userAgent) {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i
    ];
    
    // Permitir bots legítimos
    const allowedBots = [
      /googlebot/i,
      /bingbot/i,
      /facebookexternalhit/i,
      /twitterbot/i,
      /linkedinbot/i
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    const isAllowedBot = allowedBots.some(pattern => pattern.test(userAgent));
    
    if (isSuspicious && !isAllowedBot) {
      return false;
    }
  }
  
  return true;
}

// Validar CSRF token para requests POST/PUT/DELETE
function validateCSRFToken(request: NextRequest): boolean {
  const method = request.method;
  
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfToken = request.headers.get('x-csrf-token');
    const sessionToken = request.cookies.get('csrf-token')?.value;
    
    if (!csrfToken || !sessionToken) {
      return false;
    }
    
    return SecurityUtils.validateCSRFToken(csrfToken, sessionToken);
  }
  
  return true;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const ip = getClientIP(request);
  
  // Aplicar validaciones de seguridad a rutas API y auth
  if (pathname.startsWith('/api/') || pathname.includes('/auth/')) {
    
    // 1. Validar headers de seguridad
    if (!validateSecurityHeaders(request)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    // 2. Rate limiting
    if (!checkRateLimit(ip, pathname)) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '60'
        }
      });
    }
    
    // 3. Validar CSRF token para APIs
    if (pathname.startsWith('/api/') && !validateCSRFToken(request)) {
      return new NextResponse('CSRF Token Invalid', { status: 403 });
    }
  }
  
  // Skip internationalization for API routes
  if (pathname.startsWith('/api/')) {
    // Exclude guest checkout APIs from CSRF validation
    const guestAPIs = [
      '/api/create-guest-booking-intent',
      '/api/finalize-guest-booking'
    ];
    
    const isGuestAPI = guestAPIs.some(api => pathname.startsWith(api));
    
    if (isGuestAPI) {
      // Skip CSRF validation for guest APIs
      const response = NextResponse.next();
      addSecurityHeaders(response);
      return response;
    }
    
    const response = NextResponse.next();
    addSecurityHeaders(response);
    addCSRFToken(request, response);
    return response;
  }

  // Lógica de internacionalización
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)

    // If the pathname is just "/", redirect to the locale root.
    // Otherwise, prefix the pathname with the locale.
    const newPath = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
    
    const response = NextResponse.redirect(
      new URL(newPath, request.url)
    )
    
    // Agregar headers de segurección
    addSecurityHeaders(response);
    addCSRFToken(request, response);
    
    return response;
  }
  
  // Crear respuesta normal con headers de seguridad
  const response = NextResponse.next();
  addSecurityHeaders(response);
  addCSRFToken(request, response);
  
  return response;
}

// Función para agregar headers de seguridad
function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // CSP (Content Security Policy)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://*.googleapis.com https://*.firebaseapp.com wss://*.firebaseapp.com",
    "frame-src 'self' https://js.stripe.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
}

// Función para agregar CSRF token
function addCSRFToken(request: NextRequest, response: NextResponse) {
  if (!request.cookies.get('csrf-token')) {
    const csrfToken = generateCSRFToken();
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 horas
    });
  }
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}