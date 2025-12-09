import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('@user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // For demo - check against stored users
      const users = await AsyncStorage.getItem('@users');
      const userList = users ? JSON.parse(users) : [];
      
      const foundUser = userList.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData = { 
          id: foundUser.id, 
          email: foundUser.email, 
          name: foundUser.name 
        };
        await saveUser(userData);
        return { success: true };
      }
      
      return { success: false, message: 'Invalid email or password' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      // Check if user already exists
      const users = await AsyncStorage.getItem('@users');
      const userList = users ? JSON.parse(users) : [];
      
      if (userList.some((u: any) => u.email === email)) {
        return { success: false, message: 'Email already registered' };
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        password, // Note: In production, use proper hashing
        name,
        createdAt: new Date().toISOString(),
      };
      
      // Save to users list
      userList.push(newUser);
      await AsyncStorage.setItem('@users', JSON.stringify(userList));
      
      // Auto-login after signup
      const userData = { 
        id: newUser.id, 
        email: newUser.email, 
        name: newUser.name 
      };
      await saveUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'An error occurred during signup' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    await saveUser(updatedUser);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        signup, 
        logout,
        updateUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};