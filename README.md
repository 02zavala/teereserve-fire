# TeeReserve Golf - Premium Golf Booking Platform (Enterprise Vision)

TeeReserve Golf is evolving from a premium booking application into a scalable, secure, and robust multi-tenant SaaS platform for enterprise-level golf course management in Los Cabos, Mexico, and beyond. This document outlines the architectural vision and strategic plan for this transformation.

## Core Pillars of the Enterprise Solution

1.  **Multi-Tenant Architecture:** Support multiple golf courses, each with its own subdomain, branding, and custom configurations.
2.  **Enterprise-Grade Security:** Achieve PCI DSS Level 1 compliance with advanced fraud detection and robust security protocols.
3.  **Superior User Experience:** Deliver a high-performance Progressive Web App (PWA) with offline capabilities and real-time features.
4.  **Data-Driven Operations:** Provide a comprehensive analytics dashboard for real-time business intelligence.
5.  **Extensibility and Integration:** Offer public APIs for seamless integration with external systems.
6.  **AI & Automation:** Leverage artificial intelligence for dynamic pricing, demand forecasting, and personalized marketing.

---

## 1. System Architecture (Multi-Tenant)

The platform is built on a multi-tenant architecture where each golf course (a "tenant") operates within a shared infrastructure but with data and branding isolation.

**Data Structuring (Firestore):**

The Firestore database is structured around a `tenantId` (which is the `courseId`) to ensure strict data segregation.

```
/courses/{courseId}  // Represents a Tenant
  - name: "Palmilla Golf Club"
  - subdomain: "palmilla"
  - branding: { primaryColor: "#...", logoUrl: "..." }
  - settings: { operatingHours: [...], bookingPolicy: "...", currency: "usd" }
  - (other course-specific data...)

  // Subcollections for tenant-specific data
  /courses/{courseId}/teeTimes/{date_time}
  /courses/{courseId}/bookings/{bookingId}
  /courses/{courseId}/reviews/{reviewId}

/users/{userId}
  - email: "user@example.com"
  - displayName: "John Doe"
  - roles: {
      "{courseId}": "Admin",        // User is an Admin for a specific course
      "{anotherCourseId}": "Staff"
    }
```

**Subdomain Handling (Next.js Middleware):**

The Next.js middleware (`src/middleware.ts`) is responsible for identifying the tenant based on the request's hostname (e.g., `palmilla.teereserve.golf`). It extracts the subdomain, maps it to a `courseId`, and rewrites the request internally. This allows the application to dynamically load the correct branding, settings, and data for the active tenant.

---

## 2. Security Strategy

Security is paramount. The platform is designed to meet PCI DSS Level 1 standards and protect against modern threats.

-   **PCI DSS Compliance:**
    -   **Payment Processing:** All payment processing is delegated to **Stripe**, which is PCI DSS Level 1 certified. Sensitive cardholder data is sent directly to Stripe's servers via tokenization (using Stripe Elements) and never touches our application servers.
    -   **3D Secure:** Stripe Payments is configured to automatically trigger 3D Secure for transactions that meet certain risk criteria, adding a crucial layer of authentication.
    -   **TLS 1.3:** All traffic is enforced to use TLS 1.3 through Firebase Hosting and Cloudflare configurations.

-   **AI-Powered Fraud Detection:**
    -   A **Genkit Flow** will be created to analyze booking attempts before payment. This flow will score the transaction's risk based on factors like: amount, location mismatch (IP vs. billing), user history, and time of day.
    -   Based on the risk score, the system will automatically:
        1.  **Approve:** Low-risk transactions proceed directly.
        2.  **Challenge:** Medium-risk transactions are forced to complete 3D Secure.
        3.  **Manual Review:** High-risk transactions are flagged for admin review.
        4.  **Block:** Extremely high-risk attempts are blocked.

-   **Infrastructure Security:**
    -   **Firebase Security Rules:** Firestore access is rigorously controlled with rules that enforce tenant data isolation (e.g., a user can only access data related to their `courseId`).
    -   **Firebase App Check:** Ensures that requests to our backend originate from our legitimate app, preventing abuse.
    -   **Cloudflare WAF & DDoS Protection:** Firebase Hosting's integration with Cloudflare provides an enterprise-grade Web Application Firewall and robust protection against DDoS attacks.

---

## 3. Technology Stack

The solution leverages a modern, serverless, and highly scalable tech stack.

-   **Frontend:** **Next.js 15 (App Router)** with React, Tailwind CSS, and ShadCN UI.
-   **Backend & AI:** **Google Genkit** for orchestrating AI flows and server-side logic, running on serverless infrastructure.
-   **Database:** **Firebase Firestore** for scalable, real-time NoSQL data storage.
-   **Authentication:** **Firebase Authentication** with support for email/password, OAuth, and role-based access control (RBAC).
-   **File Storage:** **Firebase Storage** for course images and user-uploaded content.
-   **Payments:** **Stripe** for secure, PCI-compliant payment processing.
-   **Hosting & CDN:** **Firebase Hosting** for global, low-latency content delivery, automatically configured with a CDN and SSL.

