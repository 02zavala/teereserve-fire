/**
 * Configuración de Firebase Analytics y Google Analytics 4
 * Para TeeReserve - Sistema de Reservas de Golf
 */

import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';
import { app } from './firebase';

let analytics: Analytics | null = null;

// Inicializar Analytics solo en el cliente
if (typeof window !== 'undefined' && app) {
  try {
    analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics inicializado');
  } catch (error) {
    console.error('❌ Error inicializando Firebase Analytics:', error);
  }
}

// Eventos personalizados para TeeReserve
export const trackEvent = {
  // Eventos de reservas
  reservationStarted: (courseId: string, date: string) => {
    if (analytics) {
      logEvent(analytics, 'reservation_started', {
        course_id: courseId,
        reservation_date: date,
        timestamp: new Date().toISOString()
      });
    }
  },

  reservationCompleted: (reservationId: string, courseId: string, amount: number, paymentMethod: string) => {
    if (analytics) {
      logEvent(analytics, 'purchase', {
        transaction_id: reservationId,
        value: amount,
        currency: 'EUR',
        items: [{
          item_id: courseId,
          item_name: 'Golf Reservation',
          category: 'Golf Course',
          quantity: 1,
          price: amount
        }],
        payment_method: paymentMethod
      });
    }
  },

  reservationCancelled: (reservationId: string, reason: string) => {
    if (analytics) {
      logEvent(analytics, 'reservation_cancelled', {
        reservation_id: reservationId,
        cancellation_reason: reason,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Eventos de navegación
  courseViewed: (courseId: string, courseName: string) => {
    if (analytics) {
      logEvent(analytics, 'view_item', {
        item_id: courseId,
        item_name: courseName,
        item_category: 'Golf Course',
        timestamp: new Date().toISOString()
      });
    }
  },

  searchPerformed: (searchTerm: string, resultsCount: number) => {
    if (analytics) {
      logEvent(analytics, 'search', {
        search_term: searchTerm,
        results_count: resultsCount,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Eventos de usuario
  userRegistered: (method: string) => {
    if (analytics) {
      logEvent(analytics, 'sign_up', {
        method: method,
        timestamp: new Date().toISOString()
      });
    }
  },

  userLoggedIn: (method: string) => {
    if (analytics) {
      logEvent(analytics, 'login', {
        method: method,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Eventos de engagement
  contactFormSubmitted: (formType: string) => {
    if (analytics) {
      logEvent(analytics, 'generate_lead', {
        form_type: formType,
        timestamp: new Date().toISOString()
      });
    }
  },

  newsletterSubscribed: (source: string) => {
    if (analytics) {
      logEvent(analytics, 'newsletter_subscription', {
        source: source,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Eventos de error
  errorOccurred: (errorType: string, errorMessage: string, page: string) => {
    if (analytics) {
      logEvent(analytics, 'exception', {
        description: `${errorType}: ${errorMessage}`,
        fatal: false,
        page: page,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Eventos de performance
  pageLoadTime: (page: string, loadTime: number) => {
    if (analytics) {
      logEvent(analytics, 'page_load_time', {
        page: page,
        load_time_ms: loadTime,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Configurar propiedades de usuario
export const setUserProperties = {
  setUserType: (userType: 'guest' | 'registered' | 'premium') => {
    if (analytics) {
      // En Firebase Analytics, las propiedades de usuario se configuran diferente
      logEvent(analytics, 'user_type_set', {
        user_type: userType
      });
    }
  },

  setUserLocation: (country: string, region: string) => {
    if (analytics) {
      logEvent(analytics, 'user_location_set', {
        country: country,
        region: region
      });
    }
  },

  setPreferredLanguage: (language: string) => {
    if (analytics) {
      logEvent(analytics, 'language_preference_set', {
        language: language
      });
    }
  }
};

// Configuración de Google Analytics 4 (gtag)
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Inicializar Google Analytics 4
export const initGA4 = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
    try {
      // Verificar si ya existe el script
      const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
      if (existingScript) {
        console.log('✅ Google Analytics script ya cargado');
        return;
      }

      // Configurar dataLayer primero
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };

      // Cargar gtag script con manejo de errores
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}`;
      
      script.onload = () => {
        // Configurar GA4 después de que el script se cargue
        window.gtag('js', new Date());
        window.gtag('config', process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, {
          page_title: 'TeeReserve - Golf Course Reservations',
          page_location: window.location.href,
          send_page_view: true,
          // Configuraciones de privacidad
          anonymize_ip: true,
          allow_google_signals: true,
          allow_ad_personalization_signals: false
        });
        console.log('✅ Google Analytics 4 inicializado correctamente');
      };

      script.onerror = (error) => {
        console.warn('⚠️ Error cargando Google Analytics:', error);
        // No bloquear la aplicación si GA4 falla
      };

      document.head.appendChild(script);
    } catch (error) {
      console.warn('⚠️ Error inicializando Google Analytics:', error);
    }
  } else {
    console.log('ℹ️ Google Analytics no inicializado: falta MEASUREMENT_ID o no está en el cliente');
  }
};

// Hook para usar en componentes React
export const useAnalytics = () => {
  return {
    analytics,
    trackEvent,
    setUserProperties,
    isInitialized: analytics !== null
  };
};

export default analytics;