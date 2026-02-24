import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { authService } from '../services/auth';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const isValidPhone = phone.length === 10 && /^\d+$/.test(phone);
  const isValidOTP = otp.length === 6 && /^\d+$/.test(otp);

  const handleSendOTP = async () => {
    if (!isValidPhone) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.sendOTP(`+91${phone}`);
      if (result.success) {
        setStep('otp');
        setResendTimer(60);
        const interval = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        Alert.alert('Error', result.message || 'Could not send OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!isValidOTP) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.verifyOTP(`+91${phone}`, otp);
      if (result.success) {
        if (!result.user.role) {
          setStep('role');
        } else {
          navigation.replace('Permission');
        }
      } else {
        Alert.alert('Error', result.message || 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (selectedRole) => {
    setLoading(true);
    try {
      const result = await authService.setRole(selectedRole);
      if (result.success) {
        navigation.replace('Permission');
      } else {
        Alert.alert('Error', 'Could not set role');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {step === 'phone' && (
        <View style={styles.content}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Enter your mobile number</Text>
          
          <View style={styles.phoneInput}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!loading}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.btn, (!isValidPhone || loading) && styles.btnDisabled]} 
            onPress={handleSendOTP}
            disabled={!isValidPhone || loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Send OTP</Text>}
          </TouchableOpacity>
        </View>
      )}

      {step === 'otp' && (
        <View style={styles.content}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>Enter 6-digit code sent to +91 {phone}</Text>
          
          <TextInput
            style={styles.inputFull}
            placeholder="Enter OTP"
            placeholderTextColor="#9CA3AF"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
          
          <TouchableOpacity 
            style={[styles.btn, (!isValidOTP || loading) && styles.btnDisabled]} 
            onPress={handleVerifyOTP}
            disabled={!isValidOTP || loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Verify</Text>}
          </TouchableOpacity>
          
          <View style={styles.resendRow}>
            <TouchableOpacity onPress={() => setStep('phone')} disabled={loading}>
              <Text style={styles.link}>Change Number</Text>
            </TouchableOpacity>
            {resendTimer > 0 ? (
              <Text style={styles.timer}>Resend in {resendTimer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleSendOTP} disabled={loading}>
                <Text style={styles.link}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {step === 'role' && (
        <View style={styles.content}>
          <Text style={styles.title}>Select Role</Text>
          <Text style={styles.subtitle}>How will you use Quick Worker?</Text>
          
          <TouchableOpacity 
            style={styles.roleCard} 
            onPress={() => handleRoleSelect('user')}
            disabled={loading}
          >
            <Text style={styles.roleIcon}>👤</Text>
            <Text style={styles.roleTitle}>User</Text>
            <Text style={styles.roleDesc}>Post work and hire workers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.roleCard} 
            onPress={() => handleRoleSelect('worker')}
            disabled={loading}
          >
            <Text style={styles.roleIcon}>🔧</Text>
            <Text style={styles.roleTitle}>Worker</Text>
            <Text style={styles.roleDesc}>Find work and earn money</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="#10B981" style={styles.loader} />}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 80 },
  title: { fontSize: 32, fontWeight: '600', color: '#1A1A1A', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 40 },
  phoneInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, marginBottom: 24 },
  prefix: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', paddingLeft: 16 },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 16, fontSize: 16, color: '#1A1A1A' },
  inputFull: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: '#1A1A1A', marginBottom: 24 },
  btn: { backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  btnDisabled: { backgroundColor: '#E5E7EB' },
  btnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  resendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { fontSize: 14, color: '#10B981', fontWeight: '600' },
  timer: { fontSize: 14, color: '#6B7280' },
  roleCard: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 24, marginBottom: 16, alignItems: 'center' },
  roleIcon: { fontSize: 48, marginBottom: 12 },
  roleTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  roleDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  loader: { marginTop: 20 },
});

export default LoginScreen;
