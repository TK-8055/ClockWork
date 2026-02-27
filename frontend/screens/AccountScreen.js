import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Switch, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const AccountScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        let mergedUser = parsedUser;
        if (parsedUser.role === 'WORKER') {
          const token = await AsyncStorage.getItem('auth_token');
          const profileRes = await fetch(`${API_URL}/worker/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            if (profile) {
              mergedUser = { ...parsedUser, ...profile };
            }
          }
        }
        setUser(mergedUser);
        setAvailable(mergedUser.availabilityStatus === 'AVAILABLE');
        await AsyncStorage.setItem('user_data', JSON.stringify(mergedUser));
      } else {
        const altUserData = await AsyncStorage.getItem('user');
        if (altUserData) {
          const parsedUser = JSON.parse(altUserData);
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityToggle = async (value) => {
    setAvailable(value);
    if (user) {
      const updatedUser = { ...user, availabilityStatus: value ? 'AVAILABLE' : 'BUSY' };
      setUser(updatedUser);
      AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      try {
        const token = await AsyncStorage.getItem('auth_token');
        await fetch(`${API_URL}/worker/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ availabilityStatus: updatedUser.availabilityStatus })
        });
      } catch (error) {
        console.log('Error updating availability:', error);
      }
    }
  };

  const handleEditField = (field) => {
    setEditField(field);
    setEditValue(user?.[field] || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (user && editField) {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const payload = { [editField]: editValue };
        const response = await fetch(`${API_URL}/user/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          Alert.alert('Error', data.error || 'Failed to update profile');
          return;
        }

        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
        setShowEditModal(false);
        Alert.alert('Success', `${editField} updated successfully!`);
      } catch (error) {
        Alert.alert('Error', 'Failed to update profile');
      }
    }
  };

  const handleRoleSwitch = async (newRole) => {
    if (user) {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const response = await fetch(`${API_URL}/user/set-role`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role: newRole }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          Alert.alert('Error', data.error || 'Failed to update role');
          return;
        }
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
        Alert.alert('Role Updated', `You are now a ${newRole === 'WORKER' ? 'Worker' : 'User'}`);
      } catch (error) {
        Alert.alert('Error', 'Failed to update role');
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await AsyncStorage.clear();
        navigation.replace('Splash');
      }}
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : user?.phoneNumber?.slice(-2) || 'U';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} transparent={true} animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {editField}</Text>
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Enter ${editField}`}
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveEdit}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity style={styles.editAvatar} onPress={() => handleEditField('name')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>✏️</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.phone}>{user?.phoneNumber || 'No phone'}</Text>
        
        {/* Role Switcher */}
        <View style={styles.roleSwitcher}>
          <TouchableOpacity 
            style={[styles.roleBtn, (user?.role === 'USER' || user?.role === 'user') && styles.roleBtnActive]}
            onPress={() => handleRoleSwitch('USER')}
          >
            <Text style={[styles.roleBtnText, (user?.role === 'USER' || user?.role === 'user') && styles.roleBtnTextActive]}>👤 User</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleBtn, user?.role === 'WORKER' && styles.roleBtnActive]}
            onPress={() => handleRoleSwitch('WORKER')}
          >
            <Text style={[styles.roleBtnText, user?.role === 'WORKER' && styles.roleBtnTextActive]}>👷 Worker</Text>
          </TouchableOpacity>
        </View>
        
        {/* Credits & Score Display */}
        <View style={styles.creditRow}>
          <View style={styles.creditBox}>
            <Text style={styles.creditValue}>{user?.credits || 0}</Text>
            <Text style={styles.creditLabel}>Credits</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{user?.creditScore || 100}</Text>
            <Text style={styles.scoreLabel}>Credit Score</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleEditField('name')}>
            <Text style={styles.menuText}>👤 Name</Text>
            <View style={styles.menuRight}>
              <Text style={styles.menuValue}>{user?.name || 'Not set'}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleEditField('phoneNumber')}>
            <Text style={styles.menuText}>📱 Phone</Text>
            <View style={styles.menuRight}>
              <Text style={styles.menuValue}>{user?.phoneNumber || 'Not set'}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Worker Settings */}
        {(user?.role === 'WORKER' || user?.role === 'worker') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Worker Settings</Text>
            <View style={styles.menuItem}>
              <Text style={styles.menuText}>Availability</Text>
              <Switch 
                value={available} 
                onValueChange={handleAvailabilityToggle} 
                trackColor={{ false: '#E5E7EB', true: '#10B981' }} 
                thumbColor="#FFFFFF" 
              />
            </View>
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.totalJobsCompleted || 0}</Text>
                <Text style={styles.statLabel}>Jobs Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>₹{user?.totalEarnings || 0}</Text>
                <Text style={styles.statLabel}>Total Earned</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>⭐ {user?.rating?.toFixed(1) || '5.0'}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>
        )}

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleEditField('address')}>
            <Text style={styles.menuText}>📍 Default Address</Text>
            <View style={styles.menuRight}>
              <Text style={styles.menuValue}>{user?.address || 'Not set'}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>🔔 Notifications</Text>
            <View style={styles.menuRight}>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>🌐 Language</Text>
            <View style={styles.menuRight}>
              <Text style={styles.menuValue}>English</Text>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>🔒 Privacy</Text>
            <View style={styles.menuRight}>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>❓ Help & Support</Text>
            <View style={styles.menuRight}>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>📋 Terms & Conditions</Text>
            <View style={styles.menuRight}>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>ℹ️ About</Text>
            <View style={styles.menuRight}>
              <Text style={styles.menuValue}>v1.0.0</Text>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#FFFFFF', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  editAvatar: { position: 'relative', marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 28, fontWeight: '600', color: '#FFFFFF' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4, borderWidth: 2, borderColor: '#E5E7EB' },
  editBadgeText: { fontSize: 12 },
  name: { fontSize: 22, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  phone: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  roleSwitcher: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 4, marginBottom: 16 },
  roleBtn: { flex: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignItems: 'center' },
  roleBtnActive: { backgroundColor: '#10B981' },
  roleBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  roleBtnTextActive: { color: '#FFFFFF' },
  creditRow: { flexDirection: 'row', gap: 12 },
  creditBox: { flex: 1, backgroundColor: '#ECFDF5', borderRadius: 12, padding: 12, alignItems: 'center' },
  creditValue: { fontSize: 24, fontWeight: '700', color: '#10B981' },
  creditLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  scoreBox: { flex: 1, backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12, alignItems: 'center' },
  scoreValue: { fontSize: 24, fontWeight: '700', color: '#F59E0B' },
  scoreLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  menuText: { fontSize: 15, fontWeight: '500', color: '#1A1A1A' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuValue: { fontSize: 14, color: '#6B7280' },
  menuArrow: { fontSize: 18, color: '#9CA3AF', fontWeight: '600' },
  statsCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, marginTop: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '600', color: '#10B981', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
  logoutBtn: { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: '#FECACA' },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
  modalInput: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 14, fontSize: 16, color: '#1A1A1A', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center' },
  modalCancelText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  modalSaveBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#10B981', alignItems: 'center' },
  modalSaveText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default AccountScreen;
