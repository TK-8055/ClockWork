import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const ChatScreen = ({ route, navigation }) => {
  const { chatId, jobTitle, participantName } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    initializeChat();
  }, [chatId]);

  const initializeChat = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id || user._id);
      }
      if (chatId) {
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });
      const data = await response.json();
      if (data) {
        setMessages(prev => [...prev, data]);
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const senderId = item.senderId?._id || item.senderId;
    const isMyMessage = senderId?.toString() === currentUserId?.toString();
    return (
      <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.theirMessageText]}>
          {item.message}
        </Text>
        <Text style={styles.messageTime}>
          {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{participantName || 'Chat'}</Text>
        <View style={{ width: 50 }} />
      </View>

      {jobTitle && (
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{jobTitle}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start the conversation!</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? '...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { fontSize: 16, fontWeight: '600', color: '#10B981' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  jobInfo: { backgroundColor: '#E8F5E9', padding: 10, borderBottomWidth: 1, borderBottomColor: '#C8E6C9' },
  jobTitle: { fontSize: 14, color: '#2E7D32', fontWeight: '500', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF' },
  messageList: { flex: 1 },
  messageListContent: { padding: 15 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 10 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#10B981' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  messageText: { fontSize: 15, marginBottom: 4 },
  myMessageText: { color: '#FFFFFF' },
  theirMessageText: { color: '#1A1A1A' },
  messageTime: { fontSize: 11, color: 'rgba(255,255,255,0.7)', alignSelf: 'flex-end' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  input: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10, maxHeight: 100, fontSize: 15 },
  sendButton: { backgroundColor: '#10B981', borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center', alignSelf: 'flex-end' },
  sendButtonDisabled: { backgroundColor: '#9CA3AF' },
  sendButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 }
});

export default ChatScreen;
