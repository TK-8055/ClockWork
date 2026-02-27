import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const ChatListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    initializeChats();
  }, []);

  const initializeChats = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id || user._id);
      }
      await fetchChats();
    } catch (error) {
      console.error('Error initializing chats:', error);
      setLoading(false);
    }
  };

  const fetchChats = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderChat = ({ item }) => {
    const otherParticipant = item.participants.find(p => p._id?.toString() !== currentUserId?.toString()) || item.participants[0];
    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => navigation.navigate('Chat', { 
          chatId: item._id, 
          jobTitle: item.jobId?.title,
          participantName: otherParticipant?.name
        })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {otherParticipant?.name?.charAt(0) || '?'}
          </Text>
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{otherParticipant?.name || 'Unknown'}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'No messages yet'}
          </Text>
          {item.jobId && (
            <Text style={styles.jobTitle}>📋 {item.jobId.title}</Text>
          )}
        </View>
        <Text style={styles.time}>
          {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleDateString() : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>Start by applying to a job or selecting a worker</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
  list: { padding: 10 },
  chatItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 8 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  lastMessage: { fontSize: 14, color: '#6B7280', marginBottom: 2 },
  jobTitle: { fontSize: 12, color: '#10B981' },
  time: { fontSize: 12, color: '#9CA3AF' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6B7280', textAlign: 'center' }
});

export default ChatListScreen;
