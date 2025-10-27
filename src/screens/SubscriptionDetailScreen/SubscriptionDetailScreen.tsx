import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SubscriptionDetailScreen = ({ route, navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Subscription Details
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.placeholderText}>
            Subscription details will appear here
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  placeholderText: {
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SubscriptionDetailScreen;