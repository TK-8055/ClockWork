import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const getCategoryEmoji = (category) => {
  const categoryMap = {
    'Cleaning': '🧹',
    'Plumbing': '🔧',
    'Electrical': '⚡',
    'Carpentry': '🪵',
    'Cooking': '👨‍🍳',
    'Painting': '🎨',
    'Mechanic': '🔩',
    'AC Repair': '❄️',
    'Delivery': '📦',
    'Gardening': '🌱',
  };
  return categoryMap[category] || '💼';
};

const JobDetailsScreen = ({ navigation, route }) => {
  const { jobId } = route.params || {};
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [user, setUser] = useState(null);

  // Refresh job details when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadJobDetails();
      loadUser();
    }, [jobId])
  );

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error loading user:', error);
    }
  };

  const loadJobDetails = async () => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else {
        Alert.alert('Error', 'Failed to load job details');
      }
    } catch (error) {
      console.error('Error loading job:', error);
      Alert.alert('Error', 'Failed to load job details. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!jobId) return;
    
    if (!user) {
      Alert.alert('Login Required', 'Please login first to apply for jobs');
      navigation.navigate('Login');
      return;
    }

    setApplying(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('✅ Success', 'You have applied for this job! The poster will be notified.');
      } else {
        Alert.alert('Error', data.error || data.message || 'Failed to apply');
      }
    } catch (error) {
      console.error('Apply error:', error);
      Alert.alert('Error', 'Failed to apply. Please check your network connection.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Details</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Details</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Job not found</Text>
        </View>
      </View>
    );
  }

  const jobLocation = { 
    latitude: job.location?.latitude || 11.0510, 
    longitude: job.location?.longitude || 76.9010 
  };

  const isOwner = user && job.postedBy && (user.id === job.postedBy._id || user._id === job.postedBy._id);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.payCard}>
          <Text style={styles.payLabel}>💰 Payment</Text>
          <Text style={styles.payAmount}>₹{job.paymentAmount || 0}</Text>
          {job.platformFee > 0 && (
            <Text style={styles.paySubtext}>Worker gets: ₹{job.workerPayment} (after 10% fee)</Text>
          )}
        </View>

        <Text style={styles.title}>{job.title || 'Job'}</Text>
        <Text style={styles.category}>{getCategoryEmoji(job.category)} {job.category || 'General'}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <Text style={styles.description}>{job.description || 'No description provided'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationText}>{job.location?.address || 'Location not specified'}</Text>
          </View>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={{ latitude: jobLocation.latitude, longitude: jobLocation.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
              scrollEnabled={true}
              zoomEnabled={true}
            >
              <Marker coordinate={jobLocation} />
            </MapView>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Posted By</Text>
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {job.postedBy?.name ? job.postedBy.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{job.postedBy?.name || 'User'}</Text>
              <Text style={styles.userPhone}>📞 {job.postedBy?.phoneNumber || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Show Apply button for anyone who is logged in and not the owner */}
        {!isOwner && user && (
          <TouchableOpacity 
            style={[styles.applyBtn, applying && styles.applyBtnDisabled]} 
            onPress={handleApply}
            disabled={applying}
          >
            <Text style={styles.applyText}>
              {applying ? 'Applying...' : '✓ Apply for This Job'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Show login prompt if not logged in */}
        {!user && (
          <TouchableOpacity 
            style={styles.applyBtn} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.applyText}>Login to Apply</Text>
          </TouchableOpacity>
        )}

        {/* Show owner info */}
        {isOwner && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>ℹ️ This is your posted job</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { fontSize: 16, fontWeight: '600', color: '#10B981' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
  emptyText: { fontSize: 16, color: '#6B7280' },
  payCard: { backgroundColor: '#10B981', borderRadius: 12, padding: 20, marginBottom: 20, alignItems: 'center' },
  payLabel: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  payAmount: { fontSize: 36, fontWeight: '700', color: '#FFFFFF' },
  paySubtext: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  category: { fontSize: 16, fontWeight: '500', color: '#6B7280', marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  description: { fontSize: 15, color: '#374151', lineHeight: 22 },
  locationCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16, marginBottom: 12 },
  locationText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  mapContainer: { height: 200, borderRadius: 12, overflow: 'hidden' },
  map: { flex: 1 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16 },
  userAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userAvatarText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  userName: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  userPhone: { fontSize: 13, color: '#6B7280' },
  applyBtn: { backgroundColor: '#10B981', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  applyBtnDisabled: { backgroundColor: '#E5E7EB' },
  applyText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  infoBox: { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 16, marginTop: 8, marginBottom: 32 },
  infoText: { fontSize: 14, color: '#92400E', textAlign: 'center' },
});

export default JobDetailsScreen;
