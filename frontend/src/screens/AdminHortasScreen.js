import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function AdminHortasScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hortas, setHortas] = useState([]);
  const [gerenciadores, setGerenciadores] = useState([]);
  const [filtroGerenciador, setFiltroGerenciador] = useState(null);
  
  // Modais
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  
  // Estado do formulário
  const [hortaSelecionada, setHortaSelecionada] = useState(null);
  const [novoGerenciador, setNovoGerenciador] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  
  // Campos do formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    endereco: '',
    latitude: '',
    longitude: '',
    horarioFuncionamento: '',
  });

  useEffect(() => {
    fetchData();
  }, [filtroGerenciador]);

  const fetchData = async () => {
    try {
      const [gerenRes, hortasRes] = await Promise.all([
        api.get('/admin/gerenciadores'),
        api.get(`/admin/hortas${filtroGerenciador ? `?gerenciadorId=${filtroGerenciador.id}` : ''}`),
      ]);
      
      setGerenciadores(gerenRes.data.gerenciadores);
      setHortas(hortasRes.data.hortas);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // ============ CRIAR / EDITAR ============
  
  const abrirFormulario = (horta = null) => {
    if (horta) {
      // Modo edição
      setModoEdicao(true);
      setHortaSelecionada(horta);
      setFormData({
        nome: horta.nome || '',
        descricao: horta.descricao || '',
        endereco: horta.endereco || '',
        latitude: horta.latitude ? String(horta.latitude) : '',
        longitude: horta.longitude ? String(horta.longitude) : '',
        horarioFuncionamento: horta.horario_funcionamento || '',
      });
    } else {
      // Modo criação
      setModoEdicao(false);
      setHortaSelecionada(null);
      setFormData({
        nome: '',
        descricao: '',
        endereco: '',
        latitude: '',
        longitude: '',
        horarioFuncionamento: '',
      });
    }
    setFormModalVisible(true);
  };

  const salvarHorta = async () => {
    // Validação
    if (!formData.nome.trim()) {
      Alert.alert('Atenção', 'O nome é obrigatório');
      return;
    }
    if (!formData.endereco.trim()) {
      Alert.alert('Atenção', 'O endereço é obrigatório');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Atenção', 'Latitude e longitude são obrigatórios');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Atenção', 'Latitude e longitude devem ser números válidos');
      return;
    }

    try {
      setSalvando(true);

      const dados = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        endereco: formData.endereco.trim(),
        latitude: lat,
        longitude: lng,
        horarioFuncionamento: formData.horarioFuncionamento.trim(),
      };

      if (modoEdicao) {
        await api.put(`/admin/hortas/${hortaSelecionada.id}`, dados);
        Alert.alert('Sucesso', 'Horta atualizada com sucesso!');
      } else {
        await api.post('/admin/hortas', dados);
        Alert.alert('Sucesso', 'Horta criada com sucesso!');
      }

      setFormModalVisible(false);
      fetchData();
    } catch (err) {
      console.error('Erro ao salvar horta:', err);
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao salvar horta');
    } finally {
      setSalvando(false);
    }
  };

  // ============ DELETAR ============
  
  const confirmarDeletar = (horta) => {
    Alert.alert(
      'Deletar Horta',
      `Tem certeza que deseja DELETAR PERMANENTEMENTE a horta "${horta.nome}"?\n\nIsso também removerá todos os produtos e horários associados.\n\nEsta ação NÃO pode ser desfeita!`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: () => deletarHorta(horta),
        },
      ]
    );
  };

  const deletarHorta = async (horta) => {
    try {
      setSalvando(true);
      await api.delete(`/admin/hortas/${horta.id}`);
      Alert.alert('Sucesso', `Horta "${horta.nome}" foi deletada`);
      setModalVisible(false);
      fetchData();
    } catch (err) {
      console.error('Erro ao deletar horta:', err);
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao deletar horta');
    } finally {
      setSalvando(false);
    }
  };

  // ============ ATRIBUIR GERENCIADOR ============
  
  const openAtribuirModal = (horta) => {
    setHortaSelecionada(horta);
    const gerenciadorAtual = gerenciadores.find(g => g.id === horta.gerenciador_id);
    setNovoGerenciador(gerenciadorAtual || null);
    setModalVisible(true);
  };

  const salvarAtribuicao = async () => {
    if (!hortaSelecionada || !novoGerenciador) {
      Alert.alert('Atenção', 'Selecione um gerenciador');
      return;
    }

    try {
      setSalvando(true);
      await api.put(`/admin/hortas/${hortaSelecionada.id}/atribuir`, {
        gerenciadorId: novoGerenciador.id,
      });

      Alert.alert('Sucesso', 'Horta atribuída com sucesso!');
      setModalVisible(false);
      fetchData();
    } catch (err) {
      console.error('Erro ao atribuir horta:', err);
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao atribuir horta');
    } finally {
      setSalvando(false);
    }
  };

  const getGerenciadorNome = (gerenciadorId) => {
    const gerenciador = gerenciadores.find(g => g.id === gerenciadorId);
    return gerenciador ? gerenciador.nome : 'Não atribuído';
  };

  // ============ RENDER ============

  const renderHorta = ({ item }) => {
    const temGerenciador = item.gerenciador_id != null;
    
    return (
      <TouchableOpacity
        style={[styles.hortaCard, !item.ativo && styles.hortaInativa]}
        onPress={() => openAtribuirModal(item)}
      >
        <View style={styles.hortaHeader}>
          <View style={[styles.statusBadge, { backgroundColor: item.ativo ? '#e8f5e9' : '#ffebee' }]}>
            <Ionicons 
              name={item.ativo ? 'checkmark-circle' : 'close-circle'} 
              size={14} 
              color={item.ativo ? '#4caf50' : '#f44336'} 
            />
            <Text style={[styles.statusText, { color: item.ativo ? '#4caf50' : '#f44336' }]}>
              {item.ativo ? 'Ativa' : 'Inativa'}
            </Text>
          </View>
          
          {/* Botões de ação rápida */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionBtn}
              onPress={() => abrirFormulario(item)}
            >
              <Ionicons name="create-outline" size={18} color="#1976d2" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionBtn}
              onPress={() => confirmarDeletar(item)}
            >
              <Ionicons name="trash-outline" size={18} color="#f44336" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.hortaNome}>{item.nome}</Text>
        
        {item.endereco && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.endereco}
            </Text>
          </View>
        )}

        <View style={styles.gerenciadorRow}>
          <View style={[
            styles.gerenciadorBadge,
            { backgroundColor: temGerenciador ? '#e3f2fd' : '#fff3e0' }
          ]}>
            <Ionicons 
              name={temGerenciador ? 'person-circle' : 'person-add'} 
              size={16} 
              color={temGerenciador ? '#1976d2' : '#f57c00'} 
            />
            <Text style={[
              styles.gerenciadorText,
              { color: temGerenciador ? '#1976d2' : '#f57c00' }
            ]}>
              {temGerenciador ? getGerenciadorNome(item.gerenciador_id) : 'Sem gerenciador'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Carregando hortas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Hortas</Text>
        <TouchableOpacity onPress={() => abrirFormulario()}>
          <Ionicons name="add-circle" size={28} color="#2e7d32" />
        </TouchableOpacity>
      </View>

      {/* Filtro por gerenciador */}
      <TouchableOpacity 
        style={styles.filterContainer}
        onPress={() => setFilterModalVisible(true)}
      >
        <Text style={styles.filterLabel}>Filtrar por gerenciador:</Text>
        <View style={styles.filterButton}>
          <Text style={styles.filterButtonText}>
            {filtroGerenciador ? filtroGerenciador.nome : 'Todos'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </View>
      </TouchableOpacity>

      {/* Resumo */}
      <View style={styles.resumeBar}>
        <Text style={styles.resumeText}>
          {hortas.length} horta{hortas.length !== 1 ? 's' : ''} encontrada{hortas.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Lista de hortas */}
      <FlatList
        data={hortas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHorta}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2e7d32']}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma horta encontrada</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => abrirFormulario()}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Criar Horta</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* ============ MODAL ATRIBUIR GERENCIADOR ============ */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {hortaSelecionada?.nome}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Atribuir gerenciador:</Text>

            <ScrollView style={styles.gerenciadorList}>
              {gerenciadores.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.gerenciadorOption,
                    novoGerenciador?.id === g.id && styles.gerenciadorOptionSelected,
                  ]}
                  onPress={() => setNovoGerenciador(g)}
                >
                  <View style={styles.gerenciadorOptionInfo}>
                    <Text style={styles.gerenciadorOptionNome}>{g.nome}</Text>
                    <Text style={styles.gerenciadorOptionEmail}>{g.email}</Text>
                  </View>
                  {novoGerenciador?.id === g.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Divider */}
            <View style={styles.modalDivider} />

            {/* Ações da horta */}
            <Text style={styles.modalLabel}>Ações:</Text>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={() => {
                setModalVisible(false);
                abrirFormulario(hortaSelecionada);
              }}
            >
              <Ionicons name="create-outline" size={20} color="#1976d2" />
              <Text style={[styles.actionButtonText, { color: '#1976d2' }]}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={() => {
                setModalVisible(false);
                confirmarDeletar(hortaSelecionada);
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#f44336" />
              <Text style={[styles.actionButtonText, { color: '#f44336' }]}>Deletar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={salvarAtribuicao}
              disabled={salvando || !novoGerenciador}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar Atribuição</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============ MODAL FILTRO ============ */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar por Gerenciador</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.gerenciadorList}>
              <TouchableOpacity
                style={[
                  styles.gerenciadorOption,
                  filtroGerenciador === null && styles.gerenciadorOptionSelected,
                ]}
                onPress={() => {
                  setFiltroGerenciador(null);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={styles.gerenciadorOptionNome}>Todos</Text>
                {filtroGerenciador === null && (
                  <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
                )}
              </TouchableOpacity>

              {gerenciadores.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.gerenciadorOption,
                    filtroGerenciador?.id === g.id && styles.gerenciadorOptionSelected,
                  ]}
                  onPress={() => {
                    setFiltroGerenciador(g);
                    setFilterModalVisible(false);
                  }}
                >
                  <View style={styles.gerenciadorOptionInfo}>
                    <Text style={styles.gerenciadorOptionNome}>{g.nome}</Text>
                    <Text style={styles.gerenciadorOptionEmail}>{g.email}</Text>
                  </View>
                  {filtroGerenciador?.id === g.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============ MODAL CRIAR/EDITAR ============ */}
      <Modal
        visible={formModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFormModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modoEdicao ? 'Editar Horta' : 'Nova Horta'}
              </Text>
              <TouchableOpacity onPress={() => setFormModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nome *</Text>
              <TextInput
                style={styles.input}
                value={formData.nome}
                onChangeText={(text) => setFormData({ ...formData, nome: text })}
                placeholder="Nome da horta"
              />

              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={formData.descricao}
                onChangeText={(text) => setFormData({ ...formData, descricao: text })}
                placeholder="Descrição da horta"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Endereço *</Text>
              <TextInput
                style={styles.input}
                value={formData.endereco}
                onChangeText={(text) => setFormData({ ...formData, endereco: text })}
                placeholder="Endereço completo"
              />

              <View style={styles.coordRow}>
                <View style={styles.coordField}>
                  <Text style={styles.inputLabel}>Latitude *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.latitude}
                    onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                    placeholder="-23.5390"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.coordField}>
                  <Text style={styles.inputLabel}>Longitude *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.longitude}
                    onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                    placeholder="-46.7680"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Horário de Funcionamento</Text>
              <TextInput
                style={styles.input}
                value={formData.horarioFuncionamento}
                onChangeText={(text) => setFormData({ ...formData, horarioFuncionamento: text })}
                placeholder="Segunda a Sexta: 8h às 17h"
              />

              <TouchableOpacity
                style={[styles.saveButton, { marginTop: 20 }]}
                onPress={salvarHorta}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {modoEdicao ? 'Salvar Alterações' : 'Criar Horta'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
  },
  resumeBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  resumeText: {
    fontSize: 13,
    color: '#666',
  },
  listContent: {
    padding: 12,
    paddingBottom: 100,
  },
  hortaCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  hortaInativa: {
    opacity: 0.7,
    backgroundColor: '#f9f9f9',
  },
  hortaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  hortaNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  gerenciadorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gerenciadorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  gerenciadorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    marginBottom: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  gerenciadorList: {
    maxHeight: 200,
  },
  gerenciadorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  gerenciadorOptionSelected: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  gerenciadorOptionInfo: {
    flex: 1,
  },
  gerenciadorOptionNome: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  gerenciadorOptionEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    gap: 10,
  },
  actionButtonPrimary: {
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
  },
  actionButtonDanger: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Form inputs
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  coordRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coordField: {
    flex: 1,
  },
});
