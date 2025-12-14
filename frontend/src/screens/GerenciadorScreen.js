import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const STATUS_OPTIONS = [
  { value: 'normal', label: '✅ Normal', color: '#2d6a4f' },
  { value: 'fechado_temporariamente', label: '🚫 Fechado Temporariamente', color: '#d62828' },
  { value: 'ferias', label: '🏖️ Férias', color: '#f77f00' },
  { value: 'manutencao', label: '🔧 Em Manutenção', color: '#6c757d' },
];

export default function GerenciadorScreen({ navigation }) {
  const { user } = useAuth();
  const [hortas, setHortas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedHorta, setSelectedHorta] = useState(null);

  const fetchMinhasHortas = useCallback(async () => {
    try {
      const response = await api.get('/hortas/minhas');
      const hortasData = response.data.hortas;
      setHortas(hortasData);
      
      // Atualiza selectedHorta com dados novos ou seleciona a primeira
      if (hortasData.length > 0) {
        if (selectedHorta) {
          // Encontra a horta selecionada nos novos dados para atualizar
          const updatedSelected = hortasData.find(h => h.id === selectedHorta.id);
          if (updatedSelected) {
            setSelectedHorta(updatedSelected);
          } else {
            setSelectedHorta(hortasData[0]);
          }
        } else {
          setSelectedHorta(hortasData[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar hortas:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas hortas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedHorta]);

  // Atualiza os dados quando a tela recebe foco (ex: voltando de outra tela)
  useFocusEffect(
    useCallback(() => {
      fetchMinhasHortas();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMinhasHortas();
  }, [fetchMinhasHortas]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d6a4f" />
        <Text style={styles.loadingText}>Carregando suas hortas...</Text>
      </View>
    );
  }

  if (hortas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🌱</Text>
        <Text style={styles.emptyTitle}>Nenhuma horta encontrada</Text>
        <Text style={styles.emptyText}>
          Você ainda não gerencia nenhuma horta.
          {'\n'}Entre em contato com o administrador.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2d6a4f']} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Painel do Gerenciador</Text>
        <Text style={styles.subtitle}>Gerencie suas hortas comunitárias</Text>
      </View>

      {/* Seletor de Horta */}
      {hortas.length > 1 && (
        <View style={styles.hortaSelector}>
          <Text style={styles.sectionTitle}>Selecionar Horta</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {hortas.map((horta) => (
              <TouchableOpacity
                key={horta.id}
                style={[
                  styles.hortaTab,
                  selectedHorta?.id === horta.id && styles.hortaTabSelected,
                ]}
                onPress={() => setSelectedHorta(horta)}
              >
                <Text
                  style={[
                    styles.hortaTabText,
                    selectedHorta?.id === horta.id && styles.hortaTabTextSelected,
                  ]}
                >
                  {horta.nome}
                </Text>
                {horta.aberta_agora && (
                  <View style={styles.abertaBadge}>
                    <Text style={styles.abertaBadgeText}>Aberta</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedHorta && (
        <>
          {/* Card da Horta Selecionada */}
          <View style={styles.hortaCard}>
            <View style={styles.hortaHeader}>
              <Text style={styles.hortaName}>{selectedHorta.nome}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: selectedHorta.aberta_agora ? '#2d6a4f' : '#d62828' },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {selectedHorta.aberta_agora ? '🟢 Aberta' : '🔴 Fechada'}
                </Text>
              </View>
            </View>
            <Text style={styles.hortaAddress}>{selectedHorta.endereco}</Text>
          </View>

          {/* Menu de Ações */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                navigation.navigate('EditarHorarios', { hortaId: selectedHorta.id, hortaNome: selectedHorta.nome })
              }
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>🕐</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Horários de Funcionamento</Text>
                <Text style={styles.actionDescription}>
                  Configure os horários de abertura e fechamento para cada dia da semana
                </Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                navigation.navigate('EditarStatus', { hortaId: selectedHorta.id, hortaNome: selectedHorta.nome, currentStatus: selectedHorta.status_temporario })
              }
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>📢</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Status Temporário</Text>
                <Text style={styles.actionDescription}>
                  Informe férias, manutenção ou fechamento temporário
                </Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                navigation.navigate('EditarHorta', { hortaId: selectedHorta.id })
              }
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>✏️</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Editar Informações</Text>
                <Text style={styles.actionDescription}>
                  Atualize nome, descrição e foto da horta
                </Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                navigation.navigate('GerenciarProdutos', { hortaId: selectedHorta.id, hortaNome: selectedHorta.nome })
              }
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>🥬</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Produtos Disponíveis</Text>
                <Text style={styles.actionDescription}>
                  Adicione ou remova produtos da sua horta
                </Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
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
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    backgroundColor: '#2d6a4f',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#a7c4bc',
    marginTop: 4,
  },
  hortaSelector: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  hortaTab: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  hortaTabSelected: {
    backgroundColor: '#2d6a4f',
    borderColor: '#2d6a4f',
  },
  hortaTabText: {
    fontSize: 14,
    color: '#333',
  },
  hortaTabTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  abertaBadge: {
    backgroundColor: '#40916c',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  abertaBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  hortaCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  hortaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  hortaAddress: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    padding: 16,
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#e8f5e9',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  actionArrow: {
    fontSize: 24,
    color: '#999',
    marginLeft: 8,
  },
});
