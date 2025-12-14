import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

export default function EditarHortaScreen({ route, navigation }) {
  const { hortaId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [horta, setHorta] = useState({
    nome: '',
    descricao: '',
    endereco: '',
    horario_funcionamento: '',
    foto_capa: null,
  });

  useEffect(() => {
    loadHorta();
  }, []);

  async function loadHorta() {
    try {
      const response = await api.get(`/hortas/${hortaId}`);
      const data = response.data.horta;
      setHorta({
        nome: data.nome || '',
        descricao: data.descricao || '',
        endereco: data.endereco || '',
        horario_funcionamento: data.horario_funcionamento || '',
        foto_capa: data.foto_capa || null,
      });
    } catch (error) {
      console.error('Erro ao carregar horta:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da horta');
    } finally {
      setLoading(false);
    }
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erro', 'Precisamos de permissão para acessar suas fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setHorta({ ...horta, foto_capa: result.assets[0].uri });
    }
  }

  async function handleSave() {
    if (!horta.nome.trim()) {
      Alert.alert('Erro', 'O nome da horta é obrigatório');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/hortas/${hortaId}`, {
        nome: horta.nome,
        descricao: horta.descricao,
        endereco: horta.endereco,
        horario_funcionamento: horta.horario_funcionamento,
      });

      Alert.alert('Sucesso', 'Informações atualizadas com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Editar Horta</Text>
      </View>

      <View style={styles.form}>
        {/* Foto de Capa */}
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {horta.foto_capa ? (
            <Image source={{ uri: horta.foto_capa }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📷</Text>
              <Text style={styles.imagePlaceholderLabel}>Adicionar foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Nome */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome da Horta *</Text>
          <TextInput
            style={styles.input}
            value={horta.nome}
            onChangeText={(text) => setHorta({ ...horta, nome: text })}
            placeholder="Ex: Horta Comunitária Centro"
          />
        </View>

        {/* Descrição */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={horta.descricao}
            onChangeText={(text) => setHorta({ ...horta, descricao: text })}
            placeholder="Descreva sua horta..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Endereço */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Endereço</Text>
          <TextInput
            style={styles.input}
            value={horta.endereco}
            onChangeText={(text) => setHorta({ ...horta, endereco: text })}
            placeholder="Ex: Rua das Flores, 123"
          />
        </View>

        {/* Horário de Funcionamento (texto livre) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Horário (resumo)</Text>
          <TextInput
            style={styles.input}
            value={horta.horario_funcionamento}
            onChangeText={(text) => setHorta({ ...horta, horario_funcionamento: text })}
            placeholder="Ex: Seg-Sex: 8h às 17h"
          />
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </View>
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
  form: {
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#e0e0e0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b7e4c7',
  },
  imagePlaceholderText: {
    fontSize: 40,
    marginBottom: 8,
  },
  imagePlaceholderLabel: {
    fontSize: 14,
    color: '#2d6a4f',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#2d6a4f',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
