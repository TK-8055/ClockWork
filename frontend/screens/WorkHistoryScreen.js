import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { getApplications } from '../services/api';

const WorkHistoryScreen = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Applied');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await getApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'Applied') return app.status === 'PENDING';
    if (activeTab === 'Completed') return app.status === 'ACCEPTED';
    return false;
  });

  const completedCount = applications.filter(a => a.status === 'ACCEPTED').length;
  const totalEarnings = applications
    .filter(a => a.status === 'ACCEPTED' && a.jobId)
    .reduce((sum, a) => sum + (a.jobId.paymentAmount || 0), 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Work History</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>₹{totalEarnings}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Applied' && styles.tabActive]}
          onPress={() => setActiveTab('Applied')}
        >
          <Text style={[styles.tabText, activeTab === 'Applied' && styles.tabTextActive]}>Applied</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Completed' && styles.tabActive]}
          onPress={() => setActiveTab('Completed')}
        >
          <Text style={[styles.tabText, activeTab === 'Completed' && styles.tabTextActive]}>Completed</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
        ) : filteredApplications.length === 0 ? (
          <Text style={styles.emptyText}>No {activeTab.toLowerCase()} jobs</Text>
        ) : (
          filteredApplications.map(app => (
            <View key={app._id} style={styles.historyCard}>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>{app.jobId?.title || 'Job'}</Text>
                <Text style={styles.historyCategory}>🏷️ {app.jobId?.category}</Text>
                <Text style={styles.historyDate}>Applied: {new Date(app.appliedAt).toLocaleDateString()}</Text>
                <Text style={[styles.historyStatus, app.status === 'REJECTED' && styles.statusRejected]}>
                  {app.status === 'PENDING' ? '⏳ Pending' : app.status === 'ACCEPTED' ? '✅ Accepted' : '❌ Rejected'}
                </Text>
              </View>
              <Text style={styles.historyPay}>₹{app.jobId?.paymentAmount || 0}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 24, fontWeight: '600', color: '#1A1A1A', marginBottom: 20, letterSpacing: -0.5 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  statValue: { fontSize: 24, fontWeight: '600', color: '#10B981', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  tabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#10B981' },
  tabText: { fontSize: 15, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { color: '#10B981' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  historyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  historyInfo: { flex: 1 },
  historyTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  historyCategory: { fontSize: 13, color: '#10B981', marginBottom: 2 },
  historyDate: { fontSize: 13, color: '#9CA3AF', marginBottom: 4 },
  historyStatus: { fontSize: 13, fontWeight: '500', color: '#10B981' },
  statusRejected: { color: '#EF4444' },
  historyPay: { fontSize: 16, fontWeight: '600', color: '#10B981' },
  emptyText: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginTop: 40 },
});

export default WorkHistoryScreen;
