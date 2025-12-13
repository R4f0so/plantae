import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../services/api';

export default function MapScreen({ navigation }) {
  const [hortas, setHortas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    // Centro de Osasco
    latitude: -23.5329,
    longitude: -46.7918,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    loadHortas();
    getUserLocation();
  }, []);

  async function getUserLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Permita o acesso à localização para ver hortas próximas'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.error('Erro ao obter localização:', error);
    }
  }

  async function loadHortas() {
    try {
      const response = await api.get('/hortas');
      setHortas(response.data.hortas);
    } catch (error) {
      console.error('Erro ao carregar hortas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as hortas');
    } finally {
      setLoading(false);
    }
  }

  function handleMarkerPress(horta) {
    Alert.alert(
      horta.nome,
      `${horta.endereco}\n\n${horta.horario_funcionamento || 'Horário não informado'}`,
      [
        {
          text: 'Ver Detalhes',
          onPress: () => navigation.navigate('HortaDetail', { hortaId: horta.id }),
        },
        { text: 'Fechar', style: 'cancel' },
      ]
    );
  }

  function handleCenterOnUser() {
    if (userLocation) {
      setRegion({
        ...userLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } else {
      Alert.alert('Localização não disponível', 'Permita o acesso à sua localização');
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2d6a4f" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        provider={PROVIDER_GOOGLE}
      >
        {/* Pins das Hortas */}
        {hortas.map((horta) => (
          <Marker
            key={horta.id}
            coordinate={{
              latitude: parseFloat(horta.latitude),
              longitude: parseFloat(horta.longitude),
            }}
            title={horta.nome}
            description={horta.endereco}
            onPress={() => handleMarkerPress(horta)}
            pinColor="#2d6a4f"
          />
        ))}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Mapa de Hortas</Text>
        <Text style={styles.headerSubtitle}>{hortas.length} hortas em Osasco</Text>
      </View>

      {/* Botão de Centralizar */}
      <TouchableOpacity style={styles.centerButton} onPress={handleCenterOnUser}>
        <Text style={styles.centerButtonText}>📍</Text>
      </TouchableOpacity>

      {/* Botão de Lista */}
      <TouchableOpacity
        style={styles.listButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.listButtonText}>📋 Ver Lista</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(45, 106, 79, 0.95)',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#b7e4c7',
    marginTop: 4,
  },
  centerButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centerButtonText: {
    fontSize: 24,
  },
  listButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#2d6a4f',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  listButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});