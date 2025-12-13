import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';

const STATUS_OPTIONS = [
  {
    value: 'normal',
    label: 'Normal',
    icon: '✅',
    description: 'A horta está funcionando normalmente nos horários cadastrados',
    color: '#2d6a4f',
  },
  {
    value: 'fechado_temporariamente',
    label: 'Fechado Temporariamente',
    icon: '🚫',
    description: 'A horta está fechada por um período curto (até alguns dias)',
    color: '#d62828',
  },
  {
    value: 'ferias',
    label: 'Férias',
    icon: '🏖️',
    description: 'A horta está em recesso por férias coletivas',
    color: '#f77f00',
  },
  {
    value: 'manutencao',
    label: 'Em Manutenção',
    icon: '🔧',
    description: 'A horta está passando por manutenção ou reformas',
    color: '#6c757d',
  },
];

export default function EditarStatusScreen({ route, navigation }) {
  const { hortaId, hortaNome, currentStatus } = route.params;
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || 'normal');
  const [mensagem, setMensagem] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      const response = await api.get(`/hortas/${hortaId}`);
      const horta = response.data.horta;
      setSelectedStatus(horta.status_temporario || 'normal');
      setMensagem(horta.mensagem_status || '');
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/hortas/${hortaId}/status`, {
        status_temporario: selectedStatus,
        mensagem_status: mensagem.trim() || null,
      });

      Alert.alert('Sucesso', 'Status atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Erro ao salvar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  const selectedOption = STATUS_OPTIONS.find((s) => s.value === selectedStatus);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.hortaNome}>{hortaNome}</Text>
          <Text style={styles.subtitle}>
            Informe um status temporário para a horta. Isso será exibido para todos os visitantes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Atual</Text>
          
          {STATUS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.statusOption,
                selectedStatus === option.value && styles.statusOptionSelected,
                selectedStatus === option.value && { borderColor: option.color },
              ]}
              onPress={() => setSelectedStatus(option.value)}
            >
              <View style={styles.statusHeader}>
                <Text style={styles.statusIcon}>{option.icon}</Text>
                <View style={styles.statusInfo}>
                  <Text style={[styles.statusLabel, selectedStatus === option.value && { color: option.color }]}>
                    {option.label}
                  </Text>
                  <Text style={styles.statusDescription}>{option.description}</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    selectedStatus === option.value && { borderColor: option.color },
                  ]}
                >
                  {selectedStatus === option.value && (
                    <View style={[styles.radioInner, { backgroundColor: option.color }]} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {selectedStatus !== 'normal' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mensagem (Opcional)</Text>
            <Text style={styles.sectionSubtitle}>
              Adicione uma mensagem personalizada para informar os visitantes
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder={getMensagemPlaceholder(selectedStatus)}
              placeholderTextColor="#999"
              value={mensagem}
              onChangeText={setMensagem}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.charCount}>{mensagem.length}/200</Text>
          </View>
        )}

        {/* Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pré-visualização</Text>
          <View style={[styles.preview, { borderLeftColor: selectedOption?.color }]}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewIcon}>{selectedOption?.icon}</Text>
              <Text style={[styles.previewStatus, { color: selectedOption?.color }]}>
                {selectedOption?.label}
              </Text>
            </View>
            {mensagem.trim() && (
              <Text style={styles.previewMessage}>{mensagem}</Text>
            )}
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>💾 Salvar Status</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function getMensagemPlaceholder(status) {
  switch (status) {
    case 'fechado_temporariamente':
      return 'Ex: Retornamos na próxima segunda-feira!';
    case 'ferias':
      return 'Ex: Voltamos dia 10/01. Boas festas!';
    case 'manutencao':
      return 'Ex: Estamos melhorando o espaço. Aguardem novidades!';
    default:
      return 'Digite uma mensagem...';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  hortaNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d6a4f',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  statusOption: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusOptionSelected: {
    backgroundColor: '#fff',
    borderWidth: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  preview: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginTop: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  previewStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  bottomSpace: {
    height: 100,
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#2d6a4f',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#a7c4bc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
