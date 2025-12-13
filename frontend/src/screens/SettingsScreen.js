import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function SettingsScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleChangeEmail = () => {
    Alert.prompt(
      'Alterar E-mail',
      'Digite seu novo e-mail:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async (email) => {
            if (!email || !email.includes('@')) {
              Alert.alert('Erro', 'Digite um e-mail válido.');
              return;
            }
            // TODO: Implementar alteração de e-mail na API
            Alert.alert(
              'Em breve',
              'Esta funcionalidade será implementada em breve.'
            );
          },
        },
      ],
      'plain-text',
      user?.email
    );
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmar Exclusão',
              'Digite "EXCLUIR" para confirmar:',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Confirmar',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // TODO: Implementar exclusão de conta na API
                      // await api.delete('/auth/account');
                      // await signOut();
                      Alert.alert(
                        'Em breve',
                        'Esta funcionalidade será implementada em breve.'
                      );
                    } catch (error) {
                      Alert.alert('Erro', 'Não foi possível excluir a conta.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleOpenFAQ = () => {
    // Você pode trocar para uma URL real ou uma tela de FAQ
    Alert.alert(
      'FAQ - Perguntas Frequentes',
      '📌 O que é o Plantae?\nÉ um app para encontrar e gerenciar hortas comunitárias em Osasco.\n\n📌 Como posso participar de uma horta?\nEntre em contato com o gerenciador através do app.\n\n📌 Posso cadastrar minha horta?\nSim! Entre em contato conosco para se tornar um gerenciador.',
      [{ text: 'Entendi' }]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:suporte@plantae.com.br?subject=Suporte%20Plantae');
  };

  const handleOpenPrivacyPolicy = () => {
    // Você pode trocar para uma URL real
    Alert.alert(
      'Política de Privacidade',
      'Seus dados são protegidos e utilizados apenas para o funcionamento do app. Não compartilhamos informações com terceiros.\n\nPara mais detalhes, acesse nosso site.',
      [{ text: 'OK' }]
    );
  };

  const handleOpenTerms = () => {
    Alert.alert(
      'Termos de Uso',
      'Ao usar o Plantae, você concorda em:\n\n• Fornecer informações verdadeiras\n• Respeitar outros usuários\n• Não utilizar o app para fins ilegais\n\nPara mais detalhes, acesse nosso site.',
      [{ text: 'OK' }]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <Text style={styles.settingArrow}>›</Text>)}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

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
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Conta */}
        <SectionHeader title="CONTA" />
        <View style={styles.section}>
          <SettingItem
            icon="📧"
            title="Alterar E-mail"
            subtitle={user?.email}
            onPress={handleChangeEmail}
          />
          <SettingItem
            icon="🔒"
            title="Alterar Senha"
            subtitle="Mude sua senha de acesso"
            onPress={handleChangePassword}
          />
        </View>

        {/* Preferências */}
        <SectionHeader title="PREFERÊNCIAS" />
        <View style={styles.section}>
          <SettingItem
            icon="🌙"
            title="Modo Escuro"
            subtitle="Em breve"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#ddd', true: '#b7e4c7' }}
                thumbColor={darkMode ? '#2d6a4f' : '#f4f3f4'}
                disabled={true}
              />
            }
          />
          <SettingItem
            icon="🔔"
            title="Notificações"
            subtitle="Receber alertas do app"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#ddd', true: '#b7e4c7' }}
                thumbColor={notifications ? '#2d6a4f' : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Ajuda */}
        <SectionHeader title="AJUDA" />
        <View style={styles.section}>
          <SettingItem
            icon="❓"
            title="FAQ"
            subtitle="Perguntas frequentes"
            onPress={handleOpenFAQ}
          />
          <SettingItem
            icon="💬"
            title="Fale Conosco"
            subtitle="Entre em contato com o suporte"
            onPress={handleContactSupport}
          />
        </View>

        {/* Sobre */}
        <SectionHeader title="SOBRE" />
        <View style={styles.section}>
          <SettingItem
            icon="📜"
            title="Termos de Uso"
            onPress={handleOpenTerms}
          />
          <SettingItem
            icon="🔐"
            title="Política de Privacidade"
            onPress={handleOpenPrivacyPolicy}
          />
          <SettingItem
            icon="📱"
            title="Versão do App"
            subtitle="1.0.0"
          />
        </View>

        {/* Zona de Perigo */}
        <SectionHeader title="ZONA DE PERIGO" />
        <View style={[styles.section, styles.dangerSection]}>
          <SettingItem
            icon="🗑️"
            title="Excluir Conta"
            subtitle="Remover permanentemente sua conta"
            onPress={handleDeleteAccount}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🌱 Plantae</Text>
          <Text style={styles.footerSubtext}>
            Hortas Comunitárias de Osasco
          </Text>
          <Text style={styles.footerVersion}>v1.0.0</Text>
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
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 20,
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  dangerSection: {
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 24,
    color: '#ccc',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});
