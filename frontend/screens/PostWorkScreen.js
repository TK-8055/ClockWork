import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import * as Location from 'expo-location';
import { postJob } from '../services/api';

const PostWorkScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [payment, setPayment] = useState('');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Getting location...');
  const [loading, setLoading] = useState(false);

  const categories = ['Cleaning', 'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'Cooking', 'Mechanic', 'AC Repair'];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        const addr = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        if (addr[0]) {
          setAddress(`${addr[0].subregion || addr[0].district}, ${addr[0].city}`);
        }
      }
    } catch (error) {
      setLocation({ latitude: 11.0510, longitude: 76.9010 });
      setAddress('Kuniyamuthur, Coimbatore');
    }
  };

  const handlePost = async () => {
    if (!title.trim()) return Alert.alert('Error', 'Please enter job title');
    if (!category) return Alert.alert('Error', 'Please select a category');
    if (!description.trim()) return Alert.alert('Error', 'Please enter description');
    if (!payment) return Alert.alert('Error', 'Please enter payment amount');
    if (!location) return Alert.alert('Error', 'Location not available');

    setLoading(true);
    try {
      await postJob({
        title,
        category,
        description,
        paymentAmount: parseInt(payment),
        location: { ...location, address },
        images: []
      });
      Alert.alert('Success', 'Job posted successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Work</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Job Title</Text>
        <TextInput
          style={styles.inputField}
          placeholder="e.g. Plumber needed for bathroom repair"
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Work Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, category === cat && styles.categoryActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe the work clearly"
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Payment Amount</Text>
        <View style={styles.paymentInput}>
          <Text style={styles.currency}>₹</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            placeholderTextColor="#9CA3AF"
            value={payment}
            onChangeText={setPayment}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.uploadBtn}>
          <Text style={styles.uploadText}>Upload Image (Optional)</Text>
        </TouchableOpacity>

        <View style={styles.locationCard}>
          <Text style={styles.locationLabel}>📍 Location</Text>
          <Text style={styles.locationText}>{address}</Text>
          <Text style={styles.locationSubtext}>Auto-detected from GPS</Text>
        </View>

        <TouchableOpacity style={styles.postBtn} onPress={handlePost} disabled={loading}>
          <Text style={styles.postText}>{loading ? 'Posting...' : 'Post Job'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { fontSize: 16, fontWeight: '600', color: '#2563EB' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  categoryChip: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  categoryActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  categoryText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  categoryTextActive: { color: '#FFFFFF' },
  inputField: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1A1A1A', marginBottom: 24 },
  textArea: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16, fontSize: 15, color: '#1A1A1A', height: 120, textAlignVertical: 'top', marginBottom: 24 },
  paymentInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, marginBottom: 24 },
  currency: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', paddingLeft: 16 },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 16, fontSize: 16, color: '#1A1A1A' },
  uploadBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 24 },
  uploadText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  locationCard: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16, marginBottom: 24 },
  locationLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  locationText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  locationSubtext: { fontSize: 12, color: '#9CA3AF' },
  postBtn: { backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginBottom: 32 },
  postText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default PostWorkScreen;
