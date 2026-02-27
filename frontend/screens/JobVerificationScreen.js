import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Image, Modal } from 'react-native';
import { getJobById, verifyJob, getApplications } from '../services/api';

const JobVerificationScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verificationData, setVerificationData] = useState({
    verified: null,
    feedback: '',
    rating: 5
  });

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const jobData = await getJobById(jobId);
      setJob(jobData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (verified) => {
    if (verificationData.feedback.trim() === '') {
      Alert.alert('Feedback Required', 'Please provide feedback for the worker');
      return;
    }

    setSubmitting(true);
    try {
      const result = await verifyJob(jobId, {
        verified,
        feedback: verificationData.feedback,
        rating: verificationData.rating
      });

      if (result.success) {
        Alert.alert(
          verified ? '✅ Job Verified!' : '⚠️ Issue Reported',
          verified 
            ? 'Payment has been released to the worker.'
            : 'The dispute has been raised. Our team will review and resolve it.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to verify job');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  const isAssignedJob = job.status === 'IN_PROGRESS' || job.status === 'PENDING_VERIFICATION';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Work</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Job Info Card */}
        <View style={styles.jobCard}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{job.status.replace(/_/g, ' ')}</Text>
          </View>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.jobCategory}>🏷️ {job.category}</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>💰 Payment Amount</Text>
            <Text style={styles.paymentAmount}>₹{job.paymentAmount}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Job Description</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {/* Worker Info */}
        {job.assignedTo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👷 Worker Details</Text>
            <View style={styles.workerCard}>
              <View style={styles.workerAvatar}>
                <Text style={styles.workerAvatarText}>
                  {job.assignedTo.name?.charAt(0) || 'W'}
                </Text>
              </View>
              <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{job.assignedTo.name || 'Worker'}</Text>
                <Text style={styles.workerPhone}>📞 {job.assignedTo.phoneNumber}</Text>
                {job.assignedTo.rating && (
                  <Text style={styles.workerRating}>⭐ {job.assignedTo.rating.toFixed(1)}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Timeline</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Posted</Text>
              <Text style={styles.timelineValue}>{formatDate(job.createdAt)}</Text>
            </View>
            {job.startedAt && (
              <View style={styles.timelineItem}>
                <Text style={styles.timelineLabel}>Work Started</Text>
                <Text style={styles.timelineValue}>{formatDate(job.startedAt)}</Text>
              </View>
            )}
            {job.verificationDeadline && (
              <View style={styles.timelineItem}>
                <Text style={styles.timelineLabel}>Verification Deadline</Text>
                <Text style={[styles.timelineValue, { color: '#EF4444' }]}>
                  {formatDate(job.verificationDeadline)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Verification Form */}
        {isAssignedJob && (
          <View style={styles.verificationSection}>
            <Text style={styles.verificationTitle}>✅ Verify Completion</Text>
            <Text style={styles.verificationSubtitle}>
              Please verify the work done by the worker
            </Text>

            {/* Feedback Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>📝 Feedback / Comments</Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Describe the work done and your experience..."
                placeholderTextColor="#9CA3AF"
                value={verificationData.feedback}
                onChangeText={(text) => setVerificationData({ ...verificationData, feedback: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Rating */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>⭐ Rate the Worker</Text>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setVerificationData({ ...verificationData, rating: star })}
                    style={styles.starButton}
                  >
                    <Text style={[
                      styles.starIcon,
                      star <= verificationData.rating && styles.starActive
                    ]}>
                      ⭐
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.rejectButton, submitting && styles.buttonDisabled]}
                onPress={() => handleVerify(false)}
                disabled={submitting}
              >
                <Text style={styles.rejectButtonText}>⚠️ Report Issue</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.verifyButton, submitting && styles.buttonDisabled]}
                onPress={() => handleVerify(true)}
                disabled={submitting}
              >
                <Text style={styles.verifyButtonText}>
                  {submitting ? 'Processing...' : '✓ Verify & Pay'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.warningText}>
              ⚠️ False verification may result in penalty points
            </Text>
          </View>
        )}

        {/* Already Verified */}
        {job.status === 'COMPLETED' && (
          <View style={styles.completedCard}>
            <Text style={styles.completedIcon}>✅</Text>
            <Text style={styles.completedTitle}>Job Completed</Text>
            <Text style={styles.completedText}>
              This job has been verified and payment has been released to the worker.
            </Text>
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
    textTransform: 'uppercase',
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  jobCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerAvatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  workerPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  workerRating: {
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 2,
  },
  timeline: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  verificationSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  verificationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  feedbackInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1A1A1A',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 8,
  },
  starIcon: {
    fontSize: 32,
    opacity: 0.3,
  },
  starActive: {
    opacity: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  verifyButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  warningText: {
    fontSize: 12,
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 12,
  },
  completedCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  completedIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  footer: {
    height: 40,
  },
});

export default JobVerificationScreen;
