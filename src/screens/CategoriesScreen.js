import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { COLORS } from '../utils/theme';

const CategoriesScreen = ({ navigation }) => {
  const { categories, items, removeCategory } = useAppContext();

  const getItemCount = (categoryId) => {
    return items.filter(item => item.categoryId === categoryId).length;
  };

  const isDefaultCategory = (categoryId) => {
    return ['fridge', 'freezer'].includes(categoryId);
  };

  const handleDeleteCategory = (category) => {
    // Check if category has items
    const itemsInCategory = items.filter(item => item.categoryId === category.id);
    
    if (itemsInCategory.length > 0) {
      Alert.alert(
        'Kan ikke slette kategori',
        `Kategorien "${category.name}" indeholder ${itemsInCategory.length} varer. Flyt eller slet varerne først.`,
        [{ text: 'OK', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Slet kategori',
        `Er du sikker på at du vil slette kategorien "${category.name}"?`,
        [
          { text: 'Annuller', style: 'cancel' },
          { 
            text: 'Slet', 
            style: 'destructive',
            onPress: () => {
              removeCategory(category.id);
              Alert.alert('Succes', `Kategorien "${category.name}" er blevet slettet.`);
            }
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Tilbage</Text>
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <ScrollView style={styles.categoriesList}>
        {categories.map((category) => {
          const itemCount = getItemCount(category.id);
          const isDefault = isDefaultCategory(category.id);
          
          return (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryCount}>
                    {itemCount} varer
                  </Text>
                  {isDefault && (
                    <Text style={styles.defaultLabel}>Standard kategori</Text>
                  )}
                </View>
              </View>
              
              {!isDefault && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCategory(category)}
                >
                  <Text style={styles.deleteButtonText}>Slet</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  categoriesList: {
    flex: 1,
    padding: 20,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundLight,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  defaultLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CategoriesScreen;