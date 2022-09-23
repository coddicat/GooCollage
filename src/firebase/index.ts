import { getAuth, User } from '@firebase/auth';
import { initializeApp } from 'firebase/app';

import firebaseConfig from './config.dev.json';//'./config.prod.json'

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

export default app;

export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise<User | null>((resolve) => {
    const unsub = auth.onAuthStateChanged((user: User | null) => {
      unsub();
      resolve(user);
    });
  });
}
