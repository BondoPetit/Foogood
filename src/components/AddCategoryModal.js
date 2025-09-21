/**
 * Add Category Modal Component
 */
import React, { useState } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/theme';
import { styles } from '../styles/styles';
import { PrimaryButton, GhostButton } from './UI';

// Common category icons to choose from
const CATEGORY_ICONS = [
  '🏠', '📦', '🍳', '🛒', '🥫', '🍞', '🧄', '🥕', 
  '🍎', '🥛', '🧊', '❄️', '🔥', '📍', '📋', '🎯',
  '⭐', '💡', '🔧', '🎨', '📱', '💻', '🎭', '🎪'
];

export function AddCategoryModal({ visible, onClose, onAdd }) {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📦');

  const handleAdd = () => {
    if (!categoryName.trim()) {
      Alert.alert('Fejl', 'Indtast venligst et kategorinavn');
      return;
    }

    onAdd({
      name: categoryName.trim(),
      icon: selectedIcon
    });

    // Reset form
    setCategoryName('');
    setSelectedIcon('📦');
    onClose();
  };

  const handleCancel = () => {
    setCategoryName('');
    setSelectedIcon('📦');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <View style={[styles.modernCard, { width: '100%', maxWidth: 400 }]}>
          <Text style={styles.modernTitle}>Ny kategori 📂</Text>
          
          {/* Category name input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.modernInput}
              placeholder="Kategorinavn"
              placeholderTextColor="#9ca3af"
              value={categoryName}
              onChangeText={setCategoryName}
              autoFocus={true}
              maxLength={20}
            />
          </View>

          {/* Icon selection */}
          <Text style={[styles.modernSubtitle, { fontSize: 16, marginBottom: 12 }]}>
            Vælg ikon:
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            {CATEGORY_ICONS.map((icon, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedIcon(icon)}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: selectedIcon === icon ? COLORS.primary : '#f3f4f6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginHorizontal: 4,
                  borderWidth: 2,
                  borderColor: selectedIcon === icon ? COLORS.primary : '#e5e7eb'
                }}
              >
                <Text style={{ fontSize: 24 }}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Preview */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            backgroundColor: '#f9fafb',
            borderRadius: 12,
            marginBottom: 20
          }}>
            <Text style={{ fontSize: 24, marginRight: 8 }}>{selectedIcon}</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>
              {categoryName || 'Kategorinavn'}
            </Text>
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <GhostButton
                title="Annuller"
                onPress={handleCancel}
              />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title="Tilføj"
                onPress={handleAdd}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}