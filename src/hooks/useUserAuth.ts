import { useContext } from 'react';
import { UserAuthContext } from '../contexts/UserAuthContext';

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};

