import { useState, useEffect, createContext, useContext } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { authAPI } from '../services/api';

// Create a context for authentication
const AuthContext = createContext(null);

// Provider component to wrap your app
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const auth = getAuth();

  // Register with email and password
  const register = async (name, email, password, userData = {}) => {
    try {
      setError('');
      
      // Register with backend first
      const backendResponse = await authAPI.register({
        name,
        email,
        password,
        ...userData
      });
      
      // Store JWT token
      localStorage.setItem('token', backendResponse.data.token);
      
      // Then register with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase profile
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      return userCredential.user;
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      setError('');
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get ID token for backend authentication
      const idToken = await userCredential.user.getIdToken();
      
      // Authenticate with backend
      const backendResponse = await authAPI.login({
        email,
        password
      });
      
      // Store JWT token
      localStorage.setItem('token', backendResponse.data.token);
      
      return userCredential.user;
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('token');
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [auth]);

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth
export const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;