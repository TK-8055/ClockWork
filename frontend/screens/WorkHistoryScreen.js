import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../config';

const WorkHistoryScreen = ({ navigation }) => {
  const [userRole, setUserRole] = useState(null);
  const [applications, setApplications] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      const token = await AsyncStorage.getItem('auth_token');
      
      if (!userData || !token) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      setUserRole(user.role);

      if (user.role === 'WORKER') {
        // Load worker applications
        const response = await fetch(`${API_URL}/applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setApplications(data || []);
        }
      } else {
        // Load user posted jobs
        const response = await fetch(`${API_URL}/jobs/my-jobs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPostedJobs(data || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  // WORKER VIEW
  if (userRole === 'WORKER') {
    const filteredApplications = applications.filter(app => {
      if (activeTab === 'All') return true;
      if (activeTab === 'Pending') return app.status === 'PENDING';
      if (activeTab === 'Accepted') return app.status === 'ACCEPTED';
      return app.status === 'REJECTED';
    });

    const completedCount = applications.filter(a => a.status === 'ACCEPTED').length;
    const totalEarnings = applications
      .filter(a => a.status === 'ACCEPTED' && a.jobId)
      .reduce((sum, a) => sum + (a.jobId.workerPayment || 0), 0);

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📋 My Applications</Text>
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
          {['All', 'Pending', 'Accepted', 'Rejected'].map(tab => (
            <TouchableOpacity 
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredApplications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📭 No {activeTab.toLowerCase()} applications</Text>
            </View>
          ) : (
            filteredApplications.map(app => (
              <TouchableOpacity 
                key={app._id} 
                style={styles.historyCard}
                onPress={() => navigation.navigate('JobDetails', { jobId: app.jobId?._id })}
              >
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>{app.jobId?.title || 'Job'}</Text>
                  <Text style={styles.historyCategory}>🏷️ {app.jobId?.category}</Text>
                  <Text style={styles.historyDate}>Applied: {new Date(app.appliedAt).toLocaleDateString()}</Text>
                  <Text style={[styles.historyStatus, app.status === 'REJECTED' && styles.statusRejected]}>
                    {app.status === 'PENDING' ? '⏳ Pending' : app.status === 'ACCEPTED' ? '✅ Accepted' : '❌ Rejected'}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyPay}>₹{app.jobId?.paymentAmount || 0}</Text>
                  <Text style={styles.historyEarn}>You get: ₹{app.jobId?.workerPayment || 0}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // USER VIEW
  const filteredJobs = postedJobs.filter(job => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return ['POSTED', 'APPLIED', 'SELECTED', 'IN_PROGRESS'].includes(job.status);
    if (activeTab === 'Completed') return job.status === 'COMPLETED';
    return ['CANCELLED', 'DISPUTED'].includes(job.status);
  });

  const activeCount = postedJobs.filter(j => ['POSTED', 'APPLIED', 'SELECTED', 'IN_PROGRESS'].includes(j.status)).length;
  const completedCount = postedJobs.filter(j => j.status === 'COMPLETED').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 My Posted Jobs</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        {['All', 'Active', 'Completed', 'Other'].map(tab => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭 No {activeTab.toLowerCase()} jobs</Text>
            <TouchableOpacity 
              style={styles.postBtn}
              onPress={() => navigation.navigate('PostWork')}
            >
              <Text style={styles.postBtnText}>+ Post a Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredJobs.map(job => (
            <TouchableOpacity 
              key={job._id} 
              style={styles.historyCard}
              onPress={() => navigation.navigate('JobDetails', { jobId: job._id })}
            >
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>{job.title}</Text>
                <Text style={styles.historyCategory}>🏷️ {job.category}</Text>
                <Text style={styles.historyDate}>Posted: {new Date(job.createdAt).toLocaleDateString()}</Text>
                <View style={styles.jobStats}>
                  <Text style={styles.jobStat}>👥 {job.applicantCount || 0} applied</Text>
                  <Text style={[styles.jobStatus, getStatusStyle(job.status)]}>
                    {getStatusText(job.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.historyPay}>₹{job.paymentAmount}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const getStatusText = (status) => {
  const statusMap = {
    'POSTED': '📢 Open',
    'APPLIED': '👥 Has Applicants',
    'SELECTED': '✅ Worker Selected',
    'IN_PROGRESS': '⚙️ In Progress',
    'PENDING_VERIFICATION': '⏳ Pending Review',
    'COMPLETED': '✅ Completed',
    'CANCELLED': '❌ Cancelled',
    'DISPUTED': '⚠️ Disputed'
  };
  return statusMap[status] || status;
};

const getStatusStyle = (status) => {
  if (['COMPLETED'].includes(status)) return { color: '#10B981' };
  if (['CANCELLED', 'DISPUTED'].includes(status)) return { color: '#EF4444' };
  if (['IN_PROGRESS', 'SELECTED'].includes(status)) return { color: '#F59E0B' };
  return { color: '#6B7280' };
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
  tabText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { color: '#10B981' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  historyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  historyInfo: { flex: 1 },
  historyRight: { alignItems: 'flex-end' },
  historyTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  historyCategory: { fontSize: 13, color: '#10B981', marginBottom: 2 },
  historyDate: { fontSize: 13, color: '#9CA3AF', marginBottom: 4 },
  historyStatus: { fontSize: 13, fontWeight: '500', color: '#10B981' },
  statusRejected: { color: '#EF4444' },
  historyPay: { fontSize: 16, fontWeight: '600', color: '#10B981' },
  historyEarn: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  jobStats: { flexDirection: 'row', gap: 12, marginTop: 4 },
  jobStat: { fontSize: 13, color: '#6B7280' },
  jobStatus: { fontSize: 13, fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  postBtn: { backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 8 },
  postBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});

export default WorkHistoryScreen;
