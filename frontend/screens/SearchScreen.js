import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const SearchScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useFocusEffect(
    React.useCallback(() => {
      loadJobs();
    }, [])
  );

  useEffect(() => {
    filterJobs();
  }, [search, filter, jobs]);

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
        const mergedJobs = [...localJobs, ...(data || [])];
        setJobs(mergedJobs);
      } else {
        setJobs([]);
      }
    } catch (error) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (search) {
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.category?.toLowerCase().includes(search.toLowerCase()) ||
        job.location?.address?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter === 'High Pay') {
      filtered = [...filtered].sort((a, b) => (b.paymentAmount || 0) - (a.paymentAmount || 0));
    }

    setFilteredJobs(filtered);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 Search</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs, locations, skills..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filters}>
          <TouchableOpacity 
            style={filter === 'All' ? styles.filterActive : styles.filter}
            onPress={() => setFilter('All')}
          >
            <Text style={filter === 'All' ? styles.filterTextActive : styles.filterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={filter === 'High Pay' ? styles.filterActive : styles.filter}
            onPress={() => setFilter('High Pay')}
          >
            <Text style={filter === 'High Pay' ? styles.filterTextActive : styles.filterText}>High Pay</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Available Positions ({filteredJobs.length})</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭 No jobs found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        ) : (
          filteredJobs.map(job => (
            <TouchableOpacity 
              key={job._id} 
              style={styles.jobCard}
              onPress={() => navigation.navigate('JobDetails', { jobId: job._id })}
            >
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobCategory}>🏷️ {job.category}</Text>
                <Text style={styles.jobLocation}>📍 {job.location?.address || 'Location not specified'}</Text>
              </View>
              <Text style={styles.jobPay}>₹{job.paymentAmount}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 24, fontWeight: '600', color: '#1A1A1A', marginBottom: 16, letterSpacing: -0.5 },
  searchInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#1A1A1A' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  filterActive: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  filterTextActive: { fontSize: 14, fontWeight: '500', color: '#FFFFFF' },
  filter: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  filterText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 16 },
  jobCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  jobCategory: { fontSize: 13, color: '#10B981', marginBottom: 2 },
  jobLocation: { fontSize: 13, color: '#6B7280' },
  jobPay: { fontSize: 16, fontWeight: '600', color: '#10B981' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF' },
});

export default SearchScreen;
