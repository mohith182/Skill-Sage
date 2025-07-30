import { getAuth } from "firebase-admin/auth";
import { Request, Response, NextFunction } from "express";
import { initializeApp, cert, getApps } from "firebase-admin/app";

// Check if the service account key is present
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.warn("⚠️  FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase auth will be disabled.");
  // Temporarily disable Firebase requirement for development
  // throw new Error(
  //   "FIREBASE_SERVICE_ACCOUNT_KEY is not set in the environment."
  // );
}

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip authentication if Firebase is not configured
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.warn("⚠️  Firebase auth skipped - no service account configured");
    (req as any).user = { uid: "dev-user", email: "dev@example.com" }; // Mock user for development
    return next();
  }

  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized: No token provided");
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return res.status(403).send("Forbidden: Invalid token");
  }
}; 