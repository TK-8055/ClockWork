import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Modal, ActivityIndicator } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getJobs } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Loading...');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentLocation();
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

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
      setAddress('Kuniyamuthur, Coimbatore');
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
        <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {jobs.map(job => (
            <Marker key={job._id} coordinate={{ latitude: job.location.latitude, longitude: job.location.longitude }} onPress={() => handlePinTap(job)}>
              <View style={styles.markerContainer}>
                <View style={styles.markerBubble}>
                  <Text style={styles.markerText}>₹{job.paymentAmount}</Text>
                </View>
                <View style={styles.markerArrow} />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Nearby Jobs</Text>
          <Text style={styles.listCount}>{jobs.length} available</Text>
        </View>

        <ScrollView style={styles.jobList} showsVerticalScrollIndicator={false}>
          {jobs.map(job => (
            <View key={job._id} style={styles.jobCard}>
              <View style={styles.jobLeft}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobCategory}>🏷️ {job.category}</Text>
                </View>
                <View style={styles.jobMeta}>
                  <Text style={styles.jobDistance}>📍 {job.location.address}</Text>
                </View>
                <Text style={styles.jobPay}>💰 ₹{job.paymentAmount}</Text>
              </View>
              <TouchableOpacity style={styles.applyBtn} onPress={() => navigation.navigate('JobDetails', { jobId: job._id })}>
                <Text style={styles.applyText}>View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      <Modal visible={showBottomSheet} transparent={true} animationType="slide" onRequestClose={() => setShowBottomSheet(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowBottomSheet(false)}>
          <View style={styles.bottomSheet}>
            {selectedJob && (
              <>
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>{selectedJob.title}</Text>
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
              </>
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
  notificationBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  notificationIcon: { fontSize: 18 },
  badge: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', position: 'absolute', top: 8, right: 8 },
  mapContainer: { height: '48%' },
  map: { flex: 1 },
  markerContainer: { alignItems: 'center' },
  markerBubble: { backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 2, borderColor: '#FFFFFF' },
  markerText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  markerArrow: { width: 0, height: 0, borderStyle: 'solid', borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#10B981', marginTop: -2 },
  listContainer: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  listTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  listCount: { fontSize: 14, fontWeight: '600', color: '#10B981', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  jobList: { flex: 1, paddingHorizontal: 16 },
  jobCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  jobLeft: { flex: 1, marginRight: 12 },
  jobHeader: { marginBottom: 8 },
  jobTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  jobCategory: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  jobMeta: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  jobDistance: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  jobTime: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  jobPay: { fontSize: 18, fontWeight: '700', color: '#10B981' },
  applyBtn: { backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  applyText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  sheetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sheetLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  sheetValue: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  sheetPay: { fontSize: 20, fontWeight: '700', color: '#10B981' },
  viewDetailsBtn: { backgroundColor: '#10B981', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  viewDetailsText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

export default HomeScreen;
