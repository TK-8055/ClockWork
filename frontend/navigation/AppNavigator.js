import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import JobListScreen from '../screens/JobListScreen';
import MapScreen from '../screens/MapScreen';
import JobDetailsScreen from '../screens/JobDetailsScreen';
import JobStatusScreen from '../screens/JobStatusScreen';
import PostJobScreen from '../screens/PostJobScreen';

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
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="JobList"
          component={JobListScreen}
          options={{ 
            title: 'Available Jobs',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#6C63FF',
          }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{ 
            title: 'Job Map',
            headerStyle: {
              backgroundColor: '#F59E0B',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="JobDetails"
          component={JobDetailsScreen}
          options={{ 
            title: 'Job Details',
            headerStyle: {
              backgroundColor: '#6C63FF',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="JobStatus"
          component={JobStatusScreen}
          options={{ 
            title: 'My Job',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#6C63FF',
          }}
        />
        <Stack.Screen
          name="PostJob"
          component={PostJobScreen}
          options={{ 
            title: 'Post a Job',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#6C63FF',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
