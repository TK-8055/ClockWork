import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { JobContext } from "../context/JobContext";
import { calculateDistance } from "../utils/locationUtils";

const MapScreen = ({ navigation }) => {
  const { jobs } = useContext(JobContext);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(5);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      filterJobsByDistance();
    }
  }, [userLocation, radius, jobs]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "📍 Permission Required",
          "Location permission is needed to show nearby jobs on the map.",
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      Alert.alert(
        "❌ Error",
        "Failed to get your location. Please check your settings.",
      );
    }
  };

  const filterJobsByDistance = () => {
    const availableJobs = jobs.filter((job) => job.status === "POSTED");
    const nearby = availableJobs.filter((job) => {
      const distance = parseFloat(
        calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          job.latitude,
          job.longitude,
        ),
      );
      return distance <= radius;
    });
    setFilteredJobs(nearby);
  };

  if (!userLocation) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>🗺️</Text>
        <Text style={styles.loadingText}>Loading map...</Text>
        <Text style={styles.loadingSubtext}>Getting your location</Text>
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
        <View style={styles.headerSpacer} />
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
      >
        {/* User Location Marker */}
        <Marker
          coordinate={userLocation}
          title="Your Location"
          pinColor="#667EEA"
        >
          <View style={styles.userMarker}>
            <Text style={styles.userMarkerText}>📍</Text>
          </View>
        </Marker>

        {/* Search Radius Circle */}
        <Circle
          center={userLocation}
          radius={radius * 1000}
          strokeColor="rgba(102,126,234,0.4)"
          fillColor="rgba(102,126,234,0.08)"
          strokeWidth={2}
        />

        {/* Job Markers */}
        {filteredJobs.map((job) => (
          <Marker
            key={job.id}
            coordinate={{ latitude: job.latitude, longitude: job.longitude }}
            title={job.title}
            description={`₹${job.wage} • ${job.duration}`}
            pinColor="#48BB78"
            onPress={() => setSelectedJob(job)}
            onCalloutPress={() => {
              setSelectedJob(null);
              navigation.navigate("JobDetails", { job });
            }}
          >
            <View style={styles.jobMarker}>
              <Text style={styles.jobMarkerText}>💼</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Controls Card */}
      <View style={styles.controlsCard}>
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
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.countInfo}>
          <Text style={styles.countIcon}>📍</Text>
          <Text style={styles.countLabel}>Jobs Found</Text>
          <Text style={styles.countValue}>{filteredJobs.length}</Text>
        </View>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoItemIcon}>🟣</Text>
          <Text style={styles.infoItemText}>Your Location</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoItemIcon}>🟢</Text>
          <Text style={styles.infoItemText}>Job Location</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667EEA",
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2D3748",
  },
  headerSpacer: {
    width: 50,
  },
  map: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FD",
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#718096",
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#667EEA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  userMarkerText: {
    fontSize: 20,
  },
  jobMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#48BB78",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  jobMarkerText: {
    fontSize: 20,
  },
  controlsCard: {
    position: "absolute",
    bottom: 65,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  radiusInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E7FF",
  },
  radiusInfoText: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "600",
  },
  radiusValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#667EEA",
  },
  radiusButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  radiusButton: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    padding: 11,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  radiusButtonActive: {
    backgroundColor: "#667EEA",
    borderColor: "#667EEA",
  },
  radiusButtonText: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "600",
  },
  radiusButtonTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  countInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0E7FF",
  },
  countIcon: {
    fontSize: 18,
  },
  countLabel: {
    fontSize: 12,
    color: "#A0AEC0",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  countValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#48BB78",
  },
  bottomInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FD",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoItemIcon: {
    fontSize: 16,
  },
  infoItemText: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "600",
  },
});

export default MapScreen;
