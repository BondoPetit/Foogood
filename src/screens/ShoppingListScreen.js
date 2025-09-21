/**
 * Shopping List Screen - Manage shopping list items with smart categorization
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { COLORS } from '../utils/theme';
import { styles } from '../styles/styles';
import { ScreenHeader, EmptyState, PrimaryButton, GhostButton } from '../components/UI';
import { ShoppingIcon } from '../components/Logo';
import {
  getShoppingList,
  addToShoppingList,
  toggleShoppingItem,
  removeFromShoppingList,
  clearCheckedItems,
  clearShoppingList,
  groupShoppingListByCategory,
  getShoppingStats,
  exportShoppingListAsText
} from '../services/shoppingListService';

export function ShoppingListScreen() {
  const [shoppingList, setShoppingList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load shopping list when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadShoppingList();
    }, [])
  );

  const loadShoppingList = async () => {
    try {
      setIsLoading(true);
      const items = await getShoppingList();
      setShoppingList(items);
    } catch (error) {
      console.error('Error loading shopping list:', error);
      Alert.alert('Fejl', 'Kunne ikke indlæse indkøbsliste');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert('Fejl', 'Indtast et produktnavn');
      return;
    }

    try {
      const item = {
        name: newItemName.trim(),
        amount: newItemAmount.trim() || '1 stk',
        source: 'manual'
      };

      const updatedList = await addToShoppingList(item);
      setShoppingList(updatedList);
      setNewItemName('');
      setNewItemAmount('');
      setShowAddForm(false);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Fejl', 'Kunne ikke tilføje produkt');
    }
  };

  const handleToggleItem = async (itemId) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const updatedList = await toggleShoppingItem(itemId);
      setShoppingList(updatedList);
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleRemoveItem = async (itemId, itemName) => {
    Alert.alert(
      'Fjern produkt',
      `Er du sikker på at du vil fjerne "${itemName}" fra indkøbslisten?`,
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Fjern',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedList = await removeFromShoppingList(itemId);
              setShoppingList(updatedList);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Fejl', 'Kunne ikke fjerne produkt');
            }
          }
        }
      ]
    );
  };

  const handleClearChecked = () => {
    const checkedCount = shoppingList.filter(item => item.isChecked).length;
    if (checkedCount === 0) {
      Alert.alert('Ingen afkrydsede varer', 'Der er ingen afkrydsede varer at fjerne');
      return;
    }

    Alert.alert(
      'Fjern afkrydsede varer',
      `Er du sikker på at du vil fjerne ${checkedCount} afkrydsede varer?`,
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Fjern',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedList = await clearCheckedItems();
              setShoppingList(updatedList);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error clearing checked items:', error);
              Alert.alert('Fejl', 'Kunne ikke fjerne afkrydsede varer');
            }
          }
        }
      ]
    );
  };

  const handleClearAll = () => {
    if (shoppingList.length === 0) return;

    Alert.alert(
      'Ryd indkøbsliste',
      'Er du sikker på at du vil rydde hele indkøbslisten?',
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Ryd alt',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearShoppingList();
              setShoppingList([]);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error clearing shopping list:', error);
              Alert.alert('Fejl', 'Kunne ikke rydde indkøbsliste');
            }
          }
        }
      ]
    );
  };

  const handleShareList = async () => {
    try {
      const text = exportShoppingListAsText(shoppingList);
      await Share.share({
        message: text,
        title: 'FooGood Indkøbsliste'
      });
    } catch (error) {
      console.error('Error sharing shopping list:', error);
      Alert.alert('Fejl', 'Kunne ikke dele indkøbsliste');
    }
  };

  // Calculate statistics
  const stats = useMemo(() => getShoppingStats(shoppingList), [shoppingList]);

  // Group items by category
  const groupedItems = useMemo(() => groupShoppingListByCategory(shoppingList), [shoppingList]);

  if (isLoading) {
    return (
      <LinearGradient colors={COLORS.gradients.primary} style={styles.screenGradient}>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar style="dark" />
          <ScreenHeader 
            title="Indkøbsliste" 
            customIcon={<ShoppingIcon size={60} />}
            bannerMode={true}
          />
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>Indlæser...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.gradients.primary} style={styles.screenGradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        
        <ScreenHeader 
          title="Indkøbsliste" 
          subtitle={stats.total > 0 ? `${stats.unchecked} tilbage af ${stats.total} varer` : 'Tom liste'}
          customIcon={<ShoppingIcon size={60} />}
          bannerMode={true}
        />

        <ScrollView style={styles.container}>
          {/* Progress and Controls - Only shown when there are items */}
          {stats.total > 0 && (
            <View style={[styles.modernCard, { marginBottom: 20 }]}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={() => setShowAddForm(!showAddForm)}
                  style={{
                    flex: 1,
                    backgroundColor: showAddForm ? COLORS.success : COLORS.primary,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                    {showAddForm ? '✅ Luk' : '➕ Tilføj vare'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleShareList}
                  style={{
                    backgroundColor: '#6366f1',
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    minWidth: 60,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                    📤
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{
                height: 1,
                backgroundColor: COLORS.border,
                marginVertical: 16
              }} />
              
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={[styles.modernTitle, { fontSize: 18, color: COLORS.primary }]}>
                    📊 Fremgang
                  </Text>
                  <Text style={{ color: COLORS.success, fontSize: 16, fontWeight: '700' }}>
                    {stats.progress}%
                  </Text>
                </View>
                
                <View style={{
                  height: 12,
                  backgroundColor: COLORS.border,
                  borderRadius: 6,
                  overflow: 'hidden',
                  marginBottom: 12
                }}>
                  <View style={{
                    height: '100%',
                    width: `${stats.progress}%`,
                    backgroundColor: COLORS.success,
                    borderRadius: 6,
                    shadowColor: COLORS.success,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4
                  }} />
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: COLORS.success, fontSize: 14, fontWeight: '600' }}>
                    ✅ {stats.checked} afkrydset
                  </Text>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' }}>
                    📝 {stats.unchecked} tilbage
                  </Text>
                  {stats.essential > 0 && (
                    <Text style={{ color: COLORS.warning, fontSize: 14, fontWeight: '700' }}>
                      ⭐ {stats.essential} vigtige
                    </Text>
                  )}
                </View>
              </View>

              {/* Action Buttons for Lists with Items */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {stats.checked > 0 && (
                  <TouchableOpacity
                    onPress={handleClearChecked}
                    style={{
                      flex: 1,
                      backgroundColor: COLORS.success,
                      padding: 12,
                      borderRadius: 10,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                      🗑️ Ryd afkrydsede ({stats.checked})
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  onPress={handleClearAll}
                  style={{
                    flex: stats.checked > 0 ? 1 : 2,
                    backgroundColor: '#ef4444',
                    padding: 12,
                    borderRadius: 10,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                    🗑️ Ryd alt
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Add Item Form - Enhanced Design - Only shown when form is open */}
          {showAddForm && (
            <View style={[styles.modernCard, { 
              marginBottom: 20,
              borderWidth: 2,
              borderColor: COLORS.primary,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5
            }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 24, marginRight: 8 }}>🛍️</Text>
                <Text style={[styles.modernTitle, { fontSize: 18, color: COLORS.primary }]}>
                  Tilføj ny vare
                </Text>
              </View>
              
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 }}>
                  Produktnavn *
                </Text>
                <TextInput
                  style={[styles.input, { 
                    borderWidth: 2,
                    borderColor: newItemName.trim() ? COLORS.success : COLORS.border,
                    fontSize: 16,
                    padding: 14
                  }]}
                  placeholder="F.eks. Mælk, Brød, Bananer..."
                  value={newItemName}
                  onChangeText={setNewItemName}
                  autoCapitalize="words"
                  autoFocus={true}
                />
              </View>
              
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 }}>
                  Mængde (valgfrit)
                </Text>
                <TextInput
                  style={[styles.input, { 
                    borderWidth: 2,
                    borderColor: COLORS.border,
                    fontSize: 16,
                    padding: 14
                  }]}
                  placeholder="F.eks. 1 liter, 500g, 2 stk..."
                  value={newItemAmount}
                  onChangeText={setNewItemAmount}
                />
              </View>
              
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddForm(false);
                    setNewItemName('');
                    setNewItemAmount('');
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: COLORS.border,
                    padding: 16,
                    borderRadius: 10,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: COLORS.textSecondary, fontWeight: '700', fontSize: 16 }}>
                    ❌ Annuller
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleAddItem}
                  disabled={!newItemName.trim()}
                  style={{
                    flex: 2,
                    backgroundColor: newItemName.trim() ? COLORS.success : COLORS.border,
                    padding: 16,
                    borderRadius: 10,
                    alignItems: 'center',
                    shadowColor: newItemName.trim() ? COLORS.success : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: newItemName.trim() ? 3 : 0
                  }}
                >
                  <Text style={{ 
                    color: newItemName.trim() ? 'white' : COLORS.textSecondary, 
                    fontWeight: '700',
                    fontSize: 16
                  }}>
                    ✅ Tilføj vare
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Shopping List Items */}
          {shoppingList.length === 0 ? (
            <View style={[styles.modernCard, { 
              alignItems: 'center', 
              padding: 32,
              backgroundColor: 'rgba(74, 85, 104, 0.05)',
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: COLORS.border
            }]}>
              <Text style={{ fontSize: 64, marginBottom: 16 }}>🛒</Text>
              <Text style={[styles.modernTitle, { fontSize: 20, marginBottom: 8, textAlign: 'center' }]}>
                Tom indkøbsliste
              </Text>
              <Text style={{ 
                color: COLORS.textSecondary, 
                fontSize: 16, 
                textAlign: 'center',
                lineHeight: 24,
                marginBottom: 20
              }}>
                {showAddForm 
                  ? "Udfyld formularen ovenfor for at tilføje din første vare" 
                  : "Tilføj ingredienser fra AI opskrifter eller start med knappen nedenfor"
                }
              </Text>
              
              {!showAddForm && (
                <TouchableOpacity
                  onPress={() => setShowAddForm(true)}
                  style={{
                    backgroundColor: COLORS.primary,
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 12,
                    shadowColor: COLORS.primary,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 4
                  }}
                >
                  <Text style={{ 
                    color: 'white', 
                    fontWeight: '700', 
                    fontSize: 16 
                  }}>
                    🛍️ Start din indkøbsliste
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {groupedItems.map((category) => (
                <View key={category.name} style={[styles.modernCard, { 
                  marginBottom: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3
                }]}>
                  {/* Category Header - Enhanced */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                    paddingBottom: 12,
                    borderBottomWidth: 2,
                    borderBottomColor: COLORS.border,
                    backgroundColor: 'rgba(74, 85, 104, 0.03)',
                    marginHorizontal: -16,
                    marginTop: -16,
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12
                  }}>
                    <Text style={{ fontSize: 24, marginRight: 12 }}>{category.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modernTitle, { fontSize: 18, color: COLORS.primary }]}>
                        {category.name}
                      </Text>
                      <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                        {category.items.filter(item => !item.isChecked).length} tilbage af {category.items.length}
                      </Text>
                    </View>
                    
                    {/* Category Progress Circle */}
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: COLORS.border,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text style={{ 
                        color: COLORS.textSecondary, 
                        fontSize: 12, 
                        fontWeight: '700' 
                      }}>
                        {Math.round((category.items.filter(item => item.isChecked).length / category.items.length) * 100)}%
                      </Text>
                    </View>
                  </View>

                  {/* Category Items - Enhanced Design */}
                  {category.items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handleToggleItem(item.id)}
                      onLongPress={() => handleRemoveItem(item.id, item.name)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 14,
                        paddingHorizontal: 12,
                        backgroundColor: item.isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(74, 85, 104, 0.02)',
                        borderRadius: 12,
                        marginBottom: 8,
                        opacity: item.isChecked ? 0.7 : 1,
                        borderWidth: item.isChecked ? 1 : 0,
                        borderColor: item.isChecked ? COLORS.success : 'transparent'
                      }}
                    >
                      {/* Enhanced Checkbox */}
                      <View style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        borderWidth: 3,
                        borderColor: item.isChecked ? COLORS.success : COLORS.border,
                        backgroundColor: item.isChecked ? COLORS.success : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                        shadowColor: item.isChecked ? COLORS.success : 'transparent',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4
                      }}>
                        {item.isChecked && (
                          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
                        )}
                      </View>

                      {/* Enhanced Item Info */}
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={{
                            fontSize: 18,
                            fontWeight: '700',
                            color: item.isChecked ? COLORS.textSecondary : COLORS.textPrimary,
                            textDecorationLine: item.isChecked ? 'line-through' : 'none',
                            flex: 1
                          }}>
                            {item.name}
                          </Text>
                          {item.essential && <Text style={{ fontSize: 20, marginLeft: 8 }}>⭐</Text>}
                        </View>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <Text style={{
                            fontSize: 14,
                            color: COLORS.textSecondary,
                            textDecorationLine: item.isChecked ? 'line-through' : 'none',
                            fontWeight: '600'
                          }}>
                            📦 {item.amount}
                          </Text>
                          
                          {item.source === 'recipe' && item.recipeName && (
                            <View style={{
                              backgroundColor: 'rgba(139, 92, 246, 0.15)',
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: 'rgba(139, 92, 246, 0.3)'
                            }}>
                              <Text style={{ fontSize: 11, color: '#8b5cf6', fontWeight: '700' }}>
                                🍳 {item.recipeName}
                              </Text>
                            </View>
                          )}
                          
                          {item.priority === 'high' && (
                            <View style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: 'rgba(239, 68, 68, 0.3)'
                            }}>
                              <Text style={{ fontSize: 11, color: '#ef4444', fontWeight: '700' }}>
                                🚨 VIGTIGT
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}