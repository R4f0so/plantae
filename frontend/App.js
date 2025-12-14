import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import HortaDetailScreen from './src/screens/HortaDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import GerenciadorScreen from './src/screens/GerenciadorScreen';
import EditarHorariosScreen from './src/screens/EditarHorariosScreen';
import EditarStatusScreen from './src/screens/EditarStatusScreen';
import EditarHortaScreen from './src/screens/EditarHortaScreen';
import GerenciarProdutosScreen from './src/screens/GerenciarProdutosScreen';
import AdminScreen from './src/screens/AdminScreen';
import AdminUsuariosScreen from './src/screens/AdminUsuariosScreen';
import AdminHortasScreen from './src/screens/AdminHortasScreen';

const Stack = createStackNavigator();

function Routes() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      {!signed ? (
        // Rotas de Autenticação
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // Rotas Autenticadas
        <>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Map" 
            component={MapScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="HortaDetail" 
            component={HortaDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Gerenciador" 
            component={GerenciadorScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="EditarHorarios" 
            component={EditarHorariosScreen}
            options={{ 
              headerShown: true,
              title: 'Horários de Funcionamento',
              headerStyle: { backgroundColor: '#2d6a4f' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen 
            name="EditarStatus" 
            component={EditarStatusScreen}
            options={{ 
              headerShown: true,
              title: 'Status Temporário',
              headerStyle: { backgroundColor: '#2d6a4f' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen 
            name="EditarHorta" 
            component={EditarHortaScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="GerenciarProdutos" 
            component={GerenciarProdutosScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Admin" 
            component={AdminScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AdminUsuarios" 
            component={AdminUsuariosScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AdminHortas" 
            component={AdminHortasScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
    </AuthProvider>
  );
}