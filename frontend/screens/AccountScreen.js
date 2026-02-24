import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Switch, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWorkerProfile, updateWorkerProfile } from '../services/api';

const AccountScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        if (parsedUser.role === 'WORKER') {
          const profileData = await getWorkerProfile();
          setProfile(profileData);
          setAvailable(profileData?.availabilityStatus === 'AVAILABLE');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityToggle = async (value) => {
    setAvailable(value);
    try {
      await updateWorkerProfile({ availabilityStatus: value ? 'AVAILABLE' : 'BUSY' });
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Splash');
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
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.phone}>{user?.phoneNumber || 'No phone'}</Text>
        <Text style={styles.role}>{user?.role === 'WORKER' ? '👷 Worker' : '👤 User'}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {user?.role === 'WORKER' && (
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
            {profile && (
              <View style={styles.statsCard}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profile.totalJobsCompleted || 0}</Text>
                  <Text style={styles.statLabel}>Jobs Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>₹{profile.totalEarnings || 0}</Text>
                  <Text style={styles.statLabel}>Total Earned</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>⭐ {profile.rating?.toFixed(1) || 'N/A'}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>🌐 Language</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>❓ Help & Support</Text>
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
  header: { backgroundColor: '#FFFFFF', paddingTop: 60, paddingBottom: 32, paddingHorizontal: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 24, fontWeight: '600', color: '#FFFFFF' },
  name: { fontSize: 20, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  phone: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  role: { fontSize: 14, fontWeight: '500', color: '#10B981' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  menuText: { fontSize: 15, fontWeight: '500', color: '#1A1A1A' },
  statsCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '600', color: '#10B981', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  logoutBtn: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: '#E5E7EB' },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
});

export default AccountScreen;
