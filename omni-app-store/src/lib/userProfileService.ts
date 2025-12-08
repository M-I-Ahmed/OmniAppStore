// src/lib/userProfileService.ts - User profile management service

import { db } from './firebase';
import { doc, setDoc, updateDoc, increment, serverTimestamp, Timestamp, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

const USER_PROFILES_COLLECTION = 'User_Profiles';

/**
 * Creates a new user profile with default values for all new fields.
 * This should be called when a new user signs up.
 * @param uid The user's unique ID.
 * @param email The user's email.
 * @param displayName The user's display name.
 * @param photoURL Optional photo URL.
 */
export async function createNewUserProfile(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string
): Promise<void> {
  const newUserProfile: UserProfile = {
    uid,
    email,
    displayName,
    photoURL,
    myApps: [],
    myAssets: [],
    eventLog: [],
    createdAt: Timestamp.now(),
    
    // Default values for new fields
    isDeveloper: false,
    developerStatus: null,
    publishedApps: [],
    totalSpending: 0,
    totalEarnings: 0,
    preferences: {
      defaultView: 'consumer',
      notifications: {
        appUpdates: true,
        newReviews: true,
        payouts: true,
        assetAlerts: true
      }
    }
  };

  const userRef = doc(db, USER_PROFILES_COLLECTION, uid);
  await setDoc(userRef, newUserProfile);
}

/**
 * becomeDeveloper(userId) - Initializes developer fields for an existing user.
 * This function updates an existing user's profile to mark them as a pending developer.
 * It also initializes `developerStatus` and `publishedApps` if they don't exist.
 * Ideally, this would be triggered from a Cloud Function after a user applies.
 */
export async function becomeDeveloper(userId: string): Promise<void> {
  try {
    console.log('becomeDeveloper: Starting for user:', userId);
    const userRef = doc(db, USER_PROFILES_COLLECTION, userId);
    
    // First, check if the document exists
    const userDoc = await getDoc(userRef);
    console.log('becomeDeveloper: Document exists?', userDoc.exists());
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found. Please refresh the page and try again.');
    }

    const userData = userDoc.data();
    console.log('becomeDeveloper: Current user data:', userData);
    
    // Check if already a developer
    if (userData?.isDeveloper === true) {
      console.log('becomeDeveloper: User is already a developer');
      throw new Error('You have already applied to become a developer.');
    }
    
    const currentEventLog = userData?.eventLog || [];

    // Create new event entry
    const newEvent = {
      type: 'developer_application',
      description: 'User applied to become a developer',
      timestamp: Timestamp.now(),
    };

    // Prepare update data
    const updateData: any = {
      uid: userId, // Must include uid to satisfy Firestore rule
      isDeveloper: true,
      developerStatus: 'pending',
      publishedApps: [],
      eventLog: [...currentEventLog, newEvent],
    };

    console.log('becomeDeveloper: Attempting update with data:', updateData);

    // Update with new fields
    await updateDoc(userRef, updateData);

    console.log('becomeDeveloper: Update successful for user:', userId);
  } catch (error: any) {
    console.error('becomeDeveloper: Error details:', {
      message: error.message,
      code: error.code,
      details: error
    });
    throw error;
  }
}

/**
 * updateDeveloperProfile(userId, profileData) - Updates specific developer profile information.
 * This function allows a user to update their `developerProfile` details.
 * Note: Sensitive fields like `verifiedDate`, `taxInfo`, `payoutDetails` should ideally
 * only be updated via secure server-side logic (e.g., Cloud Functions) after proper verification.
 */
export async function updateDeveloperProfile(
  userId: string,
  profileData: Partial<UserProfile['developerProfile']>
): Promise<void> {
  const userRef = doc(db, USER_PROFILES_COLLECTION, userId);
  const userDoc = await getDoc(userRef);
  const currentEventLog = userDoc.data()?.eventLog || [];

  await updateDoc(userRef, {
    developerProfile: profileData,
    eventLog: [
      ...currentEventLog,
      {
        type: 'developer_profile_update',
        description: 'Developer profile updated',
        timestamp: serverTimestamp() as Timestamp,
      }
    ],
  });
}

/**
 * trackSpending(userId, amount) - Increments the totalSpending for a user.
 * IMPORTANT: This function should almost always be called from a secure
 * Firebase Cloud Function after a successful transaction, NOT directly from the client.
 */
export async function trackSpending(userId: string, amount: number): Promise<void> {
  if (amount <= 0) {
    console.warn('Spending amount must be positive.');
    return;
  }
  const userRef = doc(db, USER_PROFILES_COLLECTION, userId);
  const userDoc = await getDoc(userRef);
  const currentEventLog = userDoc.data()?.eventLog || [];

  await updateDoc(userRef, {
    totalSpending: increment(amount),
    eventLog: [
      ...currentEventLog,
      {
        type: 'purchase',
        description: `Spent $${amount}`,
        details: `Amount: $${amount}`,
        timestamp: serverTimestamp() as Timestamp,
      }
    ],
  });
}

/**
 * trackEarnings(userId, amount) - Increments the totalEarnings for a user.
 * IMPORTANT: Like `trackSpending`, this must be called from a secure Firebase Cloud Function,
 * e.g., after a payout is processed for a developer.
 */
export async function trackEarnings(userId: string, amount: number): Promise<void> {
  if (amount <= 0) {
    console.warn('Earnings amount must be positive.');
    return;
  }
  const userRef = doc(db, USER_PROFILES_COLLECTION, userId);
  const userDoc = await getDoc(userRef);
  const currentEventLog = userDoc.data()?.eventLog || [];

  await updateDoc(userRef, {
    totalEarnings: increment(amount),
    eventLog: [
      ...currentEventLog,
      {
        type: 'earnings',
        description: `Earned $${amount}`,
        details: `Amount: $${amount}`,
        timestamp: serverTimestamp() as Timestamp,
      }
    ],
  });
}

/**
 * updatePreferences(userId, preferences) - Updates user preferences.
 * This can generally be called from the client, as preferences are user-specific
 * and not typically sensitive in the same way financial data is.
 */
export async function updatePreferences(
  userId: string,
  preferences: Partial<UserProfile['preferences']>
): Promise<void> {
  const userRef = doc(db, USER_PROFILES_COLLECTION, userId);
  const userDoc = await getDoc(userRef);
  const currentEventLog = userDoc.data()?.eventLog || [];

  await updateDoc(userRef, {
    preferences: preferences,
    eventLog: [
      ...currentEventLog,
      {
        type: 'preferences_update',
        description: 'User preferences updated',
        timestamp: serverTimestamp() as Timestamp,
      }
    ],
  });
}
