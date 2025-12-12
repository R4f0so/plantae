import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storedUser = await AsyncStorage.getItem('@plantae:user');
      const storedToken = await AsyncStorage.getItem('@plantae:token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do storage:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    try {
      const response = await api.post('/auth/login', { email, senha: password });
      
      const { user: userData, accessToken } = response.data;

      await AsyncStorage.setItem('@plantae:user', JSON.stringify(userData));
      await AsyncStorage.setItem('@plantae:token', accessToken);

      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Erro ao fazer login' 
      };
    }
  }

  async function signUp(nome, email, password, tipo = 'comum') {
    try {
      const response = await api.post('/auth/register', {
        nome,
        email,
        senha: password,
        tipo,
      });

      const { user: userData, accessToken } = response.data;

      await AsyncStorage.setItem('@plantae:user', JSON.stringify(userData));
      await AsyncStorage.setItem('@plantae:token', accessToken);

      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Erro ao criar conta' 
      };
    }
  }

  async function signOut() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      await AsyncStorage.removeItem('@plantae:user');
      await AsyncStorage.removeItem('@plantae:token');
      setUser(null);
    }
  }

  async function updateUser(userData) {
    try {
      await AsyncStorage.setItem('@plantae:user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}