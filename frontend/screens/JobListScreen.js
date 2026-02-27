import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { calculateDistance } from "../utils/locationUtils";

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

const JobListScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [radius, setRadius] = useState(10);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setUserLocation({ latitude: 11.0510, longitude: 76.9010 });
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLoading(false);
    } catch (error) {
      setUserLocation({ latitude: 11.0510, longitude: 76.9010 });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      loadJobs();
    }
  }, [userLocation, radius]);

  const loadJobs = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const filtered = (data || []).filter((job) => {
          if (!job.location) return false;
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            job.location.latitude || 11.0510,
            job.location.longitude || 76.9010
          );
          return distance <= radius;
        });
        setJobs(filtered);
      } else {
        setJobs([]);
      }
    } catch (error) {
      setJobs([]);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>Finding jobs near you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerGreeting}>Available Jobs</Text>
            <Text style={styles.headerStats}>
              {jobs.length} opportunities • {radius} km radius
            </Text>
          </View>
          <TouchableOpacity
            style={styles.mapButtonHeader}
            onPress={() => navigation.navigate("Map")}
          >
            <Text style={styles.mapButtonIcon}>🗺️</Text>
          </TouchableOpacity>
        </View>

        {/* Distance Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Search Radius</Text>
          <View style={styles.filterButtons}>
            {[2, 5, 10, 20].map((dist) => (
              <TouchableOpacity
                key={dist}
                style={[
                  styles.filterBtn,
                  radius === dist && styles.filterBtnActive,
                ]}
                onPress={() => setRadius(dist)}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    radius === dist && styles.filterBtnTextActive,
                  ]}
                >
                  {dist} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Jobs List */}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.jobCard}
            onPress={() => navigation.navigate("JobDetails", { jobId: item._id })}
          >
            <View style={styles.jobLeft}>
              <Text style={styles.jobTitle}>{item.title}</Text>
              <Text style={styles.jobCategory}>{getCategoryEmoji(item.category)} {item.category}</Text>
              <Text style={styles.jobAddress}>📍 {item.location?.address || 'Location not specified'}</Text>
            </View>
            <View style={styles.jobRight}>
              <Text style={styles.jobPay}>₹{item.paymentAmount}</Text>
              {item.platformFee > 0 && (
                <Text style={styles.jobFee}>Worker: ₹{item.workerPayment}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No jobs available</Text>
            <Text style={styles.emptySubtext}>
              Post a job to get started!
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  headerCard: { backgroundColor: '#667EEA', paddingHorizontal: 20, paddingVertical: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerGreeting: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  headerStats: { fontSize: 13, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' },
  mapButtonHeader: { backgroundColor: '#F59E0B', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  mapButtonIcon: { fontSize: 24 },
  filterSection: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 12 },
  filterTitle: { fontSize: 12, fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', marginBottom: 10, textTransform: 'uppercase' },
  filterButtons: { flexDirection: 'row', gap: 8 },
  filterBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center' },
  filterBtnActive: { backgroundColor: '#FFFFFF' },
  filterBtnText: { fontSize: 13, fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)' },
  filterBtnTextActive: { color: '#667EEA' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#718096', fontWeight: '500' },
  listContent: { paddingHorizontal: 16, paddingVertical: 16 },
  jobCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  jobLeft: { flex: 1 },
  jobTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  jobCategory: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  jobAddress: { fontSize: 13, color: '#9CA3AF' },
  jobRight: { alignItems: 'flex-end', justifyContent: 'center' },
  jobPay: { fontSize: 18, fontWeight: '700', color: '#10B981' },
  jobFee: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  emptyContainer: { padding: 60, alignItems: 'center' },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 18, color: '#4A5568', fontWeight: '700', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#A0AEC0', textAlign: 'center' },
});

export default JobListScreen;
