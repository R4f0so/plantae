import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export default function GerenciarProdutosScreen({ route, navigation }) {
  const { hortaId, hortaNome } = route.params;
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    unidade: 'kg',
    quantidade_disponivel: '',
    categoria: '',
  });

  const unidades = ['kg', 'g', 'unidade', 'maço', 'dúzia', 'litro'];

  useFocusEffect(
    useCallback(() => {
      loadProdutos();
    }, [])
  );

  async function loadProdutos() {
    try {
      const response = await api.get(`/produtos/horta/${hortaId}`);
      setProdutos(response.data.produtos || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingProduto(null);
    setFormData({
      nome: '',
      descricao: '',
      preco: '',
      unidade: 'kg',
      quantidade_disponivel: '',
      categoria: '',
    });
    setModalVisible(true);
  }

  function openEditModal(produto) {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      preco: produto.preco?.toString() || '',
      unidade: produto.unidade || 'kg',
      quantidade_disponivel: produto.quantidade_disponivel?.toString() || '',
      categoria: produto.categoria || '',
    });
    setModalVisible(true);
  }

  async function handleSave() {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'O nome do produto é obrigatório');
      return;
    }

    setSaving(true);
    try {
      const data = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco) || 0,
        unidade: formData.unidade,
        quantidade_disponivel: parseInt(formData.quantidade_disponivel) || 0,
        categoria: formData.categoria,
        horta_id: hortaId,
      };

      if (editingProduto) {
        await api.put(`/produtos/${editingProduto.id}`, data);
        Alert.alert('Sucesso', 'Produto atualizado!');
      } else {
        await api.post('/produtos', data);
        Alert.alert('Sucesso', 'Produto adicionado!');
      }

      setModalVisible(false);
      loadProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Alert.alert('Erro', 'Não foi possível salvar o produto');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(produtoId, produtoNome) {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir "${produtoNome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/produtos/${produtoId}`);
              Alert.alert('Sucesso', 'Produto excluído!');
              loadProdutos();
            } catch (error) {
              console.error('Erro ao excluir produto:', error);
              Alert.alert('Erro', 'Não foi possível excluir o produto');
            }
          },
        },
      ]
    );
  }

  function renderProduto({ item }) {
    return (
      <View style={styles.produtoCard}>
        <View style={styles.produtoInfo}>
          {item.foto ? (
            <Image source={{ uri: item.foto }} style={styles.produtoImage} />
          ) : (
            <View style={[styles.produtoImage, styles.produtoImagePlaceholder]}>
              <Text style={styles.produtoImagePlaceholderText}>🥬</Text>
            </View>
          )}
          <View style={styles.produtoDetails}>
            <Text style={styles.produtoNome}>{item.nome}</Text>
            {item.categoria && (
              <Text style={styles.produtoCategoria}>{item.categoria}</Text>
            )}
            <Text style={styles.produtoPreco}>
              R$ {(item.preco || 0).toFixed(2)} / {item.unidade || 'kg'}
            </Text>
            <Text style={styles.produtoQuantidade}>
              Disponível: {item.quantidade_disponivel || 0}
            </Text>
          </View>
        </View>
        <View style={styles.produtoActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.editButtonText}>✏️ Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id, item.nome)}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Produtos</Text>
        <Text style={styles.subtitle}>{hortaNome}</Text>
      </View>

      {/* Lista de Produtos */}
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduto}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🌱</Text>
            <Text style={styles.emptyLabel}>Nenhum produto cadastrado</Text>
            <Text style={styles.emptySubLabel}>
              Adicione produtos para começar a vender
            </Text>
          </View>
        }
      />

      {/* Botão Adicionar */}
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ Adicionar Produto</Text>
      </TouchableOpacity>

      {/* Modal de Edição/Criação */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduto ? 'Editar Produto' : 'Novo Produto'}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome do produto *"
              value={formData.nome}
              onChangeText={(text) => setFormData({ ...formData, nome: text })}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Descrição"
              value={formData.descricao}
              onChangeText={(text) => setFormData({ ...formData, descricao: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.modalInput, styles.halfInput]}
                placeholder="Preço"
                value={formData.preco}
                onChangeText={(text) => setFormData({ ...formData, preco: text })}
                keyboardType="numeric"
              />
              <View style={styles.unidadeContainer}>
                <Text style={styles.unidadeLabel}>Unidade:</Text>
                <View style={styles.unidadeButtons}>
                  {unidades.slice(0, 3).map((un) => (
                    <TouchableOpacity
                      key={un}
                      style={[
                        styles.unidadeButton,
                        formData.unidade === un && styles.unidadeButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, unidade: un })}
                    >
                      <Text
                        style={[
                          styles.unidadeButtonText,
                          formData.unidade === un && styles.unidadeButtonTextActive,
                        ]}
                      >
                        {un}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Quantidade disponível"
              value={formData.quantidade_disponivel}
              onChangeText={(text) =>
                setFormData({ ...formData, quantidade_disponivel: text })
              }
              keyboardType="numeric"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Categoria (ex: Verduras, Frutas, Legumes)"
              value={formData.categoria}
              onChangeText={(text) => setFormData({ ...formData, categoria: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
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
  header: {
    backgroundColor: '#2d6a4f',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#b7e4c7',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  produtoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  produtoInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  produtoImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  produtoImagePlaceholder: {
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  produtoImagePlaceholderText: {
    fontSize: 30,
  },
  produtoDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  produtoCategoria: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  produtoPreco: {
    fontSize: 16,
    color: '#2d6a4f',
    fontWeight: '600',
  },
  produtoQuantidade: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  produtoActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  editButton: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 8,
  },
  editButtonText: {
    color: '#2d6a4f',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubLabel: {
    fontSize: 14,
    color: '#999',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#2d6a4f',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
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
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
    marginRight: 12,
    marginBottom: 0,
  },
  unidadeContainer: {
    flex: 1,
  },
  unidadeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  unidadeButtons: {
    flexDirection: 'row',
  },
  unidadeButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 4,
  },
  unidadeButtonActive: {
    backgroundColor: '#2d6a4f',
  },
  unidadeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  unidadeButtonTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2d6a4f',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
