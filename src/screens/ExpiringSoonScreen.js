/**
 * Expiring Soon Screen - Shows items expiring within 2 days
 */
import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useAppContext } from '../context/AppContext';
import { daysUntilExpiry } from '../utils/dateUtils';
import { showDeleteConfirmation } from '../utils/alertUtils';
import { COLORS } from '../utils/theme';
import { styles } from '../styles/styles';
import { ScreenHeader, StatusBadge, EmptyState, DeleteButton } from '../components/UI';
import { ExpireIcon } from '../components/Logo';

export function ExpiringSoonScreen() {
  const { items, categories, deleteItem } = useAppContext();
  
  const expiringSoon = useMemo(() => {
    return items
      .filter(item => {
        const daysLeft = daysUntilExpiry(item.expiryDate);
        return daysLeft <= 2 && daysLeft >= 0; // Don't show expired items
      })
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [items]);

  const handleDeleteItem = (item) => {
    showDeleteConfirmation(item.name, () => deleteItem(item.id));
  };

  return (
    <LinearGradient colors={COLORS.gradients.expiring} style={styles.screenGradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        
        <ScreenHeader 
          title="Udløber snart" 
          subtitle="Varer der udløber inden for 2 dage"
          customIcon={<ExpireIcon size={60} />}
          bannerMode={true}
        />

        <ScrollView style={styles.container}>
          {expiringSoon.length === 0 ? (
            <EmptyState 
              title="🎉 Godt arbejde!"
              subtitle="Ingen varer udløber snart."
              emoji="⏰"
            />
          ) : (
            <>
              {/* Information card */}
              <View style={[styles.modernCard, styles.warningCard, { marginBottom: 20 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 24, marginRight: 8 }}>⚠️</Text>
                  <Text style={[styles.modernTitle, { fontSize: 18, marginBottom: 0, color: '#92400e' }]}>
                    {expiringSoon.length} vare{expiringSoon.length !== 1 ? 'r' : ''} udløber snart
                  </Text>
                </View>
                <Text style={{ color: '#92400e', fontSize: 14, lineHeight: 20 }}>
                  Varer der udløber inden for 2 dage. Overvej at bruge dem hurtigst muligt.
                </Text>
              </View>

              {/* Items list */}
              {expiringSoon.map((item) => {
                const category = categories.find(c => c.id === item.categoryId);
                const daysLeft = daysUntilExpiry(item.expiryDate);
                
                return (
                  <View key={item.id} style={[styles.modernItemCard, {
                    backgroundColor: COLORS.backgroundCard,
                    borderLeftWidth: 4,
                    borderLeftColor: daysLeft === 0 ? COLORS.danger : daysLeft <= 1 ? COLORS.warning : COLORS.success,
                    marginBottom: 12
                  }]}>
                    <View style={styles.itemHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={{
                          backgroundColor: 'rgba(74, 85, 104, 0.1)',
                          padding: 10,
                          borderRadius: 10,
                          marginRight: 12
                        }}>
                          <Text style={{ fontSize: 20 }}>{category?.icon || '📦'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemExpiry}>
                            Udløber: {new Date(item.expiryDate).toLocaleDateString('da-DK')}
                          </Text>
                          <Text style={styles.itemQty}>Antal: {item.qty}</Text>
                          {category && (
                            <Text style={[styles.itemQty, { color: COLORS.textSecondary, fontSize: 12 }]}>
                              Kategori: {category.name}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={{ alignItems: 'center', gap: 8 }}>
                        <StatusBadge daysLeft={daysLeft} />
                        <DeleteButton
                          onPress={() => handleDeleteItem(item)}
                          size="medium"
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}