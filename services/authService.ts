
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { dataService, UserProfile, DEFAULT_USER } from './dataService';

// Concurrency lock to prevent multiple popup requests
let isLoginPending = false;

export const authService = {
  
  // Trigger Google Sign In Popup
  loginWithGoogle: async (): Promise<UserProfile | null> => {
    
    // 1. Prevent overlapping requests
    if (isLoginPending) {
        console.warn("Sign-in already in progress. Ignoring duplicate request.");
        return null;
    }

    // 2. If Firebase is completely missing/not configured
    if (!auth || !db) {
      console.warn("🔥 Firebase Auth or DB not initialized. Entering Demo Mode.");
      dataService.setUser(DEFAULT_USER);
      return DEFAULT_USER;
    }

    isLoginPending = true;

    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to avoid auto-login loops and ensure fresh state
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let userProfile: UserProfile;

      if (userSnap.exists()) {
        // Load existing profile
        console.log("Found existing user profile.");
        userProfile = userSnap.data() as UserProfile;
        // Ensure local data service matches remote
        dataService.setUser(userProfile);
      } else {
        // Create new profile for first-time login
        console.log("Creating new user profile.");
        userProfile = {
          id: user.uid,
          name: user.displayName || "Anonymous Wizard",
          handle: `@${user.email?.split('@')[0] || 'user'}_${Math.floor(Math.random() * 1000)}`,
          avatar: user.photoURL || "https://picsum.photos/seed/new/200/200",
          isInfluencer: false,
          walletBalance: 100, // Welcome Bonus
          usdBalance: 0,
          cryptoBalance: 0
        };

        // Save to Firestore
        await setDoc(userRef, {
          ...userProfile,
          email: user.email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
        
        dataService.setUser(userProfile);
      }

      return userProfile;

    } catch (error: any) {
      // --- ROBUST ERROR HANDLING ---
      
      const errorCode = error.code;
      const errorMessage = error.message;

      // 1. Popup Closed / Cancelled / Overlapping Request
      // 'auth/cancelled-popup-request' happens if another popup is opened or if explicit cancellation occurs.
      if (
          errorCode === 'auth/popup-closed-by-user' || 
          errorCode === 'auth/cancelled-popup-request'
      ) {
        console.log("Login flow cancelled by user or concurrent request.");
        return null;
      }

      // 2. Popup Blocked - Browser intervention
      if (errorCode === 'auth/popup-blocked') {
        alert("Sign-in popup was blocked by your browser. Please allow popups for this site or try clicking 'Sign In' again.");
        return null;
      }

      // 3. Unauthorized Domain (Preview Envs)
      if (
        errorCode === 'auth/unauthorized-domain' || 
        errorMessage?.includes('unauthorized-domain')
      ) {
        const currentDomain = window.location.hostname;
        console.warn(`[Auth] Domain ${currentDomain} is not authorized in Firebase. Falling back to Demo Mode.`);
        dataService.setUser(DEFAULT_USER);
        return DEFAULT_USER;
      } 
      
      // 4. Internal Assertion Failed (Race conditions inside SDK)
      if (errorMessage?.includes('INTERNAL ASSERTION FAILED')) {
         console.warn("Firebase Internal Assertion Failed. This is usually due to a race condition. Retrying might fix it.");
         return null;
      }
      
      console.error("Google Sign In Error:", error);
      alert("Sign In Error: " + (errorMessage || "Unknown error"));
      return null;
    } finally {
        // Always release the lock
        isLoginPending = false;
    }
  },

  logout: async () => {
    if (!auth) {
        dataService.logout();
        return;
    }
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out error", e);
    }
    dataService.logout();
  }
};
