import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from 'react-native';
import api from '../services/api';

export default function HortaDetailScreen({ route, navigation }) {
  const { hortaId } = route.params;
  const [horta, setHorta] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHortaDetails();
    loadProdutos();
  }, []);

  async function loadHortaDetails() {
    try {
      const response = await api.get(`/hortas/${hortaId}`);
      setHorta(response.data.horta);
    } catch (error) {
      console.error('Erro ao carregar horta:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProdutos() {
    try {
      const response = await api.get(`/produtos/horta/${hortaId}`);
      setProdutos(response.data.produtos);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  }

  function openInGoogleMaps() {
    if (!horta) return;
    const url = Platform.select({
      ios: `maps://app?daddr=${horta.latitude},${horta.longitude}`,
      android: `google.navigation:q=${horta.latitude},${horta.longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${horta.latitude},${horta.longitude}`,
    });
    Linking.openURL(url);
  }

  function callPhone() {
    if (horta?.gerenciador_telefone) {
      Linking.openURL(`tel:${horta.gerenciador_telefone}`);
    }
  }

  const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hoje = new Date().getDay();

  function formatHorarios(horarios) {
    if (!horarios || horarios.length === 0) return null;
    
    return (
      <View style={styles.horariosGrid}>
        {horarios.sort((a, b) => a.dia_semana - b.dia_semana).map((h) => (
          <View 
            key={h.dia_semana} 
            style={[
              styles.horarioRow,
              h.dia_semana === hoje && styles.horarioRowHoje
            ]}
          >
            <Text style={[
              styles.horarioDia,
              h.dia_semana === hoje && styles.horarioDiaHoje
            ]}>
              {DIAS_SEMANA[h.dia_semana]}
            </Text>
            <Text style={[
              styles.horarioHora,
              !h.aberto && styles.horarioFechado
            ]}>
              {h.aberto 
                ? `${h.hora_abertura?.substring(0, 5)} - ${h.hora_fechamento?.substring(0, 5)}`
                : 'Fechado'}
            </Text>
            {h.dia_semana === hoje && (
              <View style={styles.hojeBadge}>
                <Text style={styles.hojeBadgeText}>Hoje</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2d6a4f" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!horta) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Horta não encontrada</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header com imagem */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>← Voltar</Text>
        </TouchableOpacity>

        {horta.foto_capa ? (
          <Image source={{ uri: horta.foto_capa }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.placeholderImage]}>
            <Text style={styles.placeholderEmoji}>🌱</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Nome da Horta + Badge de Status */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{horta.nome}</Text>
          {/* Badge Aberto/Fechado */}
          <View style={[
            styles.statusBadge,
            { backgroundColor: horta.aberta_agora ? '#2d6a4f' : '#d62828' }
          ]}>
            <Text style={styles.statusBadgeText}>
              {horta.aberta_agora ? '🟢 Aberto' : '🔴 Fechado'}
            </Text>
          </View>
        </View>

        {/* Status Temporário (se diferente de normal) */}
        {horta.status_temporario && horta.status_temporario !== 'normal' && (
          <View style={styles.alertCard}>
            <Text style={styles.alertIcon}>
              {horta.status_temporario === 'ferias' ? '🏖️' : 
               horta.status_temporario === 'manutencao' ? '🔧' : '🚫'}
            </Text>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {horta.status_temporario === 'ferias' ? 'Horta em Férias' :
                 horta.status_temporario === 'manutencao' ? 'Em Manutenção' : 
                 'Fechado Temporariamente'}
              </Text>
              {horta.mensagem_status && (
                <Text style={styles.alertMessage}>{horta.mensagem_status}</Text>
              )}
            </View>
          </View>
        )}

        {/* Descrição */}
        {horta.descricao && (
          <Text style={styles.description}>{horta.descricao}</Text>
        )}

        {/* Card de Informações */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>{horta.endereco}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👤</Text>
            <Text style={styles.infoText}>{horta.gerenciador_nome}</Text>
          </View>

          {horta.gerenciador_telefone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📞</Text>
              <Text style={styles.infoText}>{horta.gerenciador_telefone}</Text>
            </View>
          )}
        </View>

        {/* Horários de Funcionamento */}
        {horta.horarios && horta.horarios.length > 0 && (
          <View style={styles.horariosCard}>
            <Text style={styles.horariosTitle}>🕐 Horários de Funcionamento</Text>
            {formatHorarios(horta.horarios)}
          </View>
        )}

        {/* Botões de Ação */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={openInGoogleMaps}
          >
            <Text style={styles.actionButtonIcon}>🗺️</Text>
            <Text style={styles.actionButtonText}>Ver no Mapa</Text>
          </TouchableOpacity>

          {horta.gerenciador_telefone && (
            <TouchableOpacity style={styles.actionButton} onPress={callPhone}>
              <Text style={styles.actionButtonIcon}>📞</Text>
              <Text style={styles.actionButtonText}>Ligar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Produtos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🥬 Produtos Disponíveis ({produtos.length})
          </Text>

          {produtos.length === 0 ? (
            <View style={styles.emptyProducts}>
              <Text style={styles.emptyProductsText}>
                Nenhum produto cadastrado ainda
              </Text>
            </View>
          ) : (
            produtos.map((produto) => (
              <View key={produto.id} style={styles.productCard}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{produto.nome}</Text>
                  {produto.descricao && (
                    <Text style={styles.productDescription}>
                      {produto.descricao}
                    </Text>
                  )}
                  <View style={styles.productDetails}>
                    <Text style={styles.productPrice}>
                      R$ {produto.preco?.toFixed(2) || '0.00'}
                    </Text>
                    <Text style={styles.productUnit}>/{produto.unidade}</Text>
                    <Text style={styles.productStock}>
                      • {produto.estoque} em estoque
                    </Text>
                  </View>
                </View>
                {!produto.disponivel && (
                  <View style={styles.unavailableBadge}>
                    <Text style={styles.unavailableText}>Indisponível</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  header: {
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d6a4f',
  },
  coverImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b7e4c7',
  },
  placeholderEmoji: {
    fontSize: 80,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2d6a4f',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyProducts: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyProductsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  productCard: {
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
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  productUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  productStock: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  unavailableBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unavailableText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#2d6a4f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Novos estilos para status e horários
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    flexWrap: 'wrap',
    gap: 8,
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
  alertCard: {
    backgroundColor: '#fff3cd',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#f77f00',
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 13,
    color: '#856404',
    fontStyle: 'italic',
  },
  horariosCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  horariosTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  horariosGrid: {
    gap: 4,
  },
  horarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  horarioRowHoje: {
    backgroundColor: '#e8f5e9',
  },
  horarioDia: {
    width: 40,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  horarioDiaHoje: {
    color: '#2d6a4f',
    fontWeight: '700',
  },
  horarioHora: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  horarioFechado: {
    color: '#999',
    fontStyle: 'italic',
  },
  hojeBadge: {
    backgroundColor: '#2d6a4f',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  hojeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});