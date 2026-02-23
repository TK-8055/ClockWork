import React from 'react';
import { StatusBar } from 'react-native';
import { JobProvider } from './context/JobContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <JobProvider>
      <StatusBar barStyle="light-content" />
      <AppNavigator />
    </JobProvider>
  );
}
