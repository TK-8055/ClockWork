import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const JobDetailsScreen = ({ navigation }) => {
  const jobLocation = { latitude: 12.9352, longitude: 77.6245 };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.payCard}>
          <Text style={styles.payLabel}>💰 Payment</Text>
          <Text style={styles.payAmount}>₹450</Text>
        </View>

        <Text style={styles.title}>House Cleaning</Text>
        <Text style={styles.category}>🏷️ Cleaning</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <Text style={styles.description}>Need thorough cleaning of 2BHK apartment. Kitchen, bathrooms, and all rooms. Should take 3-4 hours.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationText}>Koramangala, Bangalore</Text>
            <Text style={styles.distance}>2.5 km away</Text>
          </View>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={{ latitude: jobLocation.latitude, longitude: jobLocation.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
              scrollEnabled={true}
              zoomEnabled={true}
            >
              <Marker coordinate={jobLocation} />
            </MapView>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Posted By</Text>
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>SK</Text>
            </View>
            <View>
              <Text style={styles.userName}>Suresh Kumar</Text>
              <Text style={styles.userPhone}>📞 +91 98765 43210</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.applyBtn}>
          <Text style={styles.applyText}>✓ Apply for This Job</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { fontSize: 16, fontWeight: '600', color: '#10B981' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  payCard: { backgroundColor: '#10B981', borderRadius: 12, padding: 20, marginBottom: 20, alignItems: 'center' },
  payLabel: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  payAmount: { fontSize: 36, fontWeight: '700', color: '#FFFFFF' },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  category: { fontSize: 14, fontWeight: '500', color: '#6B7280', marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  description: { fontSize: 15, color: '#374151', lineHeight: 22 },
  locationCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16, marginBottom: 12 },
  locationText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  distance: { fontSize: 13, color: '#6B7280' },
  mapContainer: { height: 200, borderRadius: 12, overflow: 'hidden' },
  map: { flex: 1 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16 },
  userAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userAvatarText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  userName: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  userPhone: { fontSize: 13, color: '#6B7280' },
  applyBtn: { backgroundColor: '#10B981', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  applyText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

export default JobDetailsScreen;
