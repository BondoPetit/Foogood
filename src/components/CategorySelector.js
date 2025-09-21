/**
 * Category Selector Component
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';

import { useAppContext } from '../context/AppContext';
import { COLORS } from '../utils/theme';
import { styles } from '../styles/styles';

export function CategorySelector({ selectedCategoryId, onSelect, style }) {
  const { categories } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId) || categories[0];

  const handleSelect = (categoryId) => {
    onSelect(categoryId);
    setModalVisible(false);
  };

  return (
    <View style={style}>
      <TouchableOpacity
        style={[styles.modernInput, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>{selectedCategory?.icon}</Text>
          <Text style={[styles.inputText, { color: COLORS.textPrimary }]}>
            {selectedCategory?.name || 'Vælg kategori'}
          </Text>
        </View>
        <Text style={{ color: COLORS.textSecondary, fontSize: 18 }}>▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View 
            style={{ 
              backgroundColor: COLORS.white,
              borderTopLeftRadius: 20, 
              borderTopRightRadius: 20 
            }}
          >
            <SafeAreaView style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingVertical: 20,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0,0,0,0.1)'
              }}>
                <Text style={[styles.modernTitle, { color: COLORS.textPrimary }]}>Vælg kategori</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={{ color: COLORS.textPrimary, fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 300, marginTop: 10 }}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      marginVertical: 4,
                      backgroundColor: selectedCategoryId === category.id 
                        ? 'rgba(79,70,229,0.1)' 
                        : '#f9fafb',
                      borderRadius: 12,
                    }}
                    onPress={() => handleSelect(category.id)}
                  >
                    <Text style={{ fontSize: 24, marginRight: 12 }}>{category.icon}</Text>
                    <Text style={[styles.modernSubtitle, { color: COLORS.textPrimary, flex: 1 }]}>
                      {category.name}
                    </Text>
                    {selectedCategoryId === category.id && (
                      <Text style={{ color: COLORS.primary, fontSize: 18 }}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

CategorySelector.propTypes = {
  selectedCategoryId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  style: PropTypes.object,
};