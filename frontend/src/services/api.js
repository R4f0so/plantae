import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// URL da API em produção (Render)
const PRODUCTION_URL = 'https://plantae-xop0.onrender.com/api';
const LOCAL_URL = 'http://localhost:3000/api';

// Usar produção por padrão, localhost para desenvolvimento web
const getApiUrl = () => {
  // Para desenvolvimento local no web, descomente a linha abaixo:
  // if (Platform.OS === 'web') return LOCAL_URL;
  
  return PRODUCTION_URL;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true', // Necessário para localtunnel
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