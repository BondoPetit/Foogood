/**
 * Delete Category Modal Component
 */
import React from 'react';
import { View, Text, Modal, Alert } from 'react-native';
import { COLORS } from '../utils/theme';
import { styles } from '../styles/styles';
import { PrimaryButton, GhostButton } from './UI';

export function DeleteCategoryModal({ visible, category, onClose, onDelete, itemCount }) {
  const handleDelete = () => {
    if (itemCount > 0) {
      Alert.alert(
        "Kan ikke slette",
        `Kategorien "${category?.name}" indeholder ${itemCount} vare${itemCount !== 1 ? 'r' : ''}. Flyt eller slet varerne først.`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Slet kategori",
      `Er du sikker på at du vil slette kategorien "${category?.name}"?`,
      [
        { text: "Annuller", style: "cancel" },
        { 
          text: "Slet", 
          style: "destructive",
          onPress: () => {
            onDelete(category.id);
            onClose();
          }
        }
      ]
    );
  };

  if (!category) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <View style={[styles.modernCard, { width: '100%', maxWidth: 350 }]}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>{category.icon}</Text>
            <Text style={styles.modernTitle}>Slet "{category.name}"?</Text>
          </View>
          
          {itemCount > 0 ? (
            <Text style={[styles.modernSubtitle, { textAlign: 'center', color: COLORS.danger, marginBottom: 20 }]}>
              Denne kategori indeholder {itemCount} vare{itemCount !== 1 ? 'r' : ''}.{'\n'}
              Du kan ikke slette kategorier med varer.
            </Text>
          ) : (
            <Text style={[styles.modernSubtitle, { textAlign: 'center', marginBottom: 20 }]}>
              Denne handling kan ikke fortrydes.
            </Text>
          )}

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <GhostButton
                title="Annuller"
                onPress={onClose}
              />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title={itemCount > 0 ? "OK" : "Slet"}
                onPress={itemCount > 0 ? onClose : handleDelete}
                style={{ 
                  backgroundColor: itemCount > 0 ? COLORS.primary : COLORS.danger 
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}