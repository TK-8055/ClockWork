import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const isValidPhone = phone.length === 10 && /^\d+$/.test(phone);

  const handleSendOTP = async () => {
    if (!isValidPhone) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` })
      });
      const data = await response.json();
      
      if (data.success) {
        setOtpSent(true);
        Alert.alert('OTP Sent', 'Check your phone for the OTP code');
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!role) {
      Alert.alert('Select Role', 'Please select User or Worker');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}`, otp: otp || '000000' })
      });
      const data = await response.json();
      
      if (data.success) {
        await AsyncStorage.setItem('auth_token', data.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
        
        // Set role if needed
        if (data.user.role !== role.toUpperCase()) {
          const roleResponse = await fetch(`${API_URL}/user/set-role`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.token}`
            },
            body: JSON.stringify({ role: role.toUpperCase() })
          });
          const roleData = await roleResponse.json();
          if (roleData?.user) {
            await AsyncStorage.setItem('user_data', JSON.stringify(roleData.user));
          }
        }
        
        navigation.replace('Permission');
      } else {
        Alert.alert('Invalid OTP', data.message || 'Please check your OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>ClockWork</Text>
          <Text style={styles.tagline}>Find local work. Get it done.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>{otpSent ? 'Enter OTP to verify' : 'Enter your phone number'}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneInput}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!otpSent}
              />
            </View>
          </View>

          {otpSent && (
            <>
              <Text style={styles.label}>I am a...</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[styles.roleCard, role === 'user' && styles.roleCardSelected]} 
                  onPress={() => setRole('user')}
                >
                  <Text style={styles.roleIcon}>👤</Text>
                  <Text style={[styles.roleTitle, role === 'user' && styles.roleTitleSelected]}>User</Text>
                  <Text style={styles.roleDesc}>Post jobs & hire workers</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.roleCard, role === 'worker' && styles.roleCardSelected]} 
                  onPress={() => setRole('worker')}
                >
                  <Text style={styles.roleIcon}>🔧</Text>
                  <Text style={[styles.roleTitle, role === 'worker' && styles.roleTitleSelected]}>Worker</Text>
                  <Text style={styles.roleDesc}>Find jobs & earn money</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          
          {!otpSent ? (
            <TouchableOpacity 
              style={[styles.btn, (!isValidPhone || loading) && styles.btnDisabled]} 
              onPress={handleSendOTP}
              disabled={!isValidPhone || loading}
            >
              <Text style={styles.btnText}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.btn, (!role || loading) && styles.btnDisabled]} 
                onPress={handleVerifyOTP}
                disabled={!role || loading}
              >
                <Text style={styles.btnText}>
                  {loading ? 'Logging in...' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.footer}>
          By continuing, you agree to our Terms of Service
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 32 },
  logo: { fontSize: 36, fontWeight: '700', color: '#10B981', marginBottom: 8 },
  tagline: { fontSize: 16, color: '#6B7280' },
  form: { flex: 1 },
  title: { fontSize: 28, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1A1A1A' },
  phoneInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8 },
  prefix: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', paddingLeft: 16 },
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  roleCard: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, padding: 20, alignItems: 'center' },
  roleCardSelected: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  roleIcon: { fontSize: 40, marginBottom: 8 },
  roleTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  roleTitleSelected: { color: '#10B981' },
  roleDesc: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  btn: { backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  btnDisabled: { backgroundColor: '#E5E7EB' },
  btnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  linkBtn: { alignItems: 'center', paddingVertical: 8 },
  linkText: { fontSize: 14, color: '#10B981', fontWeight: '600' },
  footer: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', paddingBottom: 32 },
});

export default LoginScreen;
