import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export const authService = {
  sendOTP: async (phone) => {
    const response = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return response.json();
  },

  verifyOTP: async (phone, otp) => {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    const data = await response.json();
    if (data.token) {
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
    }
    return data;
  },

  setRole: async (role) => {
    const token = await AsyncStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/user/set-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ role }),
    });
    const data = await response.json();
    await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
    return data;
  },

  validateToken: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) return null;
    
    try {
      const response = await fetch(`${API_URL}/auth/validate`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401) {
        await authService.logout();
        return null;
      }
      return response.json();
    } catch (error) {
      return null;
    }
  },

  getToken: async () => {
    return await AsyncStorage.getItem('auth_token');
  },

  getUserData: async () => {
    const data = await AsyncStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  },
};
