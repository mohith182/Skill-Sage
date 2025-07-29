import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, getRedirectResult, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Debug: Log config to help with troubleshooting
console.log("Firebase Config:", {
  hasApiKey: !!firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  hasAppId: !!firebaseConfig.appId,
  currentURL: window.location.href
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('email');
provider.addScope('profile');

// Try popup first, fallback to redirect if needed
export async function login() {
  try {
    console.log("Attempting popup login...");
    const result = await signInWithPopup(auth, provider);
    console.log("Popup login successful:", result.user.uid);
    return result;
  } catch (error: any) {
    console.log("Popup failed, trying redirect:", error.code);
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      console.log("Using redirect method instead...");
      return signInWithRedirect(auth, provider);
    }
    throw error;
  }
}

export function logout() {
  return signOut(auth);
}

export function handleRedirect() {
  return getRedirectResult(auth);
}
