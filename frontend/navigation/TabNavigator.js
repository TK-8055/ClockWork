import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import PostWorkScreen from '../screens/PostWorkScreen';
import WorkHistoryScreen from '../screens/WorkHistoryScreen';
import AccountScreen from '../screens/AccountScreen';
import SearchScreen from '../screens/SearchScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [userRole, setUserRole] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadUserRole();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserRole();
    }, [])
  );

  const loadUserRole = async () => {
    const userData = await AsyncStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      // Force re-render when role changes to update tabs
      if (userRole !== user.role) {
        setRefreshKey(prev => prev + 1);
      }
      setUserRole(user.role);
      setIsLoaded(true);
      return;
    }
    setUserRole('USER');
    setIsLoaded(true);
  };

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FD' }}>
        <Text style={{ fontSize: 18, color: '#6B7280' }}>Loading...</Text>
      </View>
    );
  }

  const isWorker = userRole === 'WORKER';

  return (
    <Tab.Navigator
      key={refreshKey}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>🔍</Text>
          ),
        }}
      />

      {!isWorker && (
        <Tab.Screen 
          name="Post" 
          component={PostWorkScreen}
          options={{
            tabBarLabel: 'Post',
            tabBarIcon: ({ focused }) => (
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#10B981',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -15,
              }}>
                <Text style={{ fontSize: 24, color: '#fff' }}>+</Text>
              </View>
            ),
          }}
        />
      )}
      <Tab.Screen 
        name="History" 
        component={WorkHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
