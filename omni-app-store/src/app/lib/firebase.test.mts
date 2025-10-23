import { db } from './firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting Firebase connection test...');
console.log('Current directory:', __dirname);

interface FirebaseError {
  message?: string;
  stack?: string;
  code?: string;
}

const testFirebaseConnection = async () => {
  try {
    console.log('Attempting to connect to Firestore...');
    const appsCollection = collection(db, 'Apps');
    console.log('Collection reference created');

    const querySnapshot = await getDocs(appsCollection);
    console.log('Query executed successfully');
    console.log('Documents found:', querySnapshot.size);

    querySnapshot.forEach((doc) => {
      console.log('-------------------');
      console.log('Document ID:', doc.id);
      console.log('Document data:', JSON.stringify(doc.data(), null, 2));
    });
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError;
    console.error('Firebase connection test failed');
    console.error('Error type:', typeof error);
    console.error('Error message:', firebaseError.message || 'Unknown error');
    console.error('Error stack:', firebaseError.stack || 'No stack trace available');
    process.exit(1);
  }
};

// Run the test
(async () => {
  try {
    await testFirebaseConnection();
    console.log('Test completed successfully');
    process.exit(0);
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError;
    console.error('Unhandled error in test execution:', firebaseError.message || 'Unknown error');
    process.exit(1);
  }
})();