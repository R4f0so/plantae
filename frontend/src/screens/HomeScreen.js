import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import UserMenu from '../components/UserMenu';

export default function HomeScreen({ navigation }) {
  const [hortas, setHortas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Atualiza os dados quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      loadHortas();
    }, [])
  );

  async function loadHortas() {
    try {
      const response = await api.get('/hortas');
      setHortas(response.data.hortas);
    } catch (error) {
      console.error('Erro ao carregar hortas:', error);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHortas();
    setRefreshing(false);
  }, []);

  function renderHorta({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('HortaDetail', { hortaId: item.id })}
      >
        {item.foto_capa ? (
          <Image source={{ uri: item.foto_capa }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>🌱</Text>
          </View>
        )}
        
        {/* Indicador de status aberto/fechado */}
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.aberta_agora ? '#2d6a4f' : '#d62828' }
        ]}>
          <Text style={styles.statusText}>
            {item.aberta_agora ? '🟢 Aberta' : '🔴 Fechada'}
          </Text>
        </View>
        
        {/* Status temporário (férias, manutenção, etc) */}
        {item.status_temporario && item.status_temporario !== 'normal' && (
          <View style={styles.statusTemporarioBadge}>
            <Text style={styles.statusTemporarioText}>
              {item.status_temporario === 'ferias' ? '🏖️ Férias' : 
               item.status_temporario === 'manutencao' ? '🔧 Manutenção' : 
               '🚫 Fech. Temp.'}
            </Text>
          </View>
        )}
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.nome}
          </Text>
          
          <Text style={styles.cardAddress} numberOfLines={1}>
            📍 {item.endereco}
          </Text>
          
          {item.horario_funcionamento && (
            <Text style={styles.cardHorario} numberOfLines={1}>
              🕐 {item.horario_funcionamento}
            </Text>
          )}
          
          <Text style={styles.cardGerenciador}>
            👤 {item.gerenciador_nome}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2d6a4f" />
        <Text style={styles.loadingText}>Carregando hortas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🌱 Hortas Comunitárias</Text>
          <Text style={styles.headerSubtitle}>Osasco - SP</Text>
        </View>
        <UserMenu navigation={navigation} />
      </View>

      <FlatList
        data={hortas}
        renderItem={renderHorta}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2d6a4f']}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>🌿</Text>
            <Text style={styles.emptyTitle}>Nenhuma horta encontrada</Text>
            <Text style={styles.emptySubtitle}>
              Puxe para baixo para atualizar
            </Text>
          </View>
        }
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e0e0e0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b7e4c7',
  },
  placeholderText: {
    fontSize: 60,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusTemporarioBadge: {
    position: 'absolute',
    top: 45,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#f77f00',
  },
  statusTemporarioText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardHorario: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardGerenciador: {
    fontSize: 13,
    color: '#2d6a4f',
    fontWeight: '600',
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
  },
});