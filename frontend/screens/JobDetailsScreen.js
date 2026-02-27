 import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const getCategoryEmoji = (category) => {
  const categoryMap = {
    'Cleaning': '🧹',
    'Plumbing': '🔧',
    'Electrical': '⚡',
    'Carpentry': '🪵',
    'Cooking': '👨‍🍳',
    'Painting': '🎨',
    'Mechanic': '🔩',
    'AC Repair': '❄️',
    'Delivery': '📦',
    'Gardening': '🌱',
  };
  return categoryMap[category] || '💼';
};

const getStatusDisplay = (status) => {
  const statusMap = {
    'POSTED': { text: '📢 Open for Applications', color: '#10B981' },
    'SELECTED': { text: '✅ Worker Selected', color: '#3B82F6' },
    'IN_PROGRESS': { text: '⚙️ Work in Progress', color: '#F59E0B' },
    'PENDING_VERIFICATION': { text: '⏳ Awaiting Approval', color: '#8B5CF6' },
    'COMPLETED': { text: '✅ Completed', color: '#10B981' },
    'CANCELLED': { text: '❌ Cancelled', color: '#EF4444' },
    'DISPUTED': { text: '⚠️ Disputed', color: '#EF4444' },
  };
  return statusMap[status] || { text: status, color: '#6B7280' };
};

const JobDetailsScreen = ({ navigation, route }) => {
  const { jobId } = route.params || {};
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadJobDetails();
      loadUser();
    }, [jobId])
  );

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error loading user:', error);
    }
  };

  const loadJobDetails = async () => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setJob(data);
        
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          if (data.postedBy && (user._id === data.postedBy._id || user.id === data.postedBy._id)) {
            loadApplications();
          }
        }
      } else {
        Alert.alert('Error', 'Failed to load job details');
      }
    } catch (error) {
      console.error('Error loading job:', error);
      Alert.alert('Error', 'Failed to load job details. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    setLoadingApplications(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/jobs/${jobId}/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data || []);
      }
    } catch (error) {
      console.log('Error loading applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleApply = async () => {
    if (!jobId) return;
    
    if (!user) {
      Alert.alert('Login Required', 'Please login first to apply for jobs');
      navigation.navigate('Login');
      return;
    }

    setApplying(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('✅ Success', 'You have applied for this job! The poster will be notified.');
        loadJobDetails();
      } else {
        Alert.alert('Error', data.error || data.message || 'Failed to apply');
      }
    } catch (error) {
      console.error('Apply error:', error);
      Alert.alert('Error', 'Failed to apply. Please check your network connection.');
    } finally {
      setApplying(false);
    }
  };

  const handleAcceptWorker = async (workerId, workerName) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/jobs/${jobId}/select-worker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workerId })
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('✅ Success', `You have accepted ${workerName}! They will be notified and can start the job.`);
        loadJobDetails();
        loadApplications();
      } else {
        Alert.alert('Error', data.error || 'Failed to select worker');
      }
    } catch (error) {
      console.error('Error selecting worker:', error);
      Alert.alert('Error', 'Failed to select worker. Please try again.');
    }
  };

  const handleStartWork = async () => {
    setUpdatingStatus(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/jobs/${jobId}/start-work`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        Alert.alert('✅ Work Started', 'The work has begun!');
        loadJobDetails();
      } else {
        Alert.alert('Error', 'Failed to start work');
      }
    } catch (error) {
      console.error('Error starting work:', error);
      Alert.alert('Error', 'Failed to start work');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFinishWork = async () => {
    Alert.alert(
      'Finish Work',
      'Are you sure you want to submit this work for verification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Submit', 
          onPress: async () => {
            setUpdatingStatus(true);
            try {
              const token = await AsyncStorage.getItem('auth_token');
              const response = await fetch(`${API_URL}/jobs/${jobId}/submit-completion`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({})
              });
              
              const data = await response.json();
              
              if (response.ok) {
                Alert.alert('✅ Submitted', 'Work submitted for verification! The user will review and approve payment.');
                loadJobDetails();
              } else {
                Alert.alert('Error', data.error || 'Failed to submit completion');
              }
            } catch (error) {
              console.error('Error finishing work:', error);
              Alert.alert('Error', 'Failed to submit work. Please try again.');
            } finally {
              setUpdatingStatus(false);
            }
          }
        }
      ]
    );
  };

  const handleVerifyAndPay = async () => {
    Alert.alert(
      'Approve & Pay',
      'Confirm that the work is completed satisfactorily? Credits will be transferred to the worker.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve & Pay', 
          onPress: async () => {
            setUpdatingStatus(true);
            try {
              const token = await AsyncStorage.getItem('auth_token');
              const response = await fetch(`${API_URL}/jobs/${jobId}/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ verified: true, rating: 5, feedback: 'Great work!' })
              });
              
              if (response.ok) {
                Alert.alert('✅ Payment Complete', 'Credits have been transferred to the worker!');
                loadJobDetails();
              } else {
                Alert.alert('Error', 'Failed to complete payment');
              }
            } catch (error) {
              console.error('Error verifying job:', error);
            } finally {
              setUpdatingStatus(false);
            }
          }
        }
      ]
    );
  };

  const handleChat = async () => {
    if (!jobId) return;
    
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/chats/job/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const chat = await response.json();
        navigation.navigate('Chat', { 
          chatId: chat._id,
          jobTitle: job?.title,
          participantName: user?.role === 'USER' ? job?.assignedTo?.name : job?.postedBy?.name
        });
      } else {
        Alert.alert('Error', 'Failed to open chat');
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      Alert.alert('Error', 'Failed to open chat. Please try again.');
    }
  };

  if (loading) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!job) {
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
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Job not found</Text>
        </View>
      </View>
    );
  }

  const jobLocation = { 
    latitude: job.location?.latitude || 11.0510, 
    longitude: job.location?.longitude || 76.9010 
  };

  const isOwner = user && job.postedBy && (user.id === job.postedBy._id || user._id === job.postedBy._id);
  const isWorker = user && job.assignedTo && (user.id === job.assignedTo._id || user._id === job.assignedTo._id);
  const hasStarted = job.status === 'IN_PROGRESS' || job.status === 'PENDING_VERIFICATION' || job.status === 'COMPLETED';
  const statusInfo = getStatusDisplay(job.status);

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
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusInfo.color + '20' }]}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
        </View>

        <View style={styles.payCard}>
          <Text style={styles.payLabel}>💰 Payment</Text>
          <Text style={styles.payAmount}>₹{job.paymentAmount || 0}</Text>
          {job.platformFee > 0 && (
            <Text style={styles.paySubtext}>Worker gets: ₹{job.workerPayment} (after 10% fee)</Text>
          )}
        </View>

        <Text style={styles.title}>{job.title || 'Job'}</Text>
        <Text style={styles.category}>{getCategoryEmoji(job.category)} {job.category || 'General'}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <Text style={styles.description}>{job.description || 'No description provided'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationText}>{job.location?.address || 'Location not specified'}</Text>
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
          <Text style={styles.sectionTitle}>👤 {isOwner ? 'Worker' : 'Posted By'}</Text>
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {(isOwner ? job.assignedTo?.name : job.postedBy?.name)?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{isOwner ? (job.assignedTo?.name || 'Worker') : (job.postedBy?.name || 'User')}</Text>
              <Text style={styles.userPhone}>📞 Contact via chat only</Text>
            </View>
          </View>
        </View>

        {/* Chat Button - Show when job is accepted */}
        {hasStarted && (
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Text style={styles.chatButtonText}>💬 Chat with {isOwner ? 'Worker' : 'User'}</Text>
          </TouchableOpacity>
        )}

        {/* Worker Action Buttons */}
        {isWorker && job.status === 'SELECTED' && (
          <TouchableOpacity 
            style={[styles.actionButton, updatingStatus && styles.actionButtonDisabled]} 
            onPress={handleStartWork}
            disabled={updatingStatus}
          >
            <Text style={styles.actionButtonText}>▶️ Start Work</Text>
          </TouchableOpacity>
        )}

        {isWorker && job.status === 'IN_PROGRESS' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.finishButton, updatingStatus && styles.actionButtonDisabled]} 
            onPress={handleFinishWork}
            disabled={updatingStatus}
          >
            <Text style={styles.actionButtonText}>✅ Mark Work as Done</Text>
          </TouchableOpacity>
        )}

        {/* User Action Buttons */}
        {isOwner && job.status === 'PENDING_VERIFICATION' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.verifyButton, updatingStatus && styles.actionButtonDisabled]} 
            onPress={handleVerifyAndPay}
            disabled={updatingStatus}
          >
            <Text style={styles.actionButtonText}>✅ Approve & Pay Credits</Text>
          </TouchableOpacity>
        )}

        {/* Show applicants for job owner */}
        {isOwner && job.status === 'POSTED' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Applicants ({applications.length})</Text>
            
            {loadingApplications ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : applications.length === 0 ? (
              <View style={styles.emptyApplications}>
                <Text style={styles.emptyText}>No applicants yet</Text>
              </View>
            ) : (
              applications.map((app) => (
                <View key={app._id} style={styles.applicationCard}>
                  <View style={styles.applicationInfo}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>
                        {app.workerId?.name ? app.workerId.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'W'}
                      </Text>
                    </View>
                    <View style={styles.applicationDetails}>
                      <Text style={styles.workerName}>{app.workerId?.name || 'Worker'}</Text>
                      <View style={styles.workerStats}>
                        <Text style={styles.workerStat}>⭐ {app.workerId?.rating?.toFixed(1) || '5.0'}</Text>
                        <Text style={styles.workerStat}>💳 {app.workerId?.creditScore || 100}</Text>
                        <Text style={styles.workerStat}>✅ {app.workerId?.totalJobsCompleted || 0} jobs</Text>
                      </View>
                    </View>
                  </View>
                  
                  {app.status === 'PENDING' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.acceptBtn}
                        onPress={() => handleAcceptWorker(app.workerId?._id, app.workerId?.name || 'Worker')}
                      >
                        <Text style={styles.acceptBtnText}>✓ Accept</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Show Apply button for workers */}
        {!isOwner && !isWorker && user && job.status === 'POSTED' && (
          <TouchableOpacity 
            style={[styles.applyBtn, applying && styles.applyBtnDisabled]} 
            onPress={handleApply}
            disabled={applying}
          >
            <Text style={styles.applyText}>
              {applying ? 'Applying...' : '✓ Apply for This Job'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Show login prompt if not logged in */}
        {!user && job.status === 'POSTED' && (
          <TouchableOpacity 
            style={styles.applyBtn} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.applyText}>Login to Apply</Text>
          </TouchableOpacity>
        )}

        {/* Show owner info */}
        {isOwner && job.status === 'POSTED' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>ℹ️ This is your posted job</Text>
          </View>
        )}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
  emptyText: { fontSize: 16, color: '#6B7280' },
  statusBanner: { padding: 12, borderRadius: 8, marginBottom: 16 },
  statusText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  payCard: { backgroundColor: '#10B981', borderRadius: 12, padding: 20, marginBottom: 20, alignItems: 'center' },
  payLabel: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  payAmount: { fontSize: 36, fontWeight: '700', color: '#FFFFFF' },
  paySubtext: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  category: { fontSize: 16, fontWeight: '500', color: '#6B7280', marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  description: { fontSize: 15, color: '#374151', lineHeight: 22 },
  locationCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16, marginBottom: 12 },
  locationText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  mapContainer: { height: 200, borderRadius: 12, overflow: 'hidden' },
  map: { flex: 1 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16 },
  userAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userAvatarText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  userName: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  userPhone: { fontSize: 13, color: '#6B7280' },
  chatButton: { backgroundColor: '#3B82F6', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  chatButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  actionButton: { backgroundColor: '#10B981', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  actionButtonDisabled: { backgroundColor: '#E5E7EB' },
  actionButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  finishButton: { backgroundColor: '#F59E0B' },
  verifyButton: { backgroundColor: '#8B5CF6' },
  applicationCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16, marginBottom: 12 },
  applicationInfo: { flexDirection: 'row', alignItems: 'center' },
  applicationDetails: { flex: 1 },
  workerName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  workerStats: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  workerStat: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  actionButtons: { flexDirection: 'row', marginTop: 12 },
  acceptBtn: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  acceptBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  emptyApplications: { padding: 20, alignItems: 'center' },
  applyBtn: { backgroundColor: '#10B981', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  applyBtnDisabled: { backgroundColor: '#E5E7EB' },
  applyText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  infoBox: { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 16, marginTop: 8, marginBottom: 32 },
  infoText: { fontSize: 14, color: '#92400E', textAlign: 'center' },
});

export default JobDetailsScreen;
