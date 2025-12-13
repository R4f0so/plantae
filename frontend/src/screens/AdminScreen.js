import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function AdminScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setError(null);
      const response = await api.get('/admin/dashboard');
      setDashboard(response.data);
    } catch (err) {
      console.error('Erro ao buscar dashboard:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (user?.tipo !== 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>Acesso Restrito</Text>
          <Text style={styles.errorText}>
            Esta área é exclusiva para administradores
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Carregando painel...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2e7d32']}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Painel Admin</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.welcomeText}>
          Olá, {user?.nome}! 👋
        </Text>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={24} color="#e74c3c" />
          <Text style={styles.errorCardText}>{error}</Text>
        </View>
      ) : (
        <>
          {/* Estatísticas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Estatísticas</Text>
            
            <View style={styles.statsGrid}>
              {/* Usuários */}
              <View style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
                <Ionicons name="people" size={32} color="#2e7d32" />
                <Text style={styles.statNumber}>{dashboard?.usuarios?.total || 0}</Text>
                <Text style={styles.statLabel}>Usuários</Text>
              </View>

              {/* Hortas */}
              <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
                <Ionicons name="leaf" size={32} color="#f57c00" />
                <Text style={styles.statNumber}>{dashboard?.hortas?.total || 0}</Text>
                <Text style={styles.statLabel}>Hortas</Text>
              </View>
            </View>

            {/* Detalhes usuários */}
            {dashboard?.usuarios?.porTipo && (
              <View style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Usuários por tipo:</Text>
                {dashboard.usuarios.porTipo.map((item, index) => (
                  <View key={index} style={styles.detailRow}>
                    <View style={styles.detailBadge}>
                      <Ionicons 
                        name={
                          item.tipo === 'admin' ? 'shield' :
                          item.tipo === 'gerenciador' ? 'person-circle' : 'person'
                        } 
                        size={16} 
                        color={
                          item.tipo === 'admin' ? '#9c27b0' :
                          item.tipo === 'gerenciador' ? '#2196f3' : '#757575'
                        } 
                      />
                      <Text style={styles.detailTipo}>
                        {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
                      </Text>
                    </View>
                    <Text style={styles.detailCount}>{item.total}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Detalhes hortas */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Status das hortas:</Text>
              <View style={styles.detailRow}>
                <View style={styles.detailBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                  <Text style={styles.detailTipo}>Ativas</Text>
                </View>
                <Text style={styles.detailCount}>{dashboard?.hortas?.ativas || 0}</Text>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailBadge}>
                  <Ionicons name="close-circle" size={16} color="#f44336" />
                  <Text style={styles.detailTipo}>Inativas</Text>
                </View>
                <Text style={styles.detailCount}>{dashboard?.hortas?.inativas || 0}</Text>
              </View>
            </View>
          </View>

          {/* Menu de Ações */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Gerenciamento</Text>
            
            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => navigation.navigate('AdminUsuarios')}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#e3f2fd' }]}>
                <Ionicons name="people" size={28} color="#1976d2" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Gerenciar Usuários</Text>
                <Text style={styles.menuDescription}>
                  Listar, promover e rebaixar usuários
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => navigation.navigate('AdminHortas')}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#e8f5e9' }]}>
                <Ionicons name="leaf" size={28} color="#388e3c" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Gerenciar Hortas</Text>
                <Text style={styles.menuDescription}>
                  Atribuir hortas a gerenciadores
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => navigation.navigate('Gerenciador')}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#fff3e0' }]}>
                <Ionicons name="settings" size={28} color="#f57c00" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Minhas Hortas</Text>
                <Text style={styles.menuDescription}>
                  Gerenciar hortas atribuídas a você
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    backgroundColor: '#2e7d32',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  errorCardText: {
    color: '#c62828',
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailTipo: {
    fontSize: 14,
    color: '#333',
  },
  detailCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
});
