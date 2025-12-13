import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  Animated,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function UserMenu({ navigation }) {
  const { user, signOut } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const handleMenuOption = (screen) => {
    closeMenu();
    setTimeout(() => {
      navigation.navigate(screen);
    }, 150);
  };

  const handleLogout = async () => {
    closeMenu();
    await signOut();
  };

  // Pega as iniciais do nome para o avatar padrão
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <>
      {/* Botão do Avatar */}
      <TouchableOpacity style={styles.avatarButton} onPress={openMenu}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{getInitials(user?.nome)}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <Animated.View
            style={[
              styles.menuContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Header do Menu - Info do Usuário */}
            <View style={styles.menuHeader}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.menuAvatar} />
              ) : (
                <View style={styles.menuAvatarPlaceholder}>
                  <Text style={styles.menuAvatarInitials}>
                    {getInitials(user?.nome)}
                  </Text>
                </View>
              )}
              <View style={styles.menuUserInfo}>
                <Text style={styles.menuUserName} numberOfLines={1}>
                  {user?.nome || 'Usuário'}
                </Text>
                <Text style={styles.menuUserEmail} numberOfLines={1}>
                  {user?.email || ''}
                </Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            {/* Opções do Menu */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuOption('Profile')}
            >
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuItemText}>Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuOption('Map')}
            >
              <Text style={styles.menuIcon}>🗺️</Text>
              <Text style={styles.menuItemText}>Mapa</Text>
            </TouchableOpacity>

            {/* Opção de Admin - só aparece para admins */}
            {user?.tipo === 'admin' && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuOption('Admin')}
              >
                <Text style={styles.menuIcon}>🛡️</Text>
                <Text style={styles.menuItemText}>Painel Admin</Text>
              </TouchableOpacity>
            )}

            {/* Opção de Gerenciador - só aparece para gerenciadores e admins */}
            {(user?.tipo === 'gerenciador' || user?.tipo === 'admin') && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuOption('Gerenciador')}
              >
                <Text style={styles.menuIcon}>🌱</Text>
                <Text style={styles.menuItemText}>Minhas Hortas</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuOption('Settings')}
            >
              <Text style={styles.menuIcon}>⚙️</Text>
              <Text style={styles.menuItemText}>Configurações</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <Text style={styles.menuIcon}>🚪</Text>
              <Text style={[styles.menuItemText, styles.logoutText]}>Sair</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatarButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 45,
    height: 45,
    borderRadius: 23,
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#b7e4c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    top: 95,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  menuAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2d6a4f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuAvatarInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuUserInfo: {
    marginLeft: 12,
    flex: 1,
  },
  menuUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  menuUserEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
  },
  logoutItem: {
    borderTopWidth: 0,
  },
  logoutText: {
    color: '#dc3545',
  },
});
