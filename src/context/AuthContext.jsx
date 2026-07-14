import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Detect if we are using the placeholder configuration
  useEffect(() => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCkicaroQdvN2myzgXP0Plrm8LltxlkR7Q";
    const isMock = apiKey === 'mock-api-key-placeholder-pe26118';
    setIsDemoMode(isMock);
    
    if (isMock) {
      console.warn("Tecno Mundo: Ejecutando en Modo Demo (sin Firebase Real). Las credenciales locales funcionarán.");
      // Load user from localStorage if saved
      const savedUser = localStorage.getItem('demo_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      setLoading(false);
      return;
    }

    if (!auth) {
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password) => {
    if (isDemoMode) {
      const demoUser = { email, uid: 'demo-uid-' + Date.now(), isDemo: true };
      setCurrentUser(demoUser);
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      return demoUser;
    }
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email, password) => {
    if (isDemoMode) {
      if (email === 'tecnoadmin@tecnomundo.com.ar' && password !== 'Admin1234!*') {
        throw new Error("Contraseña incorrecta para el usuario administrador.");
      }
      if (password.length >= 6) {
        const demoUser = { email, uid: 'demo-uid-12345', isDemo: true };
        setCurrentUser(demoUser);
        localStorage.setItem('demo_user', JSON.stringify(demoUser));
        return demoUser;
      } else {
        throw new Error("La contraseña debe tener al menos 6 caracteres (Modo Demo).");
      }
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (isDemoMode) {
      setCurrentUser(null);
      localStorage.removeItem('demo_user');
      return;
    }
    return signOut(auth);
  };

  const value = {
    currentUser,
    loading,
    isDemoMode,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
