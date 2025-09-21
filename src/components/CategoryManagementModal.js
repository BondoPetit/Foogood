/**
 * Category Management Modal Component
 */
import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../utils/theme';
import { styles } from '../styles/styles';
import { PrimaryButton, GhostButton, LoadingState } from './UI';
import { AddCategoryModal } from './AddCategoryModal';
import { EditCategoryModal } from './EditCategoryModal';
import { useAppContext } from '../context/AppContext';

export function CategoryManagementModal({ visible, onClose }) {
  const { categories, addCategory, editCategory, removeCategory } = useAppContext();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAddCategory = async (categoryData) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await addCategory(categoryData);
      Alert.alert('✅ Succes', `Kategorien "${categoryData.name}" er tilføjet`);
    } catch (error) {
      // Error already handled in AppContext
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    Alert.alert(
      'Slet kategori',
      `Er du sikker på at du vil slette kategorien "${categoryName}"?\n\nVarer i denne kategori vil blive flyttet til standard kategorien.\n\nDette kan ikke fortrydes.`,
      [
        { text: 'Annuller', style: 'cancel' },
        { 
          text: 'Slet', 
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await removeCategory(categoryId);
              Alert.alert('🗑️ Slettet', `Kategorien "${categoryName}" er slettet`);
            } catch (error) {
              // Error already handled in AppContext
            }
          }
        }
      ]
    );
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditModalVisible(true);
  };

  const handleUpdateCategory = async (categoryId, updates) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await editCategory(categoryId, updates);
      Alert.alert('✅ Opdateret', `Kategorien er opdateret`);
    } catch (error) {
      // Error already handled in AppContext
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
      }}>
        <View style={{
          backgroundColor: COLORS.backgroundLight,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: '80%',
          minHeight: '60%'
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb'
          }}>
            <Text style={[styles.modernTitle, { fontSize: 20 }]}>
              Administrer kategorier 📂
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#f3f4f6',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ fontSize: 18, color: COLORS.textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* Add new category button */}
            <View style={{ marginBottom: 20 }}>
              <PrimaryButton
                title="➕ Tilføj ny kategori"
                onPress={() => setAddModalVisible(true)}
              />
            </View>

            {/* Categories list */}
            <Text style={[styles.modernSubtitle, { marginBottom: 16 }]}>
              Eksisterende kategorier ({categories.length}):
            </Text>

            {categories.map((category) => (
              <View
                key={category.id}
                style={[styles.modernItemCard, {
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12
                }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{category.icon}</Text>
                  <View>
                    <Text style={[styles.modernTitle, { fontSize: 16 }]}>
                      {category.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                      ID: {category.id}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleEditCategory(category)}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      backgroundColor: COLORS.primary + '20'
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>✏️</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteCategory(category.id, category.name)}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      backgroundColor: COLORS.danger + '20'
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {categories.length === 0 && (
              <View style={{
                padding: 20,
                alignItems: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: 12
              }}>
                <Text style={{ fontSize: 48, marginBottom: 8 }}>📂</Text>
                <Text style={[styles.modernTitle, { fontSize: 16, marginBottom: 4 }]}>
                  Ingen kategorier
                </Text>
                <Text style={{ color: COLORS.textSecondary, textAlign: 'center' }}>
                  Tilføj din første kategori for at organisere dine varer
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Close button */}
          <View style={{ padding: 20, paddingTop: 10 }}>
            <GhostButton
              title="Luk"
              onPress={onClose}
            />
          </View>
        </View>

        {/* Add Category Modal */}
        <AddCategoryModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onAdd={handleAddCategory}
        />

        {/* Edit Category Modal */}
        <EditCategoryModal
          visible={editModalVisible}
          category={editingCategory}
          onClose={() => {
            setEditModalVisible(false);
            setEditingCategory(null);
          }}
          onUpdate={handleUpdateCategory}
        />
      </View>
    </Modal>
  );
}