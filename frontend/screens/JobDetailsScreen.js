import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { JobContext } from "../context/JobContext";

const JobDetailsScreen = ({ route, navigation }) => {
  const { job } = route.params;
  const { acceptJob } = useContext(JobContext);

  const handleAcceptJob = () => {
    Alert.alert(
      "Confirm & Accept Job",
      "Are you sure you want to accept this job? You can start earning immediately.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept Job",
          onPress: () => {
            acceptJob(job.id);
            Alert.alert(
              "🎉 Success!",
              "Job accepted! Check your dashboard to view activity.",
              [
                {
                  text: "View Status",
                  onPress: () => navigation.navigate("JobStatus"),
                },
              ],
            );
          },
          style: "default",
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Floating Header */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Job Card */}
      <View style={styles.jobCard}>
        <View style={styles.jobIconContainer}>
          <Text style={styles.jobIcon}>💼</Text>
        </View>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <Text style={styles.jobDescription}>{job.description}</Text>
      </View>

      {/* Key Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxIcon}>💰</Text>
          <Text style={styles.statBoxLabel}>Earning</Text>
          <Text style={styles.statBoxValue}>₹{job.wage}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxIcon}>⏱️</Text>
          <Text style={styles.statBoxLabel}>Duration</Text>
          <Text style={styles.statBoxValue}>{job.duration}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxIcon}>📍</Text>
          <Text style={styles.statBoxLabel}>Distance</Text>
          <Text style={styles.statBoxValue}>{job.distance}km</Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>📋 About This Job</Text>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>💵</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Total Payment</Text>
            <Text style={styles.detailValue}>₹{job.wage}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>🕒</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Expected Duration</Text>
            <Text style={styles.detailValue}>{job.duration}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📍</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{job.distance} km away</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>✅</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValueGreen}>Available</Text>
          </View>
        </View>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>✨ Why Take This Job</Text>

        <View style={styles.featureRow}>
          <Text style={styles.featureDot}>✓</Text>
          <Text style={styles.featureText}>
            Instant payment after completion
          </Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureDot}>✓</Text>
          <Text style={styles.featureText}>
            Flexible timing - start whenever you're ready
          </Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureDot}>✓</Text>
          <Text style={styles.featureText}>
            Verified employer - safe & secure
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.acceptButton}
        onPress={handleAcceptJob}
        activeOpacity={0.8}
      >
        <Text style={styles.acceptButtonText}>🎯 Accept This Job</Text>
      </TouchableOpacity>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Once accepted, you'll see it in your dashboard and can start
          immediately.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  floatingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F7FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#667EEA",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A202C",
  },
  placeholder: {
    width: 40,
  },

  /* Job Card */
  jobCard: {
    backgroundColor: "#667EEA",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#667EEA",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  jobIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  jobIcon: {
    fontSize: 40,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  jobDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 20,
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statBoxIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statBoxLabel: {
    fontSize: 11,
    color: "#A0AEC0",
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statBoxValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#667EEA",
    textAlign: "center",
  },

  /* Details Section */
  detailsSection: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A202C",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F7FAFC",
  },
  detailIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 36,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#A0AEC0",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D3748",
  },
  detailValueGreen: {
    fontSize: 16,
    fontWeight: "700",
    color: "#48BB78",
  },

  /* Features */
  featuresSection: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#F7FAFC",
    borderRadius: 20,
    padding: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureDot: {
    fontSize: 18,
    color: "#48BB78",
    marginRight: 12,
    fontWeight: "700",
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "500",
    lineHeight: 20,
  },

  /* Accept Button */
  acceptButton: {
    backgroundColor: "#48BB78",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#48BB78",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  /* Info Box */
  infoBox: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    fontWeight: "500",
    lineHeight: 18,
  },
});

export default JobDetailsScreen;
