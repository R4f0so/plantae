import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const TIPOS_USUARIO = [
  { value: 'comum', label: 'Comum', icon: 'person', color: '#757575' },
  { value: 'gerenciador', label: 'Gerenciador', icon: 'person-circle', color: '#2196f3' },
  { value: 'admin', label: 'Admin', icon: 'shield', color: '#9c27b0' },
];

export default function AdminUsuariosScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busca, setBusca] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [alterandoTipo, setAlterandoTipo] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, [filtroTipo]);

  const fetchUsuarios = async (searchTerm = '') => {
    try {
      const params = new URLSearchParams();
      if (filtroTipo) params.append('tipo', filtroTipo);
      if (searchTerm) params.append('busca', searchTerm);
      
      const response = await api.get(`/admin/usuarios?${params.toString()}`);
      setUsuarios(response.data.usuarios);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      Alert.alert('Erro', 'Não foi possível carregar os usuários');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsuarios(busca);
  };

  const handleSearch = () => {
    setLoading(true);
    fetchUsuarios(busca);
  };

  const openModal = (usuario) => {
    setUsuarioSelecionado(usuario);
    setModalVisible(true);
  };

  const alterarTipo = async (novoTipo) => {
    if (!usuarioSelecionado) return;
    
    if (novoTipo === usuarioSelecionado.tipo) {
      setModalVisible(false);
      return;
    }

    Alert.alert(
      'Confirmar alteração',
      `Deseja alterar ${usuarioSelecionado.nome} para "${novoTipo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setAlterandoTipo(true);
              await api.put(`/admin/usuarios/${usuarioSelecionado.id}/tipo`, {
                tipo: novoTipo,
              });
              
              // Atualizar lista local
              setUsuarios(usuarios.map(u => 
                u.id === usuarioSelecionado.id ? { ...u, tipo: novoTipo } : u
              ));
              
              Alert.alert('Sucesso', `Usuário alterado para ${novoTipo}`);
              setModalVisible(false);
            } catch (err) {
              console.error('Erro ao alterar tipo:', err);
              Alert.alert('Erro', err.response?.data?.error || 'Erro ao alterar tipo');
            } finally {
              setAlterandoTipo(false);
            }
          },
        },
      ]
    );
  };

  const toggleAtivo = async () => {
    if (!usuarioSelecionado) return;
    
    const novoStatus = !usuarioSelecionado.ativo;
    const acao = novoStatus ? 'ativar' : 'desativar';

    Alert.alert(
      `${novoStatus ? 'Ativar' : 'Desativar'} usuário`,
      `Deseja ${acao} a conta de ${usuarioSelecionado.nome}?\n\n${
        novoStatus 
          ? 'O usuário poderá acessar o app novamente.' 
          : 'O usuário não poderá mais acessar o app até ser reativado.'
      }`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: novoStatus ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setAlterandoTipo(true);
              await api.put(`/admin/usuarios/${usuarioSelecionado.id}/ativo`, {
                ativo: novoStatus,
              });
              
              setUsuarios(usuarios.map(u => 
                u.id === usuarioSelecionado.id ? { ...u, ativo: novoStatus } : u
              ));
              
              Alert.alert('Sucesso', `Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso`);
              setModalVisible(false);
            } catch (err) {
              console.error('Erro ao alterar status:', err);
              Alert.alert('Erro', err.response?.data?.error || 'Erro ao alterar status');
            } finally {
              setAlterandoTipo(false);
            }
          },
        },
      ]
    );
  };

  const deletarUsuario = async () => {
    if (!usuarioSelecionado) return;

    Alert.alert(
      '⚠️ Deletar usuário',
      `Tem certeza que deseja DELETAR PERMANENTEMENTE a conta de ${usuarioSelecionado.nome}?\n\nEsta ação NÃO pode ser desfeita!`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              setAlterandoTipo(true);
              await api.delete(`/admin/usuarios/${usuarioSelecionado.id}`);
              
              setUsuarios(usuarios.filter(u => u.id !== usuarioSelecionado.id));
              
              Alert.alert('Sucesso', 'Usuário deletado permanentemente');
              setModalVisible(false);
            } catch (err) {
              console.error('Erro ao deletar usuário:', err);
              Alert.alert('Erro', err.response?.data?.error || 'Erro ao deletar usuário');
            } finally {
              setAlterandoTipo(false);
            }
          },
        },
      ]
    );
  };

  const getTipoInfo = (tipo) => {
    return TIPOS_USUARIO.find(t => t.value === tipo) || TIPOS_USUARIO[0];
  };

  const renderUsuario = ({ item }) => {
    const tipoInfo = getTipoInfo(item.tipo);
    const isCurrentUser = item.id === user?.id;
    const isInativo = item.ativo === false;
    
    return (
      <TouchableOpacity
        style={[
          styles.userCard, 
          isCurrentUser && styles.currentUserCard,
          isInativo && styles.inativoCard
        ]}
        onPress={() => !isCurrentUser && openModal(item)}
        disabled={isCurrentUser}
      >
        <View style={[styles.avatarContainer, { backgroundColor: isInativo ? '#e0e0e0' : tipoInfo.color + '20' }]}>
          <Ionicons name={tipoInfo.icon} size={28} color={isInativo ? '#999' : tipoInfo.color} />
        </View>
        
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.userName, isInativo && styles.inativoText]}>{item.nome}</Text>
            {isCurrentUser && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>Você</Text>
              </View>
            )}
            {isInativo && (
              <View style={styles.inativoBadge}>
                <Text style={styles.inativoBadgeText}>Inativo</Text>
              </View>
            )}
          </View>
          <Text style={[styles.userEmail, isInativo && styles.inativoText]}>{item.email}</Text>
          <View style={styles.userMeta}>
            <View style={[styles.tipoBadge, { backgroundColor: isInativo ? '#e0e0e0' : tipoInfo.color + '20' }]}>
              <Ionicons name={tipoInfo.icon} size={12} color={isInativo ? '#999' : tipoInfo.color} />
              <Text style={[styles.tipoBadgeText, { color: isInativo ? '#999' : tipoInfo.color }]}>
                {tipoInfo.label}
              </Text>
            </View>
            {item.total_hortas > 0 && (
              <View style={styles.hortasBadge}>
                <Ionicons name="leaf" size={12} color="#4caf50" />
                <Text style={styles.hortasBadgeText}>
                  {item.total_hortas} horta{item.total_hortas > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {!isCurrentUser && (
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        )}
      </TouchableOpacity>
    );
  };

  if (loading && usuarios.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Carregando usuários...</Text>
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
        <Text style={styles.headerTitle}>Gerenciar Usuários</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Busca */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou email..."
            value={busca}
            onChangeText={setBusca}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => { setBusca(''); fetchUsuarios(''); }}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros por tipo */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !filtroTipo && styles.filterChipActive]}
          onPress={() => setFiltroTipo('')}
        >
          <Text style={[styles.filterChipText, !filtroTipo && styles.filterChipTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        {TIPOS_USUARIO.map(tipo => (
          <TouchableOpacity
            key={tipo.value}
            style={[
              styles.filterChip,
              filtroTipo === tipo.value && styles.filterChipActive,
              filtroTipo === tipo.value && { backgroundColor: tipo.color },
            ]}
            onPress={() => setFiltroTipo(filtroTipo === tipo.value ? '' : tipo.value)}
          >
            <Ionicons 
              name={tipo.icon} 
              size={14} 
              color={filtroTipo === tipo.value ? '#fff' : tipo.color} 
            />
            <Text style={[
              styles.filterChipText,
              filtroTipo === tipo.value && styles.filterChipTextActive,
            ]}>
              {tipo.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de usuários */}
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUsuario}
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
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
          </View>
        )}
      />

      {/* Modal de alteração de tipo */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alterar tipo de usuário</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {usuarioSelecionado && (
              <>
                <View style={styles.modalUserInfo}>
                  <Text style={styles.modalUserName}>{usuarioSelecionado.nome}</Text>
                  <Text style={styles.modalUserEmail}>{usuarioSelecionado.email}</Text>
                  {usuarioSelecionado.ativo === false && (
                    <View style={styles.modalInativoBadge}>
                      <Ionicons name="ban" size={14} color="#f44336" />
                      <Text style={styles.modalInativoText}>Conta inativa</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.modalLabel}>Selecione o novo tipo:</Text>

                {TIPOS_USUARIO.map(tipo => (
                  <TouchableOpacity
                    key={tipo.value}
                    style={[
                      styles.tipoOption,
                      usuarioSelecionado.tipo === tipo.value && styles.tipoOptionSelected,
                    ]}
                    onPress={() => alterarTipo(tipo.value)}
                    disabled={alterandoTipo}
                  >
                    <View style={[styles.tipoOptionIcon, { backgroundColor: tipo.color + '20' }]}>
                      <Ionicons name={tipo.icon} size={24} color={tipo.color} />
                    </View>
                    <View style={styles.tipoOptionInfo}>
                      <Text style={styles.tipoOptionLabel}>{tipo.label}</Text>
                      <Text style={styles.tipoOptionDesc}>
                        {tipo.value === 'comum' && 'Pode visualizar hortas e produtos'}
                        {tipo.value === 'gerenciador' && 'Pode gerenciar suas hortas'}
                        {tipo.value === 'admin' && 'Acesso total ao sistema'}
                      </Text>
                    </View>
                    {usuarioSelecionado.tipo === tipo.value && (
                      <Ionicons name="checkmark-circle" size={24} color={tipo.color} />
                    )}
                  </TouchableOpacity>
                ))}

                {/* Divider */}
                <View style={styles.modalDivider} />

                {/* Ações de conta */}
                <Text style={styles.modalLabel}>Ações da conta:</Text>

                {/* Botão Ativar/Desativar */}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    !usuarioSelecionado.ativo ? styles.actionButtonSuccess : styles.actionButtonWarning
                  ]}
                  onPress={toggleAtivo}
                  disabled={alterandoTipo}
                >
                  <Ionicons 
                    name={!usuarioSelecionado.ativo ? 'checkmark-circle' : 'ban'} 
                    size={20} 
                    color={!usuarioSelecionado.ativo ? '#4caf50' : '#ff9800'} 
                  />
                  <Text style={[
                    styles.actionButtonText,
                    { color: !usuarioSelecionado.ativo ? '#4caf50' : '#ff9800' }
                  ]}>
                    {!usuarioSelecionado.ativo ? 'Reativar' : 'Desativar'}
                  </Text>
                </TouchableOpacity>

                {/* Botão Deletar */}
                {usuarioSelecionado.tipo !== 'admin' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonDanger]}
                    onPress={deletarUsuario}
                    disabled={alterandoTipo}
                  >
                    <Ionicons name="trash" size={20} color="#f44336" />
                    <Text style={[styles.actionButtonText, { color: '#f44336' }]}>
                      Deletar
                    </Text>
                  </TouchableOpacity>
                )}

                {alterandoTipo && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#2e7d32" />
                  </View>
                )}
              </>
            )}
          </View>
        </View>
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
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#2e7d32',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#2e7d32',
    opacity: 0.7,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  youBadge: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  youBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tipoBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  hortasBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  hortasBadgeText: {
    fontSize: 11,
    color: '#4caf50',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalUserInfo: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalUserEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  tipoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10,
  },
  tipoOptionSelected: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  tipoOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipoOptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tipoOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tipoOptionDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  // Estilos para usuário inativo
  inativoCard: {
    opacity: 0.7,
    backgroundColor: '#f9f9f9',
  },
  inativoText: {
    color: '#999',
  },
  inativoBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  inativoBadgeText: {
    color: '#f44336',
    fontSize: 10,
    fontWeight: '600',
  },
  // Estilos para modal
  modalInativoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  modalInativoText: {
    color: '#f44336',
    fontSize: 12,
    fontWeight: '500',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
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
  actionButtonWarning: {
    borderColor: '#ff9800',
    backgroundColor: '#fff8e1',
  },
  actionButtonSuccess: {
    borderColor: '#4caf50',
    backgroundColor: '#e8f5e9',
  },
  actionButtonDanger: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
