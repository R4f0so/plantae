import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';

const DIAS_SEMANA = [
  { dia: 0, nome: 'Domingo', abrev: 'Dom' },
  { dia: 1, nome: 'Segunda-feira', abrev: 'Seg' },
  { dia: 2, nome: 'Terça-feira', abrev: 'Ter' },
  { dia: 3, nome: 'Quarta-feira', abrev: 'Qua' },
  { dia: 4, nome: 'Quinta-feira', abrev: 'Qui' },
  { dia: 5, nome: 'Sexta-feira', abrev: 'Sex' },
  { dia: 6, nome: 'Sábado', abrev: 'Sáb' },
];

const HORARIOS = [];
for (let h = 5; h <= 22; h++) {
  HORARIOS.push(`${h.toString().padStart(2, '0')}:00`);
  if (h < 22) HORARIOS.push(`${h.toString().padStart(2, '0')}:30`);
}

export default function EditarHorariosScreen({ route, navigation }) {
  const { hortaId, hortaNome } = route.params;
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(null);

  useEffect(() => {
    fetchHorarios();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: 'Horários',
      headerRight: () =>
        hasChanges ? (
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Salvar</Text>
          </TouchableOpacity>
        ) : null,
    });
  }, [hasChanges, horarios]);

  const fetchHorarios = async () => {
    try {
      const response = await api.get(`/hortas/${hortaId}/horarios`);
      const horariosExistentes = response.data.horarios || [];
      
      // Garantir que todos os 7 dias existam na lista
      const horariosCompletos = DIAS_SEMANA.map((diaInfo) => {
        const existente = horariosExistentes.find((h) => h.dia_semana === diaInfo.dia);
        if (existente) {
          return existente;
        }
        // Criar entrada padrão para dias que não existem
        return {
          horta_id: hortaId,
          dia_semana: diaInfo.dia,
          aberto: false,
          hora_abertura: '08:00',
          hora_fechamento: '17:00',
          observacao: null,
        };
      });
      
      setHorarios(horariosCompletos);
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os horários');
    } finally {
      setLoading(false);
    }
  };

  const updateHorario = (diaSemana, field, value) => {
    setHorarios((prev) =>
      prev.map((h) => (h.dia_semana === diaSemana ? { ...h, [field]: value } : h))
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/hortas/${hortaId}/horarios`, { horarios });
      setHasChanges(false);
      Alert.alert('Sucesso', 'Horários atualizados com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Erro ao salvar horários:', error);
      Alert.alert('Erro', 'Não foi possível salvar os horários');
    } finally {
      setSaving(false);
    }
  };

  const copiarParaTodos = (diaSemana) => {
    const horarioBase = horarios.find((h) => h.dia_semana === diaSemana);
    if (!horarioBase) return;

    Alert.alert(
      'Copiar horário',
      `Deseja copiar o horário de ${DIAS_SEMANA[diaSemana].nome} para todos os outros dias?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Copiar',
          onPress: () => {
            setHorarios((prev) =>
              prev.map((h) => ({
                ...h,
                aberto: horarioBase.aberto,
                hora_abertura: horarioBase.hora_abertura,
                hora_fechamento: horarioBase.hora_fechamento,
              }))
            );
            setHasChanges(true);
          },
        },
      ]
    );
  };

  const selectTime = (diaSemana, field, currentValue) => {
    setShowTimePicker({ diaSemana, field, currentValue });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d6a4f" />
        <Text style={styles.loadingText}>Carregando horários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.hortaNome}>{hortaNome}</Text>
          <Text style={styles.subtitle}>
            Configure os horários de funcionamento para cada dia da semana
          </Text>
        </View>

        {DIAS_SEMANA.map((diaInfo) => {
          const horario = horarios.find((h) => h.dia_semana === diaInfo.dia) || {
            dia_semana: diaInfo.dia,
            aberto: false,
            hora_abertura: '08:00',
            hora_fechamento: '17:00',
          };

          return (
            <View key={diaInfo.dia} style={styles.diaCard}>
              <View style={styles.diaHeader}>
                <View style={styles.diaInfo}>
                  <Text style={styles.diaNome}>{diaInfo.nome}</Text>
                  <Text style={[styles.diaStatus, !horario.aberto && styles.fechadoText]}>
                    {horario.aberto
                      ? `${horario.hora_abertura?.substring(0, 5)} - ${horario.hora_fechamento?.substring(0, 5)}`
                      : 'Fechado'}
                  </Text>
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>{horario.aberto ? 'Aberto' : 'Fechado'}</Text>
                  <Switch
                    value={horario.aberto}
                    onValueChange={(value) => updateHorario(diaInfo.dia, 'aberto', value)}
                    trackColor={{ false: '#ccc', true: '#a7c4bc' }}
                    thumbColor={horario.aberto ? '#2d6a4f' : '#f4f3f4'}
                  />
                </View>
              </View>

              {horario.aberto && (
                <View style={styles.horariosContainer}>
                  <View style={styles.horarioRow}>
                    <Text style={styles.horarioLabel}>Abertura:</Text>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => selectTime(diaInfo.dia, 'hora_abertura', horario.hora_abertura)}
                    >
                      <Text style={styles.timeButtonText}>
                        {horario.hora_abertura?.substring(0, 5) || '08:00'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.horarioRow}>
                    <Text style={styles.horarioLabel}>Fechamento:</Text>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => selectTime(diaInfo.dia, 'hora_fechamento', horario.hora_fechamento)}
                    >
                      <Text style={styles.timeButtonText}>
                        {horario.hora_fechamento?.substring(0, 5) || '17:00'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copiarParaTodos(diaInfo.dia)}
                  >
                    <Text style={styles.copyButtonText}>📋 Copiar para todos os dias</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <View style={styles.timePickerOverlay}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerTitle}>
              Selecionar {showTimePicker.field === 'hora_abertura' ? 'Abertura' : 'Fechamento'}
            </Text>
            <ScrollView style={styles.timePickerScroll}>
              {HORARIOS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    showTimePicker.currentValue?.startsWith(time) && styles.timeOptionSelected,
                  ]}
                  onPress={() => {
                    updateHorario(showTimePicker.diaSemana, showTimePicker.field, time + ':00');
                    setShowTimePicker(null);
                  }}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      showTimePicker.currentValue?.startsWith(time) && styles.timeOptionTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.timePickerCancel}
              onPress={() => setShowTimePicker(null)}
            >
              <Text style={styles.timePickerCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Save Button */}
      {hasChanges && (
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>💾 Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  headerButton: {
    marginRight: 16,
  },
  headerButtonText: {
    color: '#2d6a4f',
    fontSize: 16,
    fontWeight: '600',
  },
  diaCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  diaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  diaInfo: {
    flex: 1,
  },
  diaNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  diaStatus: {
    fontSize: 14,
    color: '#2d6a4f',
    marginTop: 2,
  },
  fechadoText: {
    color: '#999',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  horariosContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
  },
  horarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  horarioLabel: {
    fontSize: 14,
    color: '#666',
  },
  timeButton: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d6a4f',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d6a4f',
  },
  copyButton: {
    marginTop: 16,
    padding: 10,
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: 14,
    color: '#666',
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
  timePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  timePickerScroll: {
    maxHeight: 300,
  },
  timeOption: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  timeOptionSelected: {
    backgroundColor: '#2d6a4f',
  },
  timeOptionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  timeOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  timePickerCancel: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  timePickerCancelText: {
    fontSize: 16,
    color: '#666',
  },
});
