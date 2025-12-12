import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL da API - ALTERE para seu IP local se testar em dispositivo físico
// Para descobrir seu IP: rode 'ipconfig' no PowerShell e use o IPv4
const API_URL = 'http://localhost:3000/api';
// const API_URL = 'http://192.168.1.X:3000/api'; // Use seu IP para testar no celular

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@plantae:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      await AsyncStorage.removeItem('@plantae:token');
      await AsyncStorage.removeItem('@plantae:user');
      // Aqui você pode redirecionar para login
    }
    return Promise.reject(error);
  }
);

export default api;