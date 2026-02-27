import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { getCredits } from '../services/api';

const CreditScreen = ({ navigation }) => {
  const [credits, setCredits] = useState(0);
  const [creditScore, setCreditScore] = useState(100);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const data = await getCredits();
      if (data) {
        setCredits(data.credits || 0);
        setCreditScore(data.creditScore || 100);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCredits();
    setRefreshing(false);
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'JOB_POSTING':
      case 'PENALTY':
        return '#EF4444';
      case 'JOB_COMPLETION':
      case 'BONUS':
      case 'REFERRAL':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'JOB_POSTING':
        return '📝';
      case 'JOB_COMPLETION':
        return '✅';
      case 'PENALTY':
        return '⚠️';
      case 'BONUS':
        return '🎁';
      case 'REFERRAL':
        return '👥';
      default:
        return '💳';
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#EF4444';
    return '#DC2626';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💳 My Credits</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Credit Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Credits</Text>
          <Text style={styles.balanceAmount}>₹{credits}</Text>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Credit Score:</Text>
            <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(creditScore) }]}>
              <Text style={styles.scoreValue}>{creditScore}</Text>
            </View>
          </View>
        </View>

        {/* How it Works */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 How it Works</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📝</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Post Jobs</Text>
              <Text style={styles.infoDesc}>Spend 50 credits to post a job</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>✅</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Complete Work</Text>
              <Text style={styles.infoDesc}>Earn credits when jobs are completed</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>⚠️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Penalties</Text>
              <Text style={styles.infoDesc}>False reports cost 25 credits</Text>
            </View>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>📊 Transaction History</Text>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Complete jobs to earn credits!</Text>
            </View>
          ) : (
            transactions.map((transaction, index) => (
              <View key={transaction._id || index} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionIcon}>
                    {getTransactionIcon(transaction.type)}
                  </Text>
                  <View>
                    <Text style={styles.transactionDesc}>
                      {transaction.description || transaction.type.replace(/_/g, ' ')}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.createdAt)}
                    </Text>
                  </View>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: getTransactionColor(transaction.type) }
                ]}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                </Text>
              </View>
            ))
          )}
        </View>

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
  balanceCard: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  infoDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  transactionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  transactionIcon: {
    fontSize: 24,
  },
  transactionDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    textTransform: 'capitalize',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  footer: {
    height: 40,
  },
});

export default CreditScreen;
