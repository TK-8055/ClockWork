import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import PermissionScreen from '../screens/PermissionScreen';
import TabNavigator from './TabNavigator';
import PostWorkScreen from '../screens/PostWorkScreen';
import JobDetailsScreen from '../screens/JobDetailsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import CreditScreen from '../screens/CreditScreen';
import JobVerificationScreen from '../screens/JobVerificationScreen';
import DisputeScreen from '../screens/DisputeScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatListScreen from '../screens/ChatListScreen';
import SearchScreen from '../screens/SearchScreen';
import JobListScreen from '../screens/JobListScreen';
import MapScreen from '../screens/MapScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6C63FF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Permission" component={PermissionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="PostWork" component={PostWorkScreen} options={{ headerShown: false }} />
        <Stack.Screen name="JobDetails" component={JobDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Credit" component={CreditScreen} options={{ headerShown: false }} />
        <Stack.Screen name="JobVerification" component={JobVerificationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dispute" component={DisputeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
        <Stack.Screen name="JobList" component={JobListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
