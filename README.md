# Netflix-clone

# Netflix Clone

## Project Description

This project is a Netflix-like streaming service clone, featuring user authentication, movie browsing, and personalized recommendations. It's built with a React frontend and a Node.js/TypeScript backend, leveraging Firebase for authentication and data storage.

## Key Features

*   User Authentication (Sign Up, Log In)
*   Browse Movies and TV Shows
*   Personalized Recommendations
*   Multi-language Support (English, Finnish, Vietnamese)
*   Responsive Design

## Technologies Used

### Frontend
*   React
*   TypeScript
*   React Router DOM
*   i18next (for internationalization)
*   Axios (for API requests)
*   Firebase (for authentication)
*   CSS Modules

### Backend
*   Node.js
*   TypeScript
*   Express.js
*   Firebase Admin SDK (for Firestore and Authentication)
*   TMDB API (for movie data)

### Testing
*   Jest
*   React Testing Library

## Setup and Installation

To set up the project locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/pham-hoang24/Netflix-clone
    cd Netflix-clone
    ```

2.  **Install Frontend Dependencies:**

    ```bash
    npm install
    ```

3.  **Install Backend Dependencies:**

    ```bash
    cd netflix-backend
    npm install
    cd ..
    ```

4.  **Install Firebase Functions Dependencies:**

    ```bash
    cd functions
    npm install
    cd ..
    ```

5.  **Firebase Configuration:**
    *   Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/).
    *   Enable Firestore and Authentication.
    *   Download your Firebase web app configuration and place it in `src/services/firebase.ts`.
    *   For the backend, generate a service account key (JSON file) from your Firebase project settings (Project settings > Service accounts > Generate new private key) and save it as `netflix-backend/src/serviceAccountKey.json`.

## Running the Application

### Start Frontend (React App)

From the project root directory:

```bash
npm start
```

This will start the React development server, usually at `http://localhost:3000`.

### Start Backend (Node.js API)

From the `netflix-backend` directory:

```bash
npm run dev # Or npm start if you have a production build script
```

This will start the Node.js API server, usually at `http://localhost:5000`.

### Deploy Firebase Functions (Optional)

If you have Firebase CLI installed and configured, you can deploy the functions:

```bash
firebase deploy --only functions
```

## Running Tests

From the project root directory:

```bash
npm test
```

This will run all tests using Jest and React Testing Library.

## Project Structure

*   `src/`: Contains the React frontend application.
*   `netflix-backend/`: Contains the Node.js/TypeScript backend API.
*   `functions/`: Contains Firebase Cloud Functions.
*   `public/`: Static assets for the frontend, including internationalization files.
*   `__mocks__/`: Jest mock files.
*   `coverage/`: Test coverage reports.
*   `build/`: Build output directories for frontend and backend.