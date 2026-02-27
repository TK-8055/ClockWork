import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Modal, ActivityIndicator } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCredits } from '../services/api';
import { API_URL } from '../config';
import { filterJobsByRadius, formatDistance, calculateDistance } from '../utils/locationUtils';

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

const HomeScreen = ({ navigation }) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Loading...');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [radius, setRadius] = useState(5);
  const [allJobs, setAllJobs] = useState([]);

  // Get location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Refresh jobs and credits when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadJobs();
      loadCredits();
    }, [])
  );

  const loadCredits = async () => {
    try {
      const data = await getCredits();
      if (data && data.credits !== undefined) {
        setCredits(data.credits);
      }
    } catch (error) {
      console.log('Error fetching credits:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const existingJobs = await AsyncStorage.getItem('local_jobs');
        const localJobs = existingJobs ? JSON.parse(existingJobs) : [];
        const mergedJobs = [...localJobs, ...(data || [])];
        setAllJobs(mergedJobs);
        setJobs(mergedJobs);
      } else {
        setAllJobs([]);
        setJobs([]);
      }
    } catch (error) {
      console.log('API not available, no jobs');
      setAllJobs([]);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs by radius
  const filteredJobs = useMemo(() => {
    if (!location) return [];
    return filterJobsByRadius(allJobs, location, radius);
  }, [allJobs, location, radius]);

  // Update jobs when filtered jobs change
  useEffect(() => {
    setJobs(filteredJobs);
  }, [filteredJobs]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        const addr = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        if (addr[0]) setAddress(`${addr[0].subregion || addr[0].district}, ${addr[0].city}`);
      }
    } catch (error) {
      setLocation({ latitude: 11.0510, longitude: 76.9010 });
      setAddress('Coimbatore');
    }
  };

  const handlePinTap = (job) => {
    setSelectedJob(job);
    setShowBottomSheet(true);
  };

  if (!location || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.topBar}>
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>📍 Current Location</Text>
          <Text style={styles.locationText}>{address}</Text>
        </View>
        <View style={styles.topBarButtons}>
          <TouchableOpacity 
            style={styles.creditsBtn} 
            onPress={() => navigation.navigate('Credit')}
          >
            <Text style={styles.creditsIcon}>💳</Text>
            <Text style={styles.creditsText}>₹{credits}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.iconText}>🔔</Text>
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.mapContainer} onPress={() => navigation.navigate('Map')}>
        <MapView
          style={styles.map}
          region={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          {/* User Location Marker */}
          <Marker coordinate={location} title="Your Location">
            <View style={styles.userMarker}>
              <Text style={styles.userMarkerText}>📍</Text>
            </View>
          </Marker>

          {/* Search Radius Circle */}
          <Circle
            center={location}
            radius={radius * 1000}
            strokeColor="rgba(102,126,234,0.4)"
            fillColor="rgba(102,126,234,0.08)"
            strokeWidth={2}
          />

          {jobs.map(job => (
            <Marker
              key={job._id}
              coordinate={{ latitude: job.location?.latitude || 11.0510, longitude: job.location?.longitude || 76.9010 }}
              onPress={() => handlePinTap(job)}
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerBubble}>
                  <Text style={styles.markerText}>{getCategoryEmoji(job.category)}</Text>
                </View>
                <View style={styles.markerArrow} />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Radius Controls */}
        <View style={styles.mapControls}>
          <View style={styles.radiusInfo}>
            <Text style={styles.radiusInfoText}>Search within:</Text>
            <Text style={styles.radiusValue}>{radius} km</Text>
          </View>

          <View style={styles.radiusButtons}>
            {[2, 5, 10].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.radiusButton,
                  radius === value && styles.radiusButtonActive,
                ]}
                onPress={() => setRadius(value)}
              >
                <Text
                  style={[
                    styles.radiusButtonText,
                    radius === value && styles.radiusButtonTextActive,
                  ]}
                >
                  {value} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Nearby Jobs</Text>
          <Text style={styles.listCount}>{jobs.length} available</Text>
        </View>

        {jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭 No jobs available</Text>
            <Text style={styles.emptySubtext}>Post a job to get started!</Text>
          </View>
        ) : (
          <ScrollView style={styles.jobList} showsVerticalScrollIndicator={false}>
            {jobs.map(job => {
              const distance = location && job.location ?
                calculateDistance(
                  location.latitude,
                  location.longitude,
                  job.location.latitude || 11.0510,
                  job.location.longitude || 76.9010
                ) : 0;

              return (
                <View key={job._id} style={styles.jobCard}>
                  <View style={styles.jobLeft}>
                    <View style={styles.jobHeader}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Text style={styles.jobCategory}>{getCategoryEmoji(job.category)} {job.category}</Text>
                    </View>
                    <View style={styles.jobMeta}>
                      <Text style={styles.jobDistance}>📍 {job.location?.address || 'Location not specified'}</Text>
                      {distance > 0 && (
                        <Text style={styles.jobDistanceKm}>📏 {formatDistance(distance)}</Text>
                      )}
                    </View>
                    <Text style={styles.jobPay}>💰 ₹{job.paymentAmount}</Text>
                  </View>
                  <TouchableOpacity style={styles.applyBtn} onPress={() => navigation.navigate('JobDetails', { jobId: job._id })}>
                    <Text style={styles.applyText}>View</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      <Modal visible={showBottomSheet} transparent={true} animationType="slide" onRequestClose={() => setShowBottomSheet(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowBottomSheet(false)}>
          <View style={styles.bottomSheet}>
            {selectedJob && (
              <View>
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>{selectedJob.title}</Text>
                <Text style={styles.sheetCategory}>{getCategoryEmoji(selectedJob.category)} {selectedJob.category}</Text>
                <View style={styles.sheetRow}>
                  <Text style={styles.sheetLabel}>Location</Text>
                  <Text style={styles.sheetValue}>{selectedJob.location?.address}</Text>
                </View>
                <View style={styles.sheetRow}>
                  <Text style={styles.sheetLabel}>Payment</Text>
                  <Text style={styles.sheetPay}>₹{selectedJob.paymentAmount}</Text>
                </View>
                <TouchableOpacity style={styles.viewDetailsBtn} onPress={() => { setShowBottomSheet(false); navigation.navigate('JobDetails', { jobId: selectedJob._id }); }}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { fontSize: 16, color: '#6B7280' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  locationInfo: { flex: 1 },
  locationLabel: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  locationText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  topBarButtons: { flexDirection: 'row', gap: 8 },
  creditsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, gap: 4 },
  creditsIcon: { fontSize: 14 },
  creditsText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  iconText: { fontSize: 18 },
  badge: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', position: 'absolute', top: 8, right: 8 },
  mapContainer: { height: '48%', position: 'relative' },
  map: { flex: 1 },
  markerContainer: { alignItems: 'center' },
  markerBubble: { backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 2, borderColor: '#FFFFFF' },
  markerText: { fontSize: 16 },
  markerArrow: { width: 0, height: 0, borderStyle: 'solid', borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#10B981', marginTop: -2 },
  userMarker: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#667EEA', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
  userMarkerText: { fontSize: 20 },
  mapControls: { position: 'absolute', bottom: 12, left: 12, right: 12, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  radiusInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  radiusInfoText: { fontSize: 12, color: '#718096', fontWeight: '600' },
  radiusValue: { fontSize: 16, fontWeight: 'bold', color: '#667EEA' },
  radiusButtons: { flexDirection: 'row', gap: 8 },
  radiusButton: { flex: 1, backgroundColor: '#F7FAFC', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0' },
  radiusButtonActive: { backgroundColor: '#667EEA', borderColor: '#667EEA' },
  radiusButtonText: { fontSize: 13, color: '#718096', fontWeight: '600' },
  radiusButtonTextActive: { color: '#FFFFFF', fontWeight: '700' },
  jobDistanceKm: { fontSize: 13, color: '#667EEA', fontWeight: '600' },
  listContainer: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  listTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  listCount: { fontSize: 14, fontWeight: '600', color: '#10B981', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  jobList: { flex: 1, paddingHorizontal: 16 },
  jobCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  jobLeft: { flex: 1, marginRight: 12 },
  jobHeader: { marginBottom: 8 },
  jobTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  jobCategory: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  jobMeta: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  jobDistance: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  jobPay: { fontSize: 18, fontWeight: '700', color: '#10B981' },
  applyBtn: { backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  applyText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  sheetCategory: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  sheetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sheetLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  sheetValue: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  sheetPay: { fontSize: 20, fontWeight: '700', color: '#10B981' },
  viewDetailsBtn: { backgroundColor: '#10B981', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  viewDetailsText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

export default HomeScreen;
