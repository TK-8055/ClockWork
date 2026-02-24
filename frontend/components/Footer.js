import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Footer = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>© 2024 TempJobFinder. All rights reserved.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: { backgroundColor: '#FFFFFF', paddingVertical: 24, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' },
  text: { fontSize: 12, color: '#9CA3AF' },
});

export default Footer;
