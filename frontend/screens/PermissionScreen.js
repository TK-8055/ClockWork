import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PermissionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (locationStatus === 'granted') {
        await AsyncStorage.setItem('permissions_granted', 'true');
        navigation.replace('Main');
      } else {
        Alert.alert('Permission Required', 'Location access is required to find nearby jobs');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not request permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    await AsyncStorage.setItem('permissions_denied', 'true');
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.content}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.title}>Permissions Required</Text>
        <Text style={styles.subtitle}>Quick Worker needs access to provide you the best experience</Text>
        
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>📍 Location Access</Text>
          <Text style={styles.permissionDesc}>Find nearby jobs and workers in your area</Text>
        </View>

        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>📷 Camera Access</Text>
          <Text style={styles.permissionDesc}>Upload job images and verify work completion</Text>
        </View>

        <TouchableOpacity 
          style={styles.allowBtn} 
          onPress={handleAllow}
          disabled={loading}
        >
          <Text style={styles.allowText}>Allow Access</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.denyBtn} 
          onPress={handleDeny}
          disabled={loading}
        >
          <Text style={styles.denyText}>Not Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 80, alignItems: 'center' },
  icon: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '600', color: '#1A1A1A', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 40, textAlign: 'center' },
  permissionCard: { width: '100%', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 20, marginBottom: 16 },
  permissionTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  permissionDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  allowBtn: { width: '100%', backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 12 },
  allowText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  denyBtn: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 8, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  denyText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
});

export default PermissionScreen;
