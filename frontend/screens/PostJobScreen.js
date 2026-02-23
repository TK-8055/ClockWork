import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { JobContext } from "../context/JobContext";

const PostJobScreen = ({ navigation }) => {
  const { addJob } = useContext(JobContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [wage, setWage] = useState("");
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || !wage || !duration) {
      Alert.alert(
        "❌ Incomplete Form",
        "Please fill in all fields to post a job.",
      );
      return;
    }

    if (parseInt(wage) < 100) {
      Alert.alert(
        "⚠️ Low Wage",
        "Please consider offering at least ₹100 for fair compensation.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "📍 Permission Required",
          "We need location access to post your job. Please enable location permissions in settings.",
        );
        setIsSubmitting(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      const newJob = {
        title,
        description,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        wage: parseInt(wage),
        duration,
      };

      addJob(newJob);

      Alert.alert(
        "🎉 Job Posted Successfully!",
        "Your job is now visible to workers in your area.",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("Home");
              setTitle("");
              setDescription("");
              setWage("");
              setDuration("");
              setIsSubmitting(false);
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "❌ Error",
        "Failed to post job. Please check your location settings and try again.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>💼</Text>
          <Text style={styles.headerTitle}>Post a Job</Text>
          <Text style={styles.headerSubtitle}>Find workers for your tasks</Text>
        </View>
      </View>

      {/* Main Form */}
      <View style={styles.formContainer}>
        {/* Title Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📌</Text>
            <Text style={styles.sectionTitle}>Job Basics</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Title</Text>
            <View style={styles.inputIconBox}>
              <Text style={styles.inputIcon}>💼</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Warehouse Helper"
                placeholderTextColor="#A0AEC0"
                value={title}
                onChangeText={setTitle}
                editable={!isSubmitting}
              />
            </View>
            <Text style={styles.helperText}>
              Be specific about the role (max 40 chars)
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Description</Text>
            <View style={[styles.inputIconBox, styles.textAreaBox]}>
              <Text style={[styles.inputIcon, styles.descriptionIcon]}>📝</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the job requirements, responsibilities, and any skills needed..."
                placeholderTextColor="#A0AEC0"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                editable={!isSubmitting}
              />
            </View>
            <Text style={styles.helperText}>
              Provide clear details to attract qualified workers
            </Text>
          </View>
        </View>

        {/* Compensation Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💰</Text>
            <Text style={styles.sectionTitle}>Compensation</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Wage (₹)</Text>
              <View style={styles.inputIconBox}>
                <Text style={styles.inputIcon}>💵</Text>
                <TextInput
                  style={[styles.input, styles.flexInput]}
                  placeholder="500"
                  placeholderTextColor="#A0AEC0"
                  value={wage}
                  onChangeText={setWage}
                  keyboardType="numeric"
                  editable={!isSubmitting}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.inputIconBox}>
                <Text style={styles.inputIcon}>⏱️</Text>
                <TextInput
                  style={[styles.input, styles.flexInput]}
                  placeholder="e.g., 4 hours"
                  placeholderTextColor="#A0AEC0"
                  value={duration}
                  onChangeText={setDuration}
                  editable={!isSubmitting}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <View style={styles.infoCardIcon}>
              <Text style={styles.infoCardIconText}>📍</Text>
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Location</Text>
              <Text style={styles.infoCardText}>
                Your current location will be used to post this job
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoCardIcon}>
              <Text style={styles.infoCardIconText}>👥</Text>
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Visibility</Text>
              <Text style={styles.infoCardText}>
                Workers within a 10km radius will see your posting
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoCardIcon}>
              <Text style={styles.infoCardIconText}>⏰</Text>
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Timeline</Text>
              <Text style={styles.infoCardText}>
                Jobs are visible until completed or manually removed
              </Text>
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips for Better Hiring</Text>

          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>✓</Text>
            <Text style={styles.tipText}>
              Be clear and detailed about job requirements
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>✓</Text>
            <Text style={styles.tipText}>
              Offer competitive wages for quality workers
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>✓</Text>
            <Text style={styles.tipText}>
              Respond quickly to worker inquiries
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>✓</Text>
            <Text style={styles.tipText}>
              Provide positive feedback to build reputation
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonIcon}>📤</Text>
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Posting..." : "Post Job"}
          </Text>
        </TouchableOpacity>

        <View style={styles.formFooter} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667EEA",
    marginBottom: 12,
  },
  headerContent: {
    alignItems: "center",
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#718096",
  },
  formContainer: {
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 10,
  },
  inputIconBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingLeft: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  inputIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: "#2D3748",
  },
  flexInput: {
    paddingRight: 14,
  },
  textAreaBox: {
    alignItems: "flex-start",
    paddingTop: 12,
    paddingBottom: 0,
  },
  descriptionIcon: {
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    height: 100,
    textAlignVertical: "top",
    paddingRight: 12,
    paddingBottom: 12,
  },
  helperText: {
    fontSize: 12,
    color: "#A0AEC0",
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  infoCardsContainer: {
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "flex-start",
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#667EEA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  infoCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0E7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  infoCardIconText: {
    fontSize: 18,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 2,
  },
  infoCardText: {
    fontSize: 12,
    color: "#718096",
    lineHeight: 16,
  },
  tipsSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#48BB78",
    width: 20,
  },
  tipText: {
    fontSize: 12,
    color: "#4A5568",
    flex: 1,
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: "#48BB78",
    paddingVertical: 18,
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
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonIcon: {
    fontSize: 18,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  formFooter: {
    height: 20,
  },
});

export default PostJobScreen;