---

## 4. Progressive Web App (PWA) & Offline Support

The application is a fully-featured PWA to provide a native-app-like experience.

-   **Service Workers:** A service worker (`next-pwa`) caches critical application assets (shell, static data) to enable offline browsing of course information and previously viewed data.
-   **Offline Data Sync:** Key user data, like their own bookings, are stored locally using IndexedDB. When the user is offline, they can still view their upcoming reservations. Any actions made offline (like drafting a review) are queued and synced automatically when connectivity is restored.
-   **Push Notifications:** Firebase Cloud Messaging (FCM) is used to send push notifications for booking confirmations, reminders, and special offers.

---

## 5. Analytics Dashboard

The admin panel features a real-time analytics dashboard with advanced visualizations.

-   **Real-Time Metrics:**
    -   **Revenue:** Aggregated in real-time using Firebase Extensions that sync data to a dedicated analytics store (like BigQuery).
    -   **Occupancy Rate:** Calculated via scheduled functions that analyze `teeTimes` status.
    -   **Net Promoter Score (NPS):** Collected via post-booking surveys.
-   **Visualizations:**
    -   **Charts & Graphs:** Using `shadcn/charts` and Recharts to display trends in revenue, bookings, and user growth.
    -   **Heatmaps:** A visual representation of tee time popularity by day and hour.

---

## 6. Public APIs & Integrations

-   **RESTful API:**
    -   Firebase Functions are used to expose RESTful endpoints for public consumption (e.g., `GET /api/courses/{courseId}/availability`).
    -   **Authentication:** Access is managed via secure, tenant-specific API keys.
    -   **Documentation:** An OpenAPI (Swagger) specification is auto-generated and hosted for developers.
-   **Webhooks:** The system can send webhook notifications to external services on events like `booking.confirmed`.
-   **External Integrations:**
    -   **Google Calendar:** Users can one-click add their booking to their Google Calendar.
    -   **WhatsApp Business:** Automated booking confirmations and reminders are sent via the WhatsApp API.
    -   **Stripe Radar:** Integrated for advanced, pre-built fraud detection rules.

---

## 7. Installation and Deployment

### Step 1: Local Setup

1.  **Download the Code:** If you haven't already, download the project code as a ZIP file and unzip it on your computer.
2.  **Prerequisites:** Make sure you have [Node.js](https://nodejs.org/) (version 18 or higher) and the [Firebase CLI](https://firebase.google.com/docs/cli) installed.
3.  **Install Dependencies:** Open your terminal in the project's root folder and run:
    ```bash
    npm install
    ```
4.  **Environment Variables:** Create a `.env.local` file by copying the `.env.example` file. Populate it with your Firebase project configuration and API keys (Stripe, Google Maps, etc.).
5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

### Step 2: Upload to GitHub

1.  **Create a Repository:** Go to [GitHub](https://github.com/new) and create a new, empty repository. Do **not** initialize it with a README or .gitignore file.
2.  **Initialize Git:** In your project's root folder in the terminal, run:
    ```bash
    git init -b main
    git add .
    git commit -m "Initial commit"
    ```
3.  **Connect to GitHub:** Copy the commands from your new GitHub repository page (under "...or push an existing repository from the command line") and run them. They will look like this:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
    git push -u origin main
    ```

### Step 3: Deploy to Firebase Hosting

Deployment is fully automated via Firebase Hosting.

1.  **Connect to Firebase:** If you haven't already, log in to Firebase from your terminal:
    ```bash
    firebase login
    ```
    Then, connect your local project to your Firebase project:
    ```bash
    firebase use <your-project-id>
    ```
2.  **Build Project:** Create a production-ready build of your Next.js app:
    ```bash
    npm run build
    ```
3.  **Deploy:** Deploy your application to Firebase Hosting with one command:
    ```bash
    firebase deploy --only hosting
    ```

Firebase will automatically handle provisioning the serverless infrastructure, CDN configuration, and SSL certificate. After a few moments, it will give you the live URL for your application!

---

## 8. Support and Monitoring Strategy

-   **24/7 Monitoring:**
    -   **Google Cloud Operations (formerly Stackdriver):** Provides comprehensive logging, monitoring, and alerting for all Firebase services.
    -   **Alerts:** Automated alerts are configured for critical events, such as error spikes, high latency, or security rule denials.
-   **User Support:**
    -   Integrated help desk functionality.
    -   Real-time chat support via WhatsApp Business API.
-   **Uptime & Status:** A public status page will report on the health of all system components.
