/**
 * Alert utility functions for common patterns
 */
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Show delete confirmation alert
 */
export async function showDeleteConfirmation(itemName, onConfirm) {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
  Alert.alert(
    'Slet vare',
    `Er du sikker på at du vil slette "${itemName}"?`,
    [
      { text: 'Annuller', style: 'cancel' },
      {
        text: 'Slet',
        style: 'destructive',
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onConfirm();
          Alert.alert('🗑️ Slettet', `"${itemName}" er blevet fjernet.`);
        }
      }
    ]
  );
}