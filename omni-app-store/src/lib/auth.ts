import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();

export interface UserProfile {
  userId: string;
  username: string;
  forename: string;
  surname: string;
  organisation: string;
  createdAt: any;
  myAssets: string[];
}

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

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      userId: user.uid,
      username: generateUsername(userData.forename, userData.surname),
      forename: userData.forename,
      surname: userData.surname,
      organisation: userData.organisation || 'Individual',
      createdAt: serverTimestamp(),
      myAssets: []
    };

    await setDoc(doc(db, 'User_Profiles', user.uid), userProfile);
    
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
      const newProfile: UserProfile = {
        userId: user.uid,
        username: generateUsername(
          user.displayName?.split(' ')[0] || 'User',
          user.displayName?.split(' ')[1] || ''
        ),
        forename: user.displayName?.split(' ')[0] || 'User',
        surname: user.displayName?.split(' ')[1] || '',
        organisation: 'Individual',
        createdAt: serverTimestamp(),
        myAssets: []
      };
      
      await setDoc(doc(db, 'User_Profiles', user.uid), newProfile);
      userProfile = newProfile;
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

// Helper function to generate username
const generateUsername = (forename: string, surname: string): string => {
  const base = `${forename.toLowerCase()}${surname.toLowerCase()}`;
  const random = Math.floor(Math.random() * 1000);
  return `${base}${random}`;
};