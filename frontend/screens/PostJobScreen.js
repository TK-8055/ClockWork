import React, { useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '../config';

const PostJobScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [wage, setWage] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("Cleaning");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const JOB_POSTING_REWARD = 10;
  const PLATFORM_FEE_PERCENTAGE = 10;

  const categories = [
    "Cleaning",
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Cooking",
    "Painting",
    "Mechanic",
    "AC Repair",
    "Delivery",
    "Gardening",
    "Other",
  ];

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "📍 Permission Required",
          "We need location access to post your job."
        );
        return null;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      let addressStr = "Current Location";
      if (address[0]) {
        const a = address[0];
        addressStr = `${a.street || ""}, ${a.subregion || a.district || ""}, ${a.city || ""}`.trim();
      }

      return {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        address: addressStr,
      };
    } catch (error) {
      console.error("Location error:", error);
      return {
        latitude: 11.051,
        longitude: 76.901,
        address: "Coimbatore",
      };
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !wage || !category) {
      Alert.alert("❌ Incomplete Form", "Please fill in all required fields.");
      return;
    }

    if (parseInt(wage) < 100) {
      Alert.alert("⚠️ Low Wage", "Please offer at least ₹100.");
      return;
    }

    setIsSubmitting(true);

    try {
      const currentLocation = await getLocation();
      if (!currentLocation) {
        setIsSubmitting(false);
        return;
      }

      const wageAmount = parseInt(wage);
      const platformFee = Math.round(wageAmount * (PLATFORM_FEE_PERCENTAGE / 100));
      const workerGets = wageAmount - platformFee;

      const jobData = {
        title,
        description,
        category,
        paymentAmount: wageAmount,
        location: currentLocation,
      };

      const token = await AsyncStorage.getItem("auth_token");

      const response = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        Alert.alert("❌ Error", result.error || "Failed to post job");
        setIsSubmitting(false);
        return;
      }

      Alert.alert(
        "🎉 Job Posted Successfully!",
        `You earned ${JOB_POSTING_REWARD} credits!\nWorker gets: ₹${workerGets}`,
        [
          {
            text: "OK",
            onPress: () => {
              setTitle("");
              setDescription("");
              setWage("");
              setDuration("");
              setCategory("Cleaning");
              setIsSubmitting(false);
              navigation.navigate("Main", { screen: "Home" });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error posting job:", error);
      Alert.alert("❌ Error", "Failed to post job. Check your network.");
      setIsSubmitting(false);
    }
  };

  const calculateWorkerPay = () => {
    if (!wage || parseInt(wage) < 100) return 0;
    return parseInt(wage) - Math.round(parseInt(wage) * PLATFORM_FEE_PERCENTAGE / 100);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>💼</Text>
          <Text style={styles.headerTitle}>Post a Job</Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Job Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., House Cleaning"
              placeholderTextColor="#A0AEC0"
              value={title}
              onChangeText={setTitle}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryBtn,
                    category === cat && styles.categoryBtnActive,
                  ]}
                  onPress={() => setCategory(cat)}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.categoryBtnText,
                      category === cat && styles.categoryBtnTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the job..."
              placeholderTextColor="#A0AEC0"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              editable={!isSubmitting}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Compensation</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Wage (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="500"
                placeholderTextColor="#A0AEC0"
                value={wage}
                onChangeText={setWage}
                keyboardType="numeric"
                editable={!isSubmitting}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Duration</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 4 hours"
                placeholderTextColor="#A0AEC0"
                value={duration}
                onChangeText={setDuration}
                editable={!isSubmitting}
              />
            </View>
          </View>

          <View style={styles.feeInfo}>
            <Text style={styles.feeInfoText}>
              Platform Fee: {PLATFORM_FEE_PERCENTAGE}% → Worker gets: ₹{calculateWorkerPay()}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>📍 Location</Text>
          <Text style={styles.infoCardText}>Your GPS location will be used automatically</Text>
        </View>

        <View style={[styles.infoCard, styles.rewardCard]}>
          <Text style={styles.infoCardTitle}>🎁 Earn Credits!</Text>
          <Text style={styles.infoCardText}>Post a job and earn {JOB_POSTING_REWARD} credits</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Posting..." : "📤 Post Job"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FD" },
  header: { backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backButton: { fontSize: 16, fontWeight: "600", color: "#667EEA", marginBottom: 12 },
  headerContent: { alignItems: "center" },
  headerEmoji: { fontSize: 48, marginBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#2D3748" },
  formContainer: { padding: 16 },
  formSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#2D3748", marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#2D3748", marginBottom: 8 },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 15, color: "#2D3748", borderWidth: 2, borderColor: "#E2E8F0" },
  textArea: { height: 100, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 12 },
  halfWidth: { flex: 1 },
  categoryContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 2, borderColor: "#E2E8F0" },
  categoryBtnActive: { backgroundColor: "#10B981", borderColor: "#10B981" },
  categoryBtnText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  categoryBtnTextActive: { color: "#fff" },
  feeInfo: { backgroundColor: "#FEF3C7", padding: 12, borderRadius: 8 },
  feeInfoText: { fontSize: 13, color: "#92400E", textAlign: "center" },
  infoCard: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#667EEA" },
  rewardCard: { borderLeftColor: "#10B981" },
  infoCardTitle: { fontSize: 14, fontWeight: "bold", color: "#2D3748", marginBottom: 4 },
  infoCardText: { fontSize: 12, color: "#718096" },
  submitButton: { backgroundColor: "#48BB78", paddingVertical: 18, borderRadius: 16, alignItems: "center", marginBottom: 12 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default PostJobScreen;
