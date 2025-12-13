import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [nome, setNome] = useState(user?.nome || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à galeria para alterar sua foto.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
      setEditing(true);
    }
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome não pode estar vazio.');
      return;
    }

    setLoading(true);

    try {
      // Aqui você pode implementar o upload do avatar
      // Por enquanto, vamos apenas atualizar o nome
      const response = await api.put('/auth/profile', {
        nome: nome.trim(),
      });

      if (response.data.user) {
        await updateUser(response.data.user);
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        setEditing(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.error || 'Não foi possível atualizar o perfil.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getTipoUsuario = (tipo) => {
    switch (tipo) {
      case 'admin':
        return '👑 Administrador';
      case 'gerenciador':
        return '🌿 Gerenciador de Horta';
      default:
        return '🌱 Usuário Comum';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials(nome)}</Text>
              </View>
            )}
            <View style={styles.editAvatarBadge}>
              <Text style={styles.editAvatarIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Toque para alterar a foto</Text>
        </View>

        {/* Tipo de Usuário */}
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getTipoUsuario(user?.tipo)}</Text>
          </View>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={(text) => {
              setNome(text);
              setEditing(true);
            }}
            placeholder="Seu nome"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>E-mail</Text>
          <View style={styles.disabledInput}>
            <Text style={styles.disabledInputText}>{user?.email}</Text>
            <Text style={styles.disabledHint}>
              Para alterar o e-mail, vá em Configurações
            </Text>
          </View>

          <Text style={styles.label}>Membro desde</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {user?.criado_em
                ? new Date(user.criado_em).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Data não disponível'}
            </Text>
          </View>
        </View>

        {/* Botão Salvar */}
        {editing && (
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2d6a4f',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#2d6a4f',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2d6a4f',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#1b4332',
  },
  avatarInitials: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editAvatarIcon: {
    fontSize: 18,
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  badgeContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  badge: {
    backgroundColor: '#d8f3dc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: '#2d6a4f',
    fontWeight: '600',
    fontSize: 14,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disabledInputText: {
    fontSize: 16,
    color: '#666',
  },
  disabledHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2d6a4f',
    marginHorizontal: 20,
    marginVertical: 30,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
