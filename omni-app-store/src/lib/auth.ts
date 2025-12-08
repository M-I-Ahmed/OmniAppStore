import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { createNewUserProfile } from './userProfileService';
import { UserProfile } from '../types';

const googleProvider = new GoogleAuthProvider();

// Legacy interface for backwards compatibility
export interface LegacyUserProfile {
  userId: string;
  username: string;
  forename: string;
  surname: string;
  organisation: string;
  createdAt: any;
  myAssets: string[];
}

// Export UserProfile type from centralized types
export type { UserProfile };

// Email/Password Registration
export const registerWithEmail = async (
  email: string, 
  password: string, 
  userData: {
    forename: string;
    surname: string;
    organisation?: string;
  }
) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile using the new service
    await createNewUserProfile(
      user.uid,
      email,
      `${userData.forename} ${userData.surname}`,
      user.photoURL || undefined
    );

    // Fetch the created profile
    const userProfile = await getUserProfile(user.uid);
    
    return { user, userProfile };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Email/Password Login
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user profile from Firestore
    const userProfile = await getUserProfile(user.uid);
    
    return { user, userProfile };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user profile exists
    let userProfile = await getUserProfile(user.uid);
    
    // If no profile exists, create one
    if (!userProfile) {
      await createNewUserProfile(
        user.uid,
        user.email || '',
        user.displayName || 'User',
        user.photoURL || undefined
      );
      
      userProfile = await getUserProfile(user.uid);
    }
    
    return { user, userProfile };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'User_Profiles', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};