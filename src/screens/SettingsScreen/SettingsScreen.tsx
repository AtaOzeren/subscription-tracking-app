import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Settings
        </Text>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {/* Currency Setting */}
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Currency</Text>
                <Text style={styles.settingValue}>USD ($)</Text>
              </View>
            </TouchableOpacity>

            {/* Notifications Setting */}
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingValue}>Enabled</Text>
              </View>
            </TouchableOpacity>

            {/* Theme Setting */}
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Theme</Text>
                <Text style={styles.settingValue}>Light</Text>
              </View>
            </TouchableOpacity>

            {/* Backup Setting */}
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Backup Data</Text>
                <Text style={styles.settingValue}>Never</Text>
              </View>
            </TouchableOpacity>

            {/* About */}
            <TouchableOpacity style={[styles.settingItem, styles.noBorder]}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>About</Text>
                <Text style={styles.settingValue}>v1.0.0</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Export/Import Section */}
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Export Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingItem, styles.noBorder]}>
              <Text style={styles.settingLabel}>Import Data</Text>
            </TouchableOpacity>
          </View>

          {/* Reset Button */}
          <TouchableOpacity style={styles.resetButton}>
            <Text style={styles.resetButtonText}>
              Reset All Data
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  settingItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    color: '#1f2937',
    fontWeight: '500',
    fontSize: 16,
  },
  settingValue: {
    color: '#6b7280',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  resetButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default SettingsScreen;