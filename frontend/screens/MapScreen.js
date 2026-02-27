import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { filterJobsByRadius } from "../utils/locationUtils";

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
    'Default': '💼'
  };
  return categoryMap[category] || categoryMap['Default'];
};

const MapScreen = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(5);
  const [allJobs, setAllJobs] = useState([]);
  const [customRadius, setCustomRadius] = useState(null);

  // Filter jobs by radius
  const jobs = useMemo(() => {
    if (!userLocation) return [];
    const effectiveRadius = customRadius || radius;
    return filterJobsByRadius(allJobs, userLocation, effectiveRadius);
  }, [allJobs, userLocation, radius, customRadius]);
  const effectiveRadius = customRadius || radius;

  // Get location on mount
  useEffect(() => {
    getLocation();
  }, []);

  // Refresh jobs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [userLocation])
  );

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setUserLocation({ latitude: 11.0510, longitude: 76.9010 });
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      setUserLocation({ latitude: 11.0510, longitude: 76.9010 });
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
        setAllJobs([...localJobs, ...(data || [])]);
      } else {
        setAllJobs([]);
      }
    } catch (error) {
      setAllJobs([]);
    }
  };

  const handleRadiusChange = (newRadius) => {
    setCustomRadius(null);
    setRadius(newRadius);
  };

  if (!userLocation) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>🗺️</Text>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerIcon}>🗺️</Text>
          <Text style={styles.headerTitle}>Nearby Jobs</Text>
        </View>
        <TouchableOpacity 
          style={styles.listButton}
          onPress={() => navigation.navigate('JobList')}
        >
          <Text style={styles.listButtonText}>📋</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        scrollEnabled={true}
        zoomEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
        showsUserLocation={true}
        followsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
      >
        {/* User Location Marker */}
        <Marker coordinate={userLocation} title="Your Location">
          <View style={styles.userMarker}>
            <Text style={styles.userMarkerText}>📍</Text>
          </View>
        </Marker>

        {/* Search Radius Circle */}
        <Circle
          center={userLocation}
          radius={effectiveRadius * 1000}
          strokeColor="rgba(102,126,234,0.4)"
          fillColor="rgba(102,126,234,0.08)"
          strokeWidth={2}
        />

        {/* Job Markers with Category Emoji */}
        {jobs.map((job) => (
          <Marker
            key={job._id}
            coordinate={{ 
              latitude: job.location?.latitude || 11.0510, 
              longitude: job.location?.longitude || 76.9010 
            }}
            title={job.title}
            description={`₹${job.paymentAmount} • ${job.category}`}
            pinColor="#48BB78"
            onCalloutPress={() => {
              navigation.navigate("JobDetails", { jobId: job._id });
            }}
          >
            <View style={styles.jobMarker}>
              <Text style={styles.jobMarkerText}>{getCategoryEmoji(job.category)}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Controls Card */}
      <View style={styles.controlsCard}>
        <View style={styles.radiusInfo}>
          <Text style={styles.radiusInfoText}>Search within:</Text>
          <Text style={styles.radiusValue}>{effectiveRadius} km</Text>
        </View>

        <View style={styles.radiusButtons}>
          {[2, 5, 10].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.radiusButton,
                radius === value && !customRadius && styles.radiusButtonActive,
              ]}
              onPress={() => handleRadiusChange(value)}
            >
              <Text
                style={[
                  styles.radiusButtonText,
                  radius === value && !customRadius && styles.radiusButtonTextActive,
                ]}
              >
                {value} km
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.radiusButton,
              customRadius && styles.radiusButtonActive,
            ]}
            onPress={() => setCustomRadius(customRadius === null ? 15 : (customRadius === 15 ? null : 15))}
          >
            <Text
              style={[
                styles.radiusButtonText,
                customRadius && styles.radiusButtonTextActive,
              ]}
            >
              {customRadius ? `${customRadius} km` : 'Custom'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.countInfo}>
          <Text style={styles.countIcon}>📍</Text>
          <Text style={styles.countLabel}>Jobs Found</Text>
          <Text style={styles.countValue}>{jobs.length}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E2E8F0", paddingTop: 50 },
  backButton: { fontSize: 16, fontWeight: "600", color: "#667EEA", marginRight: 16 },
  headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  headerIcon: { fontSize: 20 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#2D3748" },
  listButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0E7FF", justifyContent: "center", alignItems: "center" },
  listButtonText: { fontSize: 18 },
  map: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F9FD" },
  loadingEmoji: { fontSize: 64, marginBottom: 16 },
  loadingText: { fontSize: 18, fontWeight: "bold", color: "#2D3748" },
  userMarker: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#667EEA", justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#fff" },
  userMarkerText: { fontSize: 20 },
  jobMarker: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#48BB78", justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#fff" },
  jobMarkerText: { fontSize: 22 },
  controlsCard: { position: "absolute", bottom: 20, left: 16, right: 16, backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 5 },
  radiusInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F0E7FF" },
  radiusInfoText: { fontSize: 13, color: "#718096", fontWeight: "600" },
  radiusValue: { fontSize: 18, fontWeight: "bold", color: "#667EEA" },
  radiusButtons: { flexDirection: "row", gap: 10, marginBottom: 14 },
  radiusButton: { flex: 1, backgroundColor: "#F7FAFC", padding: 11, borderRadius: 10, alignItems: "center", borderWidth: 2, borderColor: "#E2E8F0" },
  radiusButtonActive: { backgroundColor: "#667EEA", borderColor: "#667EEA" },
  radiusButtonText: { fontSize: 14, color: "#718096", fontWeight: "600" },
  radiusButtonTextActive: { color: "#fff", fontWeight: "700" },
  countInfo: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F0E7FF" },
  countIcon: { fontSize: 18 },
  countLabel: { fontSize: 12, color: "#A0AEC0", fontWeight: "600", textTransform: "uppercase" },
  countValue: { fontSize: 20, fontWeight: "bold", color: "#48BB78" },
});

export default MapScreen;
