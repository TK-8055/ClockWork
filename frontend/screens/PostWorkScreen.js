import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const PostWorkScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [payment, setPayment] = useState('');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Getting location...');
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const categories = ['Cleaning', 'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'Cooking', 'Mechanic', 'AC Repair', 'Gardening', 'Delivery'];

  useEffect(() => {
    getCurrentLocation();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        
        // If user is a worker, show alert and redirect
        if (user.role === 'WORKER') {
          Alert.alert(
            '⚠️ Workers Cannot Post Jobs',
            'Workers can only apply for jobs. Please switch to a User account to post jobs.',
            [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        const addr = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        if (addr[0]) {
          setAddress(`${addr[0].subregion || addr[0].district}, ${addr[0].city}`);
        }
      }
    } catch (error) {
      setLocation({ latitude: 11.0510, longitude: 76.9010 });
      setAddress('Kuniyamuthur, Coimbatore');
    }
  };

  const handlePost = async () => {
    if (!title.trim()) return Alert.alert('Error', 'Please enter job title');
    if (!category) return Alert.alert('Error', 'Please select a category');
    if (!description || !description.trim()) return Alert.alert('Error', 'Please enter description');
    if (description.trim().length < 20) return Alert.alert('Error', 'Description must be at least 20 characters');
    if (!payment) return Alert.alert('Error', 'Please enter payment amount');
    const paymentAmount = parseInt(payment);
    if (isNaN(paymentAmount) || paymentAmount < 50) return Alert.alert('Error', 'Minimum payment amount is 50 Credits');
    if (!location) return Alert.alert('Error', 'Location not available');

    setLoading(true);
    try {
      // Try API first
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const response = await fetch(`${API_URL}/jobs`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            category,
            description,
            paymentAmount: parseInt(payment),
            location: { ...location, address },
            images: []
          }),
        });

        if (response.ok) {
          Alert.alert('✅ Success', 'Job posted successfully!\n\nYou earned 10 credits for posting!');
          navigation.goBack();
          return;
        }
      } catch (apiError) {
        console.log('API not available, saving locally');
      }

      // Get user data for postedBy field
      let postedByInfo = { name: 'Unknown', phoneNumber: 'Not provided' };
      let userCreds = await AsyncStorage.getItem('user_data');
      if (userCreds) {
        const user = JSON.parse(userCreds);
        postedByInfo = {
          _id: user._id,
          name: user.name || 'Unknown',
          phoneNumber: user.phoneNumber || 'Not provided'
        };
      }

      // Save locally if API fails
      const newJob = {
        id: Date.now().toString(),
        _id: Date.now().toString(),
        title,
        category,
        description,
        paymentAmount: parseInt(payment),
        platformFee: Math.round(parseInt(payment) * 0.1),
        workerPayment: parseInt(payment) - Math.round(parseInt(payment) * 0.1),
        location: { ...location, address },
        images: [],
        status: 'POSTED',
        createdAt: new Date().toISOString(),
        postedBy: postedByInfo,
      };

      // Get existing jobs from storage
      const existingJobs = await AsyncStorage.getItem('local_jobs');
      const jobs = existingJobs ? JSON.parse(existingJobs) : [];
      jobs.unshift(newJob);
      await AsyncStorage.setItem('local_jobs', JSON.stringify(jobs));

      // Update user credits
      if (userCreds) {
        const user = JSON.parse(userCreds);
        user.credits = (user.credits || 100) + 10;
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
      }

      Alert.alert('✅ Success', 'Job posted successfully!\n\nYou earned 10 credits for posting!');
      navigation.goBack();
    } catch (error) {
      console.error('Error posting job:', error);
      Alert.alert('Error', 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Work</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Job Title</Text>
        <TextInput
          style={styles.inputField}
          placeholder="e.g. Plumber needed for bathroom repair"
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Work Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, category === cat && styles.categoryActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe the work clearly"
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Payment Amount (Credits)</Text>
        <View style={styles.paymentInput}>
          <Text style={styles.currency}>💳</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount (min 50)"
            placeholderTextColor="#9CA3AF"
            value={payment}
            onChangeText={setPayment}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.uploadBtn}>
          <Text style={styles.uploadText}>📷 Upload Image (Optional)</Text>
        </TouchableOpacity>

        <View style={styles.locationCard}>
          <Text style={styles.locationLabel}>📍 Location</Text>
          <Text style={styles.locationText}>{address}</Text>
          <Text style={styles.locationSubtext}>Auto-detected from GPS</Text>
        </View>

        <View style={styles.rewardCard}>
          <Text style={styles.rewardTitle}>🎁 Post for FREE!</Text>
          <Text style={styles.rewardText}>Get 10 credits reward for every job you post</Text>
        </View>

        <TouchableOpacity style={styles.postBtn} onPress={handlePost} disabled={loading}>
          <Text style={styles.postText}>{loading ? 'Posting...' : 'Post Job (FREE)'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { fontSize: 16, fontWeight: '600', color: '#2563EB' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  categoryChip: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  categoryActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  categoryText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  categoryTextActive: { color: '#FFFFFF' },
  inputField: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1A1A1A', marginBottom: 24 },
  textArea: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16, fontSize: 15, color: '#1A1A1A', height: 120, textAlignVertical: 'top', marginBottom: 24 },
  paymentInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, marginBottom: 24 },
  currency: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', paddingLeft: 16 },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 16, fontSize: 16, color: '#1A1A1A' },
  uploadBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 24 },
  uploadText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  locationCard: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16, marginBottom: 24 },
  locationLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  locationText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  locationSubtext: { fontSize: 12, color: '#9CA3AF' },
  rewardCard: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#10B981', borderRadius: 8, padding: 16, marginBottom: 24 },
  rewardTitle: { fontSize: 15, fontWeight: '700', color: '#10B981', marginBottom: 4 },
  rewardText: { fontSize: 13, color: '#059669' },
  postBtn: { backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginBottom: 32 },
  postText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default PostWorkScreen;
