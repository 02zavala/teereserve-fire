import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: "your_api_key_here",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "your_auth_domain_here",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "your_project_id_here",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "your_storage_bucket_here",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "your_messaging_sender_id_here",
    NEXT_PUBLIC_FIREBASE_APP_ID: "your_app_id_here",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "your_measurement_id_here",
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  }
};

export default nextConfig;
