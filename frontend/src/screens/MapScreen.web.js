import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import api from '../services/api';

export default function MapScreen({ navigation }) {
  const [hortas, setHortas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadHortas();
    getUserLocation();
  }, []);

  async function getUserLocation() {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.log('Erro ao obter localização:', error);
          }
        );
      }
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

  function openInGoogleMaps(horta) {
    const url = `https://www.google.com/maps/search/?api=1&query=${horta.latitude},${horta.longitude}`;
    window.open(url, '_blank');
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 
      ? `${Math.round(distance * 1000)}m` 
      : `${distance.toFixed(1)}km`;
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Mapa de Hortas</Text>
        <Text style={styles.headerSubtitle}>{hortas.length} hortas em Osasco</Text>
      </View>

      {/* Lista de Hortas */}
      <ScrollView style={styles.listContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 <Text style={styles.infoBold}>Modo Web:</Text> Clique em "Abrir no Google Maps" para visualizar a localização
          </Text>
        </View>

        {hortas.map((horta) => {
          const distance = userLocation 
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                parseFloat(horta.latitude),
                parseFloat(horta.longitude)
              )
            : null;

          return (
            <View key={horta.id} style={styles.hortaCard}>
              <View style={styles.hortaHeader}>
                <Text style={styles.hortaTitle}>{horta.nome}</Text>
                {distance && (
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>📍 {distance}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.hortaAddress}>{horta.endereco}</Text>

              {horta.horario_funcionamento && (
                <Text style={styles.hortaHorario}>
                  🕐 {horta.horario_funcionamento}
                </Text>
              )}

              <Text style={styles.hortaGerenciador}>
                👤 {horta.gerenciador_nome}
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => openInGoogleMaps(horta)}
                >
                  <Text style={styles.mapButtonText}>
                    🗺️ Abrir no Google Maps
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => navigation.navigate('HortaDetail', { hortaId: horta.id })}
                >
                  <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

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
    backgroundColor: '#f5f5f5',
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
  header: {
    backgroundColor: '#2d6a4f',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#b7e4c7',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    padding: 15,
    margin: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  hortaCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hortaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hortaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  distanceBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    color: '#2d6a4f',
    fontWeight: '600',
  },
  hortaAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  hortaHorario: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  hortaGerenciador: {
    fontSize: 13,
    color: '#2d6a4f',
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mapButton: {
    flex: 1,
    backgroundColor: '#2d6a4f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2d6a4f',
  },
  detailsButtonText: {
    color: '#2d6a4f',
    fontSize: 14,
    fontWeight: '600',
  },
  listButton: {
    position: 'absolute',
    bottom: 20,
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