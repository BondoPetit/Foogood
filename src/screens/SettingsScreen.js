/**
 * Settings Screen - Simplified app configuration and category management
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useAppContext } from '../context/AppContext';
import { getShoppingList, getShoppingStats } from '../services/shoppingListService';
import { COLORS } from '../utils/theme';
import { styles } from '../styles/styles';
import { ScreenHeader, PrimaryButton } from '../components/UI';
import { SettingsIcon } from '../components/Logo';
import { CategoryManagementModal } from '../components/CategoryManagementModal';

export function SettingsScreen() {
  const { items } = useAppContext();
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [shoppingListStats, setShoppingListStats] = useState({ total: 0, checked: 0, unchecked: 0 });

  // Load shopping list stats when screen loads
  useEffect(() => {
    loadShoppingListStats();
  }, []);

  const loadShoppingListStats = async () => {
    try {
      const shoppingList = await getShoppingList();
      const stats = getShoppingStats(shoppingList);
      setShoppingListStats(stats);
    } catch (error) {
      console.error('Error loading shopping list stats:', error);
    }
  };

  return (
    <LinearGradient colors={COLORS.gradients.settings} style={styles.screenGradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        
        <ScreenHeader 
          title="Indstillinger" 
          customIcon={<SettingsIcon size={60} />}
          bannerMode={true}
        />

        <ScrollView style={styles.container}>
          {/* App Overview Statistics */}
          <View style={[styles.modernCard, { marginBottom: 20 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modernTitle, { fontSize: 20, color: COLORS.primary }]}>
                  App Oversigt
                </Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                  Din aktivitet i FooGood
                </Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* Pantry Stats */}
              <View style={{
                flex: 1,
                backgroundColor: 'rgba(74, 85, 104, 0.05)',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 24, marginBottom: 4 }}>🏠</Text>
                <Text style={{ fontSize: 24, fontWeight: '700', color: COLORS.primary, marginBottom: 2 }}>
                  {items.length}
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' }}>
                  Varer i pantry
                </Text>
              </View>
              
              {/* Shopping List Stats */}
              <View style={{
                flex: 1,
                backgroundColor: 'rgba(74, 85, 104, 0.05)',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 24, marginBottom: 4 }}>🛒</Text>
                <Text style={{ fontSize: 24, fontWeight: '700', color: COLORS.success, marginBottom: 2 }}>
                  {shoppingListStats.total}
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' }}>
                  På indkøbsliste
                </Text>
              </View>
              
              {/* Expiring Soon */}
              <View style={{
                flex: 1,
                backgroundColor: 'rgba(74, 85, 104, 0.05)',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 24, marginBottom: 4 }}>⏰</Text>
                <Text style={{ fontSize: 24, fontWeight: '700', color: COLORS.warning, marginBottom: 2 }}>
                  {items.filter(item => {
                    const today = new Date();
                    const expiry = new Date(item.expiryDate);
                    const diffTime = expiry - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 3 && diffDays >= 0;
                  }).length}
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' }}>
                  Udløber snart
                </Text>
              </View>
            </View>
          </View>

          {/* Category Management - Primary Feature */}
          <View style={[styles.modernCard, { 
            marginBottom: 20,
            borderWidth: 2,
            borderColor: COLORS.primary,
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4
          }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 32, marginRight: 12 }}>📂</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modernTitle, { fontSize: 18, color: COLORS.primary }]}>
                  Kategorier
                </Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                  Tilpas kategorier
                </Text>
              </View>
            </View>
            
            <Text style={{ 
              color: COLORS.textSecondary, 
              marginBottom: 20,
              lineHeight: 22,
              fontSize: 15
            }}>
              Administrer dine kategorier for at organisere dine varer bedre. Du kan tilføje, redigere og slette kategorier efter dine behov.
            </Text>
            
            <TouchableOpacity
              onPress={() => setCategoryModalVisible(true)}
              style={{
                backgroundColor: COLORS.primary,
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 12,
                alignItems: 'center',
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 3
              }}
            >
              <Text style={{ 
                color: 'white', 
                fontSize: 16, 
                fontWeight: '700' 
              }}>
                🛠️ Administrer kategorier
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category Management Modal */}
          <CategoryManagementModal
            visible={categoryModalVisible}
            onClose={() => setCategoryModalVisible(false)}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}