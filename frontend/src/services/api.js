import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Detecta automaticamente a URL correta
const getApiUrl = () => {
  // Web: usa localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  }
  
  // Mobile: usa localtunnel (URL pública temporária)
  // IMPORTANTE: Esta URL muda cada vez que você reinicia o localtunnel
  // Você pode ver a URL atual no terminal onde rodou: npx localtunnel --port 3000
  return 'https://ripe-geese-serve.loca.lt/api';
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