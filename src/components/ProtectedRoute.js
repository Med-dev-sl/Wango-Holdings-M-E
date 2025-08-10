import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFirebase } from '../firebase/context';

const ProtectedRoute = ({ children }) => {
  const { auth } = useFirebase();
  
  if (!auth.currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
