# TeeReserve Golf Platform 🌍⛳

![TeeReserve](./public/logo.svg)

TeeReserve is a premium golf booking platform built with a modern tech stack, focusing on a global user experience, robust features, and high-quality code. This project serves as a comprehensive example of a full-stack Next.js application.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)

---

## ✨ Features

- **Internationalization (i18n)**: Full support for English and Spanish with locale-based formatting.
- **Dark Mode**: Professional, flash-free dark mode implementation with CSS variables.
- **Authentication**: Secure user authentication with email/password and Google sign-in.
- **Booking System**: Real-time tee time availability and a complete booking flow with secure payments.
- **Discount Coupons**: Admin-managed coupon system with validation and dynamic price updates.
- **Admin Dashboard**: A comprehensive panel for managing courses, bookings, users, reviews, and site content.
- **AI-Powered Features**:
  - Personalized course recommendations.
  - AI-assisted review moderation.
  - Automated transactional emails for booking confirmations and contact forms.
- **User Profiles**: Personalized user dashboards with booking history, scorecard management, and gamification elements.
- **Gamification**: XP and achievement system to enhance user engagement.
- **Guest Booking Lookup**: Allows users without an account to check their reservation status.

---

## 💻 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Database**: [Firestore](https://firebase.google.com/docs/firestore)
- **Storage**: [Firebase Storage](https://firebase.google.com/docs/storage)
- **AI**: [Google AI & Genkit](https://firebase.google.com/docs/genkit)
- **Payments**: [Stripe](https://stripe.com/)
- **Deployment**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Git
- A configured Firebase project with Firestore, Auth, and Storage enabled.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/teereserve.git
    cd teereserve
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Copy the example environment file and fill in the required values from your Firebase, Stripe, and Google Cloud projects.
    ```bash
    cp .env.example .env.local
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open in your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

The project follows a standard Next.js App Router structure:

```
src/
├── app/[lang]/         # Localized routes
│   ├── (pages)/        # Public pages (home, courses, etc.)
│   └── admin/          # Admin dashboard routes
├── components/         # Reusable React components
│   ├── ui/             # shadcn/ui components
│   ├── auth/           # Authentication components
│   └── layout/         # Layout components (Header, Footer)
├── lib/                # Utilities, data fetching, Firebase config
├── context/            # React context providers (Auth)
├── ai/                 # Genkit AI flows and configuration
├── hooks/              # Custom React hooks
├── i18n-config.ts      # i18n configuration
└── middleware.ts       # Next.js middleware for localization
```

---

## 🔑 Environment Variables

You'll need to create a `.env.local` file and add the following variables to run the application:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Google Cloud Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Genkit/Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Email Configuration (Zoho OAuth2)
ZOHO_MAIL_FROM=your_email@yourdomain.com
ZOHO_MAIL_CLIENT_ID=your_client_id
ZOHO_MAIL_CLIENT_SECRET=your_client_secret
ZOHO_MAIL_REFRESH_TOKEN=your_refresh_token
CONTACT_FORM_RECIPIENT=recipient_email@yourdomain.com
```

---

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase for errors.
