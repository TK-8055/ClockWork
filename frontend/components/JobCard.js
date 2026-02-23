import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const JobCard = ({ job, distance, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.emoji}>💼</Text>
          <Text style={styles.title}>{job.title}</Text>
        </View>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>{distance} km</Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {job.description}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.wageContainer}>
          <Text style={styles.wageLabel}>Wage</Text>
          <Text style={styles.wage}>₹{job.wage}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.durationContainer}>
          <Text style={styles.durationLabel}>Duration</Text>
          <Text style={styles.duration}>{job.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#6C63FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  emoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 13,
    color: '#6C63FF',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 12,
  },
  wageContainer: {
    flex: 1,
    alignItems: 'center',
  },
  wageLabel: {
    fontSize: 11,
    color: '#A0AEC0',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  wage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#48BB78',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  durationContainer: {
    flex: 1,
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 11,
    color: '#A0AEC0',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  duration: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '600',
  },
});

export default JobCard;
