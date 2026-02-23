import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { JobContext } from "../context/JobContext";

const JobStatusScreen = ({ navigation }) => {
  const { acceptedJob, completeJob } = useContext(JobContext);

  const handleCompleteJob = () => {
    Alert.alert(
      "✅ Complete This Job?",
      "Mark this job as completed to receive payment and feedback.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: () => {
            completeJob(acceptedJob.id);
            Alert.alert(
              "🎉 Success!",
              "Job completed! Payment is being processed.",
              [
                {
                  text: "OK",
                  onPress: () => navigation.navigate("Home"),
                },
              ],
            );
          },
        },
      ],
    );
  };

  if (!acceptedJob) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📋</Text>
        <Text style={styles.emptyText}>No Active Job</Text>
        <Text style={styles.emptySubtext}>
          You don't have any active jobs right now. Find and accept a job to get
          started!
        </Text>
        <TouchableOpacity
          style={styles.findButton}
          onPress={() => navigation.navigate("JobList")}
        >
          <Text style={styles.findButtonText}>🔍 Find Jobs Nearby</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => navigation.navigate("Map")}
        >
          <Text style={styles.mapButtonText}>🗺️ Browse on Map</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Status Badge */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeIcon}>⚡</Text>
          <Text style={styles.badgeText}>Active</Text>
        </View>
      </View>

      {/* Main Job Card */}
      <View style={styles.jobCard}>
        <View style={styles.jobIconContainer}>
          <Text style={styles.jobIcon}>💼</Text>
        </View>
        <Text style={styles.jobTitle}>{acceptedJob.title}</Text>
        <Text style={styles.jobDescription}>{acceptedJob.description}</Text>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>💵</Text>
            <Text style={styles.statLabel}>Wage</Text>
            <Text style={styles.statValue}>₹{acceptedJob.wage}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{acceptedJob.duration}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={styles.statusBadgeText}>Active</Text>
          </View>
        </View>
      </View>

      {/* Detailed Information */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>📋 Job Information</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Text style={styles.infoIcon}>💼</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Job Type</Text>
            <Text style={styles.infoValue}>{acceptedJob.title}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Text style={styles.infoIcon}>📝</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Description</Text>
            <Text style={styles.infoValue}>{acceptedJob.description}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Text style={styles.infoIcon}>💰</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValueBold}>₹{acceptedJob.wage}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Text style={styles.infoIcon}>⏰</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Expected Duration</Text>
            <Text style={styles.infoValue}>{acceptedJob.duration}</Text>
          </View>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>📊 Progress</Text>

        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View style={styles.progressStep}>
              <View style={[styles.stepCircle, styles.stepCompleted]}>
                <Text style={styles.stepIcon}>✓</Text>
              </View>
              <Text style={styles.stepLabel}>Accepted</Text>
            </View>

            <View style={[styles.stepConnector, styles.stepConnectorActive]} />

            <View style={styles.progressStep}>
              <View style={[styles.stepCircle, styles.stepActive]}>
                <Text style={styles.stepIcon}>⏳</Text>
              </View>
              <Text style={styles.stepLabel}>In Progress</Text>
            </View>

            <View
              style={[styles.stepConnector, styles.stepConnectorInactive]}
            />

            <View style={styles.progressStep}>
              <View style={[styles.stepCircle, styles.stepInactive]}>
                <Text style={styles.stepIcon}>✓</Text>
              </View>
              <Text style={styles.stepLabel}>Completed</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.completeButton}
        onPress={handleCompleteJob}
      >
        <Text style={styles.completeButtonIcon}>✓</Text>
        <Text style={styles.completeButtonText}>Mark Job as Completed</Text>
      </TouchableOpacity>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <View style={styles.tipBox}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Pro Tip</Text>
            <Text style={styles.tipText}>
              Complete the job on time to get better ratings and more job
              opportunities!
            </Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipIcon}>⭐</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Quality Matters</Text>
            <Text style={styles.tipText}>
              Deliver quality work and communicate with the employer for
              positive feedback.
            </Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipIcon}>🎯</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Next Steps</Text>
            <Text style={styles.tipText}>
              After completing, you'll receive payment within 24 hours to your
              wallet.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
  },
  spacer: {
    height: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FD",
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#718096",
    marginBottom: 40,
    textAlign: "center",
    lineHeight: 22,
  },
  findButton: {
    backgroundColor: "#667EEA",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
    shadowColor: "#667EEA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  findButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  mapButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#667EEA",
    width: "100%",
    alignItems: "center",
  },
  mapButtonText: {
    color: "#667EEA",
    fontSize: 16,
    fontWeight: "600",
  },
  floatingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667EEA",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C6F6D5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  badgeIcon: {
    fontSize: 16,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#22543D",
  },
  jobCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  jobIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  jobIcon: {
    fontSize: 40,
  },
  jobTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
    textAlign: "center",
  },
  jobDescription: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: "#A0AEC0",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#48BB78",
  },
  detailsSection: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "flex-start",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F0E7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  infoIcon: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#A0AEC0",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 15,
    color: "#4A5568",
    fontWeight: "500",
  },
  infoValueBold: {
    fontSize: 16,
    color: "#2D3748",
    fontWeight: "bold",
  },
  progressSection: {
    margin: 16,
    marginTop: 0,
  },
  progressCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressStep: {
    alignItems: "center",
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepCompleted: {
    backgroundColor: "#C6F6D5",
  },
  stepActive: {
    backgroundColor: "#BEE3F8",
  },
  stepInactive: {
    backgroundColor: "#F7FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  stepIcon: {
    fontSize: 16,
    fontWeight: "bold",
  },
  stepLabel: {
    fontSize: 11,
    color: "#718096",
    fontWeight: "600",
    textAlign: "center",
  },
  stepConnector: {
    width: 20,
    height: 2,
    marginTop: -28,
    marginHorizontal: -4,
  },
  stepConnectorActive: {
    backgroundColor: "#C6F6D5",
  },
  stepConnectorInactive: {
    backgroundColor: "#E2E8F0",
  },
  completeButton: {
    backgroundColor: "#48BB78",
    margin: 16,
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#48BB78",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  tipsSection: {
    margin: 16,
    marginTop: 0,
  },
  tipBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#667EEA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  tipIcon: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 2,
  },
  tipText: {
    fontSize: 12,
    color: "#718096",
    lineHeight: 18,
  },
});

export default JobStatusScreen;
