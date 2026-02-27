import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      setTimeout(() => {
        if (token && userData) {
          navigation.replace('Main');
        } else {
          navigation.replace('Login');
        }
      }, 1500);
    } catch (error) {
      setTimeout(() => {
        navigation.replace('Login');
      }, 1500);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Text style={styles.logo}>ClockWork</Text>
      <Text style={styles.tagline}>Find local work. Get it done.</Text>
      <ActivityIndicator size="large" color="#10B981" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 36, fontWeight: '600', color: '#1A1A1A', marginBottom: 12, letterSpacing: -0.8 },
  tagline: { fontSize: 16, color: '#6B7280', fontWeight: '500', marginBottom: 40 },
  loader: { marginTop: 20 },
});

export default SplashScreen;
