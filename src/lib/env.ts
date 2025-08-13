
import { z } from 'zod';

/**
 * Defines the schema for environment variables using Zod.
 * This ensures that all required variables are present and correctly typed
 * at the start of the application, preventing runtime errors.
 */
const envSchema = z.object({
  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  // Google Maps
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1),
  
  // reCAPTCHA
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().min(1),

  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
});

try {
  // Use `process.env` which is populated by Next.js
  envSchema.parse({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(
      '🔥 Missing or invalid environment variables:',
      error.format()
    );
    // In a real application, you might want to prevent the build/start process
    // For now, we'll just log the error.
    // process.exit(1);
  }
}

// Export a typed `env` object for use throughout the application
export const env = envSchema.parse(process.env);
