# TeeReserve Golf - Premium Golf Booking Platform

TeeReserve Golf is a modern, full-stack web application designed to provide a premium booking experience for tee times at the most exclusive golf courses in Los Cabos, Mexico. The application is built from the ground up using a state-of-the-art technology stack to ensure performance, scalability, and an exceptional user experience.

## Tech Stack

- **Core Framework**: **Next.js 15** with the **App Router**, enabling ultra-fast navigation and optimized server-side and client-side rendering.
- **User Interface**: **Tailwind CSS** combined with the **ShadCN UI** component library, creating an elegant, modern, and fully responsive interface.
- **Backend & Database**: **Firebase** serves as the core of the application, managing:
    - **Authentication**: Secure login and registration system with email/password and providers like Google.
    - **Firestore**: Real-time NoSQL database for storing all information about golf courses, bookings, tee time availability, and user profiles.
    - **Storage**: Cloud storage for all golf course images and photos uploaded by users in their reviews.
- **AI-Powered Features**: **Google Genkit** is used to power advanced features, such as:
    - **Personalized Recommendations**: An AI system that suggests golf courses to users based on their preferences and context.
    - **Content Moderation**: An AI agent that analyzes user reviews for spam or toxic content, assisting administrators.
- **Payment Processing**: Full and secure integration with **Stripe** to manage the entire payment flow for bookings, from creating the payment intent to final confirmation.

## Key Features

### Customer-Facing Site

- **User Authentication**: Complete flow for registration, login, and profile management.
- **Course Exploration & Search**: A dedicated page to view all golf courses, with a powerful search form to filter by location, date, and number of players.
- **Detailed Course Pages**: Each course has its own page with an image gallery, detailed description, rules, location map (Google Maps), a weather forecast widget, and the tee time booking system.
- **Real-Time Booking System**: Users can select a date and view real-time availability of tee times with dynamic pricing.
- **Secure Payment Flow**: Integrated payment process with Stripe to securely confirm and pay for bookings.
- **Review System**: Users who have played a course can leave a rating and a review, which then undergoes a moderation process.

### Comprehensive Admin Panel

- **Main Dashboard**: An overview with key business statistics.
- **Golf Course Management**: A full CRUD (Create, Read, Update, Delete) system to add new courses, edit their information, pricing, and upload images.
- **Availability Management**: An interface for administrators to view and modify the availability and prices of tee times for any given day.
- **Booking Management**: A list of all bookings made on the platform.
- **Review Moderation**: A panel to view all user-submitted reviews, assisted by AI, to approve or reject them.
- **User Management**: A list of all registered users, with the ability to change their roles (e.g., from Customer to Admin).

## Project Structure

Here is an overview of the most important files and directories in the project:

```
/
├── public/                 # Static assets like images, logos, and fonts.
├── src/
│   ├── ai/                 # AI-related logic using Genkit.
│   │   ├── flows/          # Genkit flows for AI agents (recommendations, moderation).
│   │   └── genkit.ts       # Genkit configuration.
│   │
│   ├── app/                # Next.js App Router directory.
│   │   ├── [lang]/         # Dynamic route for internationalization (i18n).
│   │   │   ├── admin/      # Routes for the admin panel.
│   │   │   ├── book/       # Routes for the booking and payment process.
│   │   │   ├── courses/    # Routes for course listing and details pages.
│   │   │   ├── (page).tsx  # Main application pages (Home, About, Contact, etc.).
│   │   │   └── layout.tsx  # Main layout for the customer-facing site.
│   │   │
│   │   ├── globals.css     # Global styles and Tailwind CSS directives.
│   │   └── layout.tsx      # Root layout of the entire application.
│   │
│   ├── components/         # Reusable React components.
│   │   ├── admin/          # Components used exclusively in the admin panel.
│   │   ├── auth/           # Authentication components (Login, Signup forms).
│   │   ├── home/           # Components specific to the homepage.
│   │   ├── layout/         # Layout components (Header, Footer, Theme switcher).
│   │   └── ui/             # ShadCN UI components (Button, Card, etc.).
│   │
│   ├── context/            # Global React contexts (Authentication, App Providers).
│   ├── hooks/              # Custom React hooks.
│   ├── lib/                # Core logic, utilities, and configurations.
│   │   ├── dictionaries/   # JSON files for i18n translations.
│   │   ├── data.ts         # Main data-fetching and Firestore interaction logic.
│   │   ├── firebase.ts     # Firebase SDK initialization.
│   │   └── utils.ts        # Utility functions.
│   │
│   ├── types/              # TypeScript type definitions.
│   └── i18n-config.ts      # Configuration for internationalization.
│
├── next.config.ts          # Next.js configuration file.
├── tailwind.config.ts      # Tailwind CSS configuration.
└── README.md               # This file.
```
