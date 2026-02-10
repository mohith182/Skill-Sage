import { getAuth } from "firebase-admin/auth";
import { Request, Response, NextFunction } from "express";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { storage } from "./storage";
import { UserRole, type UserRoleType } from "@shared/schema";

// Check if the service account key is present
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.warn("⚠️  FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase auth will be disabled.");
}

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// Extend Request type to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        role?: UserRoleType;
      };
    }
  }
}

// Basic authentication middleware
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip authentication if Firebase is not configured
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.warn("⚠️  Firebase auth skipped - no service account configured");
    req.user = { uid: "dev-user", email: "dev@example.com", role: "admin" }; // Mock admin for development
    return next();
  }

  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized: No token provided");
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Get user role from database
    const user = await storage.getUser(decodedToken.uid);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      role: user?.role as UserRoleType || "user",
    };
    
    next();
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return res.status(403).send("Forbidden: Invalid token");
  }
};

// Role-based authorization middleware
export const requireRole = (...allowedRoles: UserRoleType[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // First authenticate
    await authenticateUser(req, res, async () => {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userRole = req.user.role || "user";
      
      if (!allowedRoles.includes(userRole as UserRoleType)) {
        return res.status(403).json({ 
          message: "Forbidden: Insufficient permissions",
          required: allowedRoles,
          current: userRole
        });
      }

      next();
    });
  };
};

// Admin-only middleware
export const requireAdmin = requireRole(UserRole.ADMIN);

// Middleware to check if user is admin or owner of resource
export const requireAdminOrOwner = (getUserIdFromRequest: (req: Request) => string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await authenticateUser(req, res, async () => {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const resourceUserId = getUserIdFromRequest(req);
      const isAdmin = req.user.role === UserRole.ADMIN;
      const isOwner = req.user.uid === resourceUserId;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ 
          message: "Forbidden: You can only access your own resources"
        });
      }

      next();
    });
  };
};

// Helper to check role
export const isAdmin = (user: { role?: string }): boolean => {
  return user.role === UserRole.ADMIN;
};

export const isUser = (user: { role?: string }): boolean => {
  return user.role === UserRole.USER || user.role === UserRole.STUDENT;
}; 