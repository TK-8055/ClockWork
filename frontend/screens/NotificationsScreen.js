import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';

const NotificationsScreen = ({ navigation }) => {
  const notifications = [
    { id: 1, type: 'applied', title: 'Application Received', message: 'Worker applied for House Cleaning job', time: '5 min ago' },
    { id: 2, type: 'selected', title: 'Worker Selected', message: 'Rajesh Kumar selected for Plumbing Work', time: '1 hour ago' },
    { id: 3, type: 'completed', title: 'Job Completed', message: 'Electrical Repair marked as completed', time: '2 hours ago' },
    { id: 4, type: 'system', title: 'Payment Received', message: 'You received ₹800 for completed work', time: 'Yesterday' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.clearBtn}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.map(notif => (
          <TouchableOpacity key={notif.id} style={styles.notifCard}>
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>{notif.title}</Text>
              <Text style={styles.notifMessage}>{notif.message}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { fontSize: 16, fontWeight: '600', color: '#2563EB' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  clearBtn: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  notifCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16, marginBottom: 12 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  notifMessage: { fontSize: 14, color: '#374151', marginBottom: 8, lineHeight: 20 },
  notifTime: { fontSize: 12, color: '#9CA3AF' },
});

export default NotificationsScreen;
