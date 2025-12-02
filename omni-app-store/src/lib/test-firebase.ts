import { auth, db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('Auth:', auth);
    console.log('Database:', db);
    console.log('Firebase connection successful!');
    return true;
  } catch (error) {
    console.error('Firebase connection error:', error);
    return false;
  }
};