# Deployment Guide for WIZUP

This application is ready for deployment to **Firebase Hosting**.

## Prerequisites

1.  **Firebase CLI**: Ensure you have the Firebase tools installed globally.
    ```bash
    npm install -g firebase-tools
    ```
2.  **Login**: Log in to your Google account.
    ```bash
    firebase login
    ```

## Step 1: Initialize (Already Done)

The project is already configured with `firebase.json` and `.firebaserc` pointing to your project ID (`gen-lang-client-0118565128`).

## Step 2: Build the Application

Since this project is using a modern React stack, you typically need to build it before deployment.

1.  Run the build command:
    ```bash
    npm run build
    ```
    *(If you are using a specific bundler like Vite, this creates a `dist` folder. If you are using the no-build setup provided in this preview environment, you can skip this step, but standard deployment usually requires bundling).*

    **Note for Preview Environment:**
    The `firebase.json` is currently configured to serve the root directory (`.`) because this preview environment uses native ES modules (`importmap` in `index.html`) and does not produce a `dist` folder by default.

## Step 3: Deploy to Firebase

To deploy the frontend to the live web:

```bash
firebase deploy --only hosting
```

To deploy the Cloud Functions (for the Instagram Verification backend):

```bash
firebase deploy --only functions
```

## Step 4: Verification

After deployment, Firebase will provide a `Hosting URL`.
1.  Open that URL.
2.  **Important:** Copy that URL and add it to your **Firebase Console -> Authentication -> Authorized Domains** list to ensure Google Sign-In works on the production site.

## Troubleshooting

-   **Auth Error**: If you see `auth/unauthorized-domain`, you missed Step 4.
-   **Missing Functions**: If "Hybrid Sync" fails, ensure you deployed functions and set the environment variables:
    ```bash
    firebase functions:config:set wizup.ig_oembed_token="YOUR_TOKEN"
    firebase functions:config:set wizup.ig_session_cookie="YOUR_COOKIE"
    firebase deploy --only functions
    ```
