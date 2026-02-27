import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { createDispute, getDisputes } from '../services/api';

const DisputeScreen = ({ route, navigation }) => {
  const { jobId, jobTitle, mode = 'create' } = route.params || {};
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedJobId, setSelectedJobId] = useState(jobId || '');
  const [disputeType, setDisputeType] = useState('');
  const [description, setDescription] = useState('');

  const disputeTypes = [
    { id: 'WORK_NOT_DONE', label: 'Work Not Done', icon: '❌', description: 'Worker did not complete the assigned work' },
    { id: 'POOR_WORK', label: 'Poor Quality Work', icon: '📉', description: 'Work was not done properly' },
    { id: 'NO_SHOW', label: 'Worker No-Show', icon: '🚫', description: 'Worker did not show up for the job' },
    { id: 'OTHER', label: 'Other Issue', icon: '📋', description: 'Any other issue' },
  ];

  useEffect(() => {
    if (mode === 'list') {
      fetchDisputes();
    }
  }, [mode]);

  const fetchDisputes = async () => {
    try {
      const data = await getDisputes();
      setDisputes(data || []);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDispute = async () => {
    if (!selectedJobId) {
      Alert.alert('Error', 'Please select a job');
      return;
    }
    if (!disputeType) {
      Alert.alert('Error', 'Please select a dispute type');
      return;
    }
    if (description.trim().length < 20) {
      Alert.alert('Error', 'Please provide a detailed description (at least 20 characters)');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createDispute({
        jobId: selectedJobId,
        type: disputeType,
        description: description.trim()
      });

      if (result.success) {
        Alert.alert(
          '✅ Dispute Submitted',
          'Your dispute has been submitted. Our team will review it within 24 hours.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to submit dispute');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const getDisputeTypeLabel = (type) => {
    const found = disputeTypes.find(t => t.id === type);
    return found ? found.label : type;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return '#F59E0B';
      case 'UNDER_REVIEW': return '#3B82F6';
      case 'RESOLVED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // If showing list of disputes
  if (mode === 'list') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚖️ My Disputes</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : disputes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No disputes found</Text>
            </View>
          ) : (
            disputes.map((dispute, index) => (
              <View key={dispute._id || index} style={styles.disputeCard}>
                <View style={styles.disputeHeader}>
                  <Text style={styles.disputeJobTitle}>
                    {dispute.jobId?.title || 'Job'}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(dispute.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(dispute.status) }]}>
                      {dispute.status}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.disputeType}>
                  <Text style={styles.disputeTypeIcon}>
                    {disputeTypes.find(t => t.id === dispute.type)?.icon || '📋'}
                  </Text>
                  <Text style={styles.disputeTypeText}>{getDisputeTypeLabel(dispute.type)}</Text>
                </View>
                
                <Text style={styles.disputeDescription} numberOfLines={3}>
                  {dispute.description}
                </Text>
                
                <View style={styles.disputeFooter}>
                  <Text style={styles.disputeDate}>
                    📅 Filed on {formatDate(dispute.createdAt)}
                  </Text>
                  {dispute.resolution && (
                    <View style={styles.resolutionBox}>
                      <Text style={styles.resolutionLabel}>Resolution:</Text>
                      <Text style={styles.resolutionText}>{dispute.resolution}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
          <View style={styles.footer} />
        </ScrollView>
      </View>
    );
  }

  // Create dispute form
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚠️ Report Issue</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>⚖️</Text>
          <Text style={styles.infoTitle}>Dispute Resolution</Text>
          <Text style={styles.infoText}>
            If the work was not done properly, you can report a dispute. 
            Our team will review and take appropriate action. 
            False disputes may result in penalty points.
          </Text>
        </View>

        {/* Job Selection (if not provided) */}
        {!jobId && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>📋 Select Job</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Job ID (for demo)"
              placeholderTextColor="#9CA3AF"
              value={selectedJobId}
              onChangeText={setSelectedJobId}
            />
            <Text style={styles.helperText}>
              Enter the job ID for the disputed job
            </Text>
          </View>
        )}

        {/* Dispute Type Selection */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>🔍 Issue Type</Text>
          <View style={styles.typeGrid}>
            {disputeTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  disputeType === type.id && styles.typeCardSelected
                ]}
                onPress={() => setDisputeType(type.id)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.typeLabel,
                  disputeType === type.id && styles.typeLabelSelected
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe the issue in detail..."
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={styles.helperText}>
            Minimum 20 characters. Be specific about what went wrong.
          </Text>
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            False disputes may result in:
          </Text>
          <View style={styles.warningList}>
            <Text style={styles.warningItem}>• Penalty of 25 credits</Text>
            <Text style={styles.warningItem}>• Decrease in credit score</Text>
            <Text style={styles.warningItem}>• Account restrictions</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            submitting && styles.buttonDisabled
          ]}
          onPress={handleSubmitDispute}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Submitting...' : '📤 Submit Dispute'}
          </Text>
        </TouchableOpacity>

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
  // Info Card
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Form Sections
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  // Type Selection
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: '#EF4444',
  },
  // Description
  descriptionInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1A1A1A',
    minHeight: 120,
  },
  // Warning Card
  warningCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  warningList: {
    gap: 4,
  },
  warningItem: {
    fontSize: 13,
    color: '#B45309',
  },
  // Submit Button
  submitButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    height: 40,
  },
  // Dispute List Styles
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  disputeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  disputeJobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  disputeType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  disputeTypeIcon: {
    fontSize: 20,
  },
  disputeTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  disputeDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  disputeFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  disputeDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  resolutionBox: {
    marginTop: 8,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
  },
  resolutionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  resolutionText: {
    fontSize: 13,
    color: '#065F46',
  },
});

export default DisputeScreen;
