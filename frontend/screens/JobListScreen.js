import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import { JobContext } from "../context/JobContext";
import JobCard from "../components/JobCard";
import { calculateDistance } from "../utils/locationUtils";

const JobListScreen = ({ navigation }) => {
  const { jobs } = useContext(JobContext);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [jobsWithDistance, setJobsWithDistance] = useState([]);
  const [radius, setRadius] = useState(5);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      calculateJobDistances();
    }
  }, [userLocation, jobs, radius]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to find nearby jobs.",
        );
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
      Alert.alert("Error", "Failed to get location. Please try again.");
      setLoading(false);
    }
  };

  const calculateJobDistances = () => {
    const availableJobs = jobs.filter((job) => job.status === "POSTED");

    const jobsWithDist = availableJobs.map((job) => ({
      ...job,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        job.latitude,
        job.longitude,
      ),
    }));

    const filtered = jobsWithDist.filter(
      (job) => parseFloat(job.distance) <= radius,
    );
    const sortedJobs = filtered.sort(
      (a, b) => parseFloat(a.distance) - parseFloat(b.distance),
    );
    setJobsWithDistance(sortedJobs);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>Finding jobs near you...</Text>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>📍</Text>
        <Text style={styles.errorText}>Unable to get location</Text>
        <Text style={styles.errorSubtext}>Please enable location services</Text>
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
              {jobsWithDistance.length} opportunities • {radius} km radius
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
            {[2, 5, 10].map((dist) => (
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
        data={jobsWithDistance}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            distance={item.distance}
            onPress={() => navigation.navigate("JobDetails", { job: item })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No jobs within {radius} km</Text>
            <Text style={styles.emptySubtext}>
              Try increasing the search radius to find more opportunities
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        scrollIndicatorInsets={{ right: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerCard: {
    backgroundColor: "#667EEA",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#667EEA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerGreeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerStats: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  mapButtonHeader: {
    backgroundColor: "#F59E0B",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  mapButtonIcon: {
    fontSize: 24,
  },
  filterSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 12,
    backdropFilter: "blur(10px)",
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
  },
  filterBtnActive: {
    backgroundColor: "#FFFFFF",
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
  },
  filterBtnTextActive: {
    color: "#667EEA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#718096",
    fontWeight: "500",
  },
  errorEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: "#E53E3E",
    fontWeight: "700",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: "#4A5568",
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#A0AEC0",
    textAlign: "center",
  },
});

export default JobListScreen;
