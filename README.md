# TeeReserve Golf - Premium Golf Booking Platform

Welcome to TeeReserve Golf, a modern, full-stack web application designed for booking tee times at premium golf courses. This platform is built with Next.js, Firebase, and Google's Genkit for AI-powered features, providing a seamless experience for both golfers and administrators.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage)
- **AI Features**: [Genkit](https://firebase.google.com/docs/genkit) (for AI flows like recommendations)
- **Deployment**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Firebase CLI](https://firebase.google.com/docs/cli#install-cli-mac-linux-windows)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Create a copy of the example environment file.
        ```bash
        cp .env.example .env
        ```
    -   Open the `.env` file and add your Google Maps API key. See the "Environment Variables" section below for more details.

### Running the Development Server

To start the application in development mode, run:

```bash
npm run dev
```

This will start the Next.js development server, typically on `http://localhost:3000`.

To run the Genkit flows locally for AI development, use:

```bash
npm run genkit:watch
```

## Environment Variables

To run this project, you need to create a `.env` file in the root of your project. You can use the `.env.example` file as a template.

-   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps JavaScript API key. This is required for displaying maps on the course detail pages. You can get a key from the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis). Make sure to enable the "Maps JavaScript API".

**Note**: The Firebase configuration is located in `src/lib/firebase.ts` and is pre-configured. You do not need to add it to the `.env` file.

## Deployment

This application is configured for easy deployment with **Firebase App Hosting**.

1.  **Log in to Firebase:**
    ```bash
    firebase login
    ```

2.  **Initialize Firebase in your project (if you haven't already):**
    ```bash
    firebase init hosting
    ```
    -   When prompted, select "Use an existing project" and choose your Firebase project.
    -   Select "App Hosting" as the hosting type.

3.  **Deploy the application:**
    ```bash
    firebase deploy
    ```

This command will build your Next.js application and deploy it to Firebase App Hosting. The command will output the URL of your live site.

## Available Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Creates a production build of the application.
-   `npm run start`: Starts a production server (requires a build first).
-   `npm run lint`: Lints the code for potential errors.
-   `npm run genkit:dev`: Starts the Genkit development server.
-   `npm run genkit:watch`: Starts the Genkit development server in watch mode.

## Project Structure

-   `src/app`: Contains the main application pages, following the Next.js App Router structure.
-   `src/components`: Reusable React components.
-   `src/lib`: Core logic, utilities, and Firebase/data handling.
-   `src/ai`: Genkit AI flows and configuration.
-   `src/context`: React context providers (e.g., AuthContext).
-   `public`: Static assets like images and fonts.
