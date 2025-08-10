import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged 
} from 'firebase/auth';

export const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const context = useContext(FirebaseContext);

  useEffect(() => {
    if (!context || !context.auth) return;

    const unsubscribe = onAuthStateChanged(context.auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [context]);

  if (!context) {
    throw new Error('FirebaseProvider must be used within a FirebaseContext.Provider');
  }

  const { auth, db } = context;

  const signInWithEmailAndPassword = async (email, password) => {
    const userCredential = await fbSignInWithEmailAndPassword(auth, email, password);
    setUser(userCredential.user);
    return userCredential;
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setUser(null);
  };

  const value = {
    ...context,
    user,
    loading,
    signInWithEmailAndPassword,
    signOut,
    isAuthenticated: !!user
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
