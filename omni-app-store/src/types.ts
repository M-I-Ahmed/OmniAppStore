// src/types.ts - Centralized Firestore type definitions

import { Timestamp } from 'firebase/firestore';

export type DeveloperStatus = 'pending' | 'verified' | 'suspended' | null;
export type DefaultView = 'consumer' | 'developer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  myApps: string[];        // Array of connected app IDs
  myAssets: string[];      // Array of owned asset IDs
  eventLog: Array<{
    type: string;
    description: string;
    details?: string;
    timestamp: Timestamp;
  }>;
  createdAt: Timestamp;

  // Legacy fields for backward compatibility
  userId?: string;         // Same as uid
  username?: string;       // Generated username
  forename?: string;       // First name
  surname?: string;        // Last name
  organisation?: string;   // Organization name

  // New fields for all users
  isDeveloper?: boolean;                    // Default: false
  developerStatus?: DeveloperStatus;        // Default: null
  publishedApps?: string[];                 // Default: [] (empty array)
  totalSpending?: number;                   // Default: 0
  totalEarnings?: number;                   // Default: 0

  // Developer Profile (Optional - only exists if isDeveloper = true)
  developerProfile?: {
    companyName?: string;
    bio?: string;
    website?: string;
    verifiedDate?: Timestamp; // Optional as it might not be set until verified
    taxInfo?: {
      taxId: string;
      country: string;
    };
    payoutDetails?: {
      method: 'stripe' | 'paypal';
      accountId: string;
    };
  };

  // User Preferences
  preferences?: {
    defaultView?: DefaultView; // Default: 'consumer'
    notifications?: {
      appUpdates?: boolean;                 // Default: true
      newReviews?: boolean;                 // Default: true
      payouts?: boolean;                    // Default: true
      assetAlerts?: boolean;                // Default: true
    };
  };
}
