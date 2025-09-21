/**
 * Pantry Screen - Main food inventory management
 */
import React, { useState, useMemo } from 'react';
import { ScrollView, TextInput, Image, ActivityIndicator, Alert, View, Text, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, Camera } from 'expo-camera';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

import { useAppContext } from '../context/AppContext';
import { lookupOpenFoodFacts } from '../services/api';
import { parseISOorEmpty, daysUntilExpiry, formatDate } from '../utils/dateUtils';
import { showDeleteConfirmation } from '../utils/alertUtils';
import { COLORS } from '../utils/theme';
import { styles } from '../styles/styles';
import { CategorySelector } from '../components/CategorySelector';
import { AddCategoryModal } from '../components/AddCategoryModal';
import { Logo } from '../components/Logo';
import { 
  ScreenHeader, 
  StatusBadge, 
  EmptyState,
  PrimaryButton,
  GhostButton,
  DeleteButton
} from '../components/UI';

export function PantryScreen({ navigation }) {
  const { items, categories, addItem, deleteItem, addCategory, removeCategory } = useAppContext();
  
  // View state
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'add-item', or 'category-detail'
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  
  // Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState(null);
  const [scanInProgress, setScanInProgress] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [date, setDate] = useState(new Date());
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("fridge");
  const [imageUrlPreview, setImageUrlPreview] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lastLookupBarcode, setLastLookupBarcode] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [items]);

  // Get category statistics
  const categoryStats = useMemo(() => {
    return categories.map(category => {
      const categoryItems = items.filter(item => item.categoryId === category.id);
      const nextExpiring = categoryItems.length > 0 
        ? categoryItems.reduce((earliest, item) => 
            new Date(item.expiryDate) < new Date(earliest.expiryDate) ? item : earliest
          )
        : null;
      
      return {
        ...category,
        itemCount: categoryItems.length,
        nextExpiring,
        daysUntilNext: nextExpiring ? daysUntilExpiry(nextExpiring.expiryDate) : null
      };
    }).filter(cat => cat.itemCount > 0); // Only show categories with items
  }, [categories, items]);

  // Get items for selected category
  const selectedCategoryItems = useMemo(() => {
    if (!selectedCategoryId) return [];
    return items
      .filter(item => item.categoryId === selectedCategoryId)
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [items, selectedCategoryId]);

  async function performLookup(code) {
    if (!code || code === lastLookupBarcode && (name || imageUrlPreview)) return;
    try {
      setLookupLoading(true);
      setLastLookupBarcode(code);
      const hit = await lookupOpenFoodFacts(code);
      if (!hit) {
        Alert.alert("Ikke fundet", "Kunne ikke finde produkt for den stregkode.");
        setImageUrlPreview(null);
        return;
      }
      if (!name.trim()) setName(hit.displayName);
      setImageUrlPreview(hit.imageUrl || null);
    } catch (err) {
      Alert.alert("Opslag fejlede", "Der opstod en fejl under produktopslag.");
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleAddItem() {
    if (!name.trim() || !date) {
      Alert.alert("Manglende felter", "Udfyld mindst navn og udløbsdato.");
      return;
    }
    
    try {
      await addItem({
        name: name.trim(),
        qty: Number(qty) || 1,
        expiryDate: formatDate(date),
        barcode: barcode.trim() || "",
        categoryId: categoryId,
        imageUrl: imageUrlPreview || null
      });

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show success message
      Alert.alert(
        "Succes! ✅", 
        `${name.trim()} er tilføjet til dit pantry!`,
        [
          {
            text: "Tilføj mere",
            style: "default",
            onPress: () => {
              // Reset form but stay on add screen
              setName("");
              setQty("1");
              setDate(new Date());
              setBarcode("");
              setImageUrlPreview(null);
              setLastLookupBarcode("");
            }
          },
          {
            text: "Tilbage til oversigt",
            style: "default", 
            onPress: () => {
              // Reset form and go back
              setName("");
              setQty("1");
              setDate(new Date());
              setBarcode("");
              setCategoryId("fridge");
              setImageUrlPreview(null);
              setLastLookupBarcode("");
              setCurrentView('dashboard');
            }
          }
        ]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Fejl", "Kunne ikke tilføje produktet. Prøv igen.");
    }
  }

  async function handleAddCategory(categoryData) {
    try {
      await addCategory(categoryData);
      Alert.alert("Succes", `Kategorien "${categoryData.name}" er oprettet!`);
    } catch (error) {
      Alert.alert("Fejl", "Kunne ikke oprette kategorien. Prøv igen.");
    }
  }

  // Product categories with expiry days
  const PRODUCT_CATEGORIES = {
    dairy: { keywords: ['mælk', 'milk', 'yoghurt', 'fløde'], days: 8 },
    bread: { keywords: ['brød', 'bread', 'bagel', 'toast'], days: 4 },
    meat: { keywords: ['kød', 'meat', 'chicken', 'beef', 'pork'], days: 2 },
    fish: { keywords: ['fisk', 'fish', 'laks', 'salmon'], days: 1 },
    eggs: { keywords: ['æg', 'egg'], days: 21 },
    fruit: { keywords: ['frugt', 'fruit', 'apple', 'banana', 'æble'], days: 6 },
    vegetables: { keywords: ['grøntsag', 'vegetable', 'salat', 'lettuce'], days: 6 },
    pantry: { keywords: ['kaffe', 'coffee', 'te', 'tea', 'krydder', 'mel', 'flour', 'sukker', 'sugar', 'ris', 'rice', 'pasta'], days: 180 },
    canned: { keywords: ['konserv', 'can', 'dåse'], days: 365 }
  };

  // Function to suggest expiry date based on product type
  const suggestExpiryDate = (productName) => {
    const today = new Date();
    const productLower = productName.toLowerCase();
    
    // Find matching category
    for (const category of Object.values(PRODUCT_CATEGORIES)) {
      if (category.keywords.some(keyword => productLower.includes(keyword))) {
        today.setDate(today.getDate() + category.days);
        return today;
      }
    }
    
    // Default: 1 week
    today.setDate(today.getDate() + 7);
    return today;
  };

  const handleSuggestDate = () => {
    if (!name.trim()) {
      Alert.alert("Ingen produktnavn", "Indtast et produktnavn først for at få en datoforslag.");
      return;
    }
    
    const suggestedDate = suggestExpiryDate(name);
    setDate(suggestedDate);
    Alert.alert("Dato foreslået", `Udløbsdato sat til ${suggestedDate.toLocaleDateString('da-DK')} baseret på produkttype.`);
  };

  // Scanner functions
  async function requestCameraPermission() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
    return status === "granted";
  }

  async function openScanner() {
    if (hasPermission === null) {
      const granted = await requestCameraPermission();
      if (!granted) {
        Alert.alert("Kamera adgang nødvendig", "Tillad kamera adgang for at scanne stregkoder.");
        return;
      }
    } else if (hasPermission === false) {
      Alert.alert("Kamera adgang nødvendig", "Tillad kamera adgang for at scanne stregkoder.");
      return;
    }
    // Reset all scanning state before opening
    setScanned(false);
    setScanInProgress(false);
    setLastScannedBarcode(null);
    setShowScanner(true);
  }

  async function handleBarcodeScan({ data }) {
    const code = String(data);
    
    // Prevent multiple scans of the same barcode or if scan is in progress
    if (scanned || scanInProgress || lastScannedBarcode === code) {
      return;
    }
    
    setScanned(true); // Mark as scanned to prevent multiple triggers
    setScanInProgress(true); // Set scan in progress flag
    setLastScannedBarcode(code); // Store the scanned barcode
    setBarcode(code);
    setShowScanner(false); // Close scanner immediately
    setLookupLoading(true);
    
    try {
      const hit = await lookupOpenFoodFacts(code);
      if (hit) {
        setName(hit.displayName);
        setImageUrlPreview(hit.imageUrl || null);
        Alert.alert("Produkt fundet!", `${hit.displayName} tilføjet til formularen.`);
      } else {
        Alert.alert("Ikke fundet", "Kunne ikke finde produkt for den stregkode.");
      }
    } catch {
      Alert.alert("Opslag fejlede", "Der opstod en fejl under produktopslag.");
    } finally {
      setLookupLoading(false);
      setScanInProgress(false); // Reset scan in progress flag
      setLastLookupBarcode(code); // Store the scanned barcode
    }
  }

  // Handle item deletion with confirmation
  const handleDeleteItem = (item) => {
    showDeleteConfirmation(item.name, () => deleteItem(item.id));
  };

  // Pull to refresh function
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh delay (in a real app, you might refetch data here)
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <LinearGradient colors={COLORS.gradients.pantry} style={styles.screenGradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        
        {/* Kombineret header med logo og navigation */}
        <View style={{
          backgroundColor: COLORS.backgroundLight,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0,0,0,0.05)',
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          {currentView === 'dashboard' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Logo size={60} />
              <Text style={[styles.modernTitle, { marginBottom: 0, flex: 1, textAlign: 'center' }]}>INVENTORY</Text>
              <TouchableOpacity
                onPress={() => setCurrentView('add-item')}
                style={{
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  shadowColor: COLORS.black,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>+</Text>
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>ADD</Text>
              </TouchableOpacity>
            </View>
          ) : currentView === 'add-item' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => setCurrentView('dashboard')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 18, color: COLORS.primary, marginRight: 8 }}>←</Text>
                <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: '600' }}>Back</Text>
              </TouchableOpacity>
              <Logo size={50} />
              <Text style={[styles.modernTitle, { marginBottom: 0, fontSize: 18 }]}>ADD ITEM</Text>
              <View style={{ width: 60 }} />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => setCurrentView('dashboard')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 18, color: COLORS.primary, marginRight: 8 }}>←</Text>
                <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: '600' }}>Back</Text>
              </TouchableOpacity>
              <Logo size={50} />
              <Text style={[styles.modernTitle, { marginBottom: 0, fontSize: 16 }]}>
                {categories.find(cat => cat.id === selectedCategoryId)?.name || 'Category'}
              </Text>
              <View style={{ width: 60 }} />
            </View>
          )}
        </View>

        <ScrollView 
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <>

              {/* Soon to expire section */}
              {sortedItems.filter(item => daysUntilExpiry(item.expiryDate) <= 3 && daysUntilExpiry(item.expiryDate) >= 0).length > 0 && (
                <View style={[styles.modernCard, styles.warningCard, { marginBottom: 16 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 24, marginRight: 8 }}>⚠️</Text>
                    <Text style={[styles.modernSubtitle, { marginBottom: 0, color: '#92400e' }]}>
                      Udløber snart: {sortedItems.filter(item => daysUntilExpiry(item.expiryDate) <= 3 && daysUntilExpiry(item.expiryDate) >= 0).length} vare{sortedItems.filter(item => daysUntilExpiry(item.expiryDate) <= 3 && daysUntilExpiry(item.expiryDate) >= 0).length !== 1 ? 'r' : ''}
                    </Text>
                  </View>
                  {sortedItems
                    .filter(item => daysUntilExpiry(item.expiryDate) <= 3 && daysUntilExpiry(item.expiryDate) >= 0)
                    .slice(0, 3)
                    .map((item) => {
                      const category = categories.find(c => c.id === item.categoryId);
                      const daysLeft = daysUntilExpiry(item.expiryDate);
                      return (
                        <View key={item.id} style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          marginBottom: 8,
                          backgroundColor: 'rgba(255,255,255,0.6)',
                          padding: 8,
                          borderRadius: 8
                        }}>
                          <Text style={{ fontSize: 16, marginRight: 8 }}>{category?.icon}</Text>
                          <Text style={{ flex: 1, fontWeight: '500', color: '#92400e' }}>{item.name}</Text>
                          <View style={{
                            backgroundColor: daysLeft === 0 ? '#dc2626' : daysLeft <= 1 ? '#f59e0b' : '#10b981',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12
                          }}>
                            <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>
                              {daysLeft === 0 ? 'I dag!' : daysLeft === 1 ? '1 dag' : `${daysLeft} dage`}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                </View>
              )}

              {/* Categories overview */}
              {categoryStats.length === 0 ? (
                <EmptyState 
                  title="Ingen varer endnu"
                  subtitle="Tilføj dine fødevarer med ADD ITEM knappen"
                  emoji="🏠"
                />
              ) : (
                categoryStats.map((categoryStat) => (
                  <TouchableOpacity
                    key={categoryStat.id}
                    style={[styles.modernItemCard, { 
                      backgroundColor: COLORS.backgroundCard,
                      borderLeftWidth: 4,
                      borderLeftColor: categoryStat.daysUntilNext <= 2 ? COLORS.warning : COLORS.success
                    }]}
                    onPress={() => {
                      setSelectedCategoryId(categoryStat.id);
                      setCurrentView('category-detail');
                    }}
                  >
                    <View style={styles.itemHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={{
                          backgroundColor: 'rgba(74, 85, 104, 0.1)',
                          padding: 12,
                          borderRadius: 12,
                          marginRight: 12
                        }}>
                          <Text style={{ fontSize: 28 }}>{categoryStat.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.itemName, { fontSize: 18 }]}>{categoryStat.name}</Text>
                          <Text style={[styles.itemQty, { fontSize: 14, color: COLORS.textSecondary }]}>
                            {categoryStat.itemCount} vare{categoryStat.itemCount !== 1 ? 'r' : ''}
                          </Text>
                        </View>
                      </View>
                      {categoryStat.nextExpiring && (
                        <StatusBadge daysLeft={categoryStat.daysUntilNext} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}

          {/* Add Item View */}
          {currentView === 'add-item' && (
            <>

              {/* Add new item form */}
              <View style={styles.modernCard}>
                <Text style={[styles.modernTitle, { marginBottom: 16, fontSize: 22 }]}>Tilføj nyt produkt</Text>
            <View style={styles.inputContainer}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: COLORS.textPrimary, 
                marginBottom: 6 
              }}>
                Produktnavn
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TextInput
                  style={[styles.modernInput, { flex: 1 }]}
                  placeholder="F.eks. Mælk, Brød, Æbler..."
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.success,
                    padding: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: COLORS.black,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={openScanner}
                >
                  <Text style={{ fontSize: 16, color: 'white' }}>📷</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: COLORS.textPrimary, 
                marginBottom: 6 
              }}>
                Antal
              </Text>
              <TextInput
                style={styles.modernInput}
                placeholder="Hvor mange styk?"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={qty}
                onChangeText={setQty}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: COLORS.textPrimary, 
                marginBottom: 6 
              }}>
                Kategori
              </Text>
              <CategorySelector
                selectedCategoryId={categoryId}
                onSelect={setCategoryId}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: COLORS.textPrimary, 
                marginBottom: 6 
              }}>
                Udløbsdato
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.modernInput, { flex: 1 }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: date ? COLORS.textPrimary : '#9ca3af', fontSize: 16 }}>
                    {date ? date.toLocaleDateString('da-DK') : 'Vælg udløbsdato'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.warning,
                    padding: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: COLORS.black,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={handleSuggestDate}
                >
                  <Text style={{ fontSize: 16, color: 'white' }}>💡</Text>
                </TouchableOpacity>
              </View>
            </View>
            {lookupLoading && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 12, 
                justifyContent: 'center',
                backgroundColor: COLORS.backgroundCard,
                padding: 16,
                borderRadius: 12,
                marginVertical: 8
              }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={{ fontSize: 16 }}>⏳</Text>
                <Text style={{ 
                  color: COLORS.textPrimary,
                  fontSize: 16,
                  fontWeight: '500'
                }}>
                  Slår produkt op...
                </Text>
              </View>
            )}
            {imageUrlPreview && (
              <Image source={{ uri: imageUrlPreview }} style={styles.productImage} />
            )}
            <PrimaryButton 
              title="✨ Tilføj til pantry" 
              onPress={handleAddItem}
              style={styles.modernButton}
            />
          </View>
            </>
          )}

          {/* Category Detail View */}
          {currentView === 'category-detail' && (
            <>
              <Text style={[styles.modernSubtitle, { marginTop: 8 }]}>
                {selectedCategoryItems.length} vare{selectedCategoryItems.length !== 1 ? 'r' : ''} i denne kategori
              </Text>
              
              {selectedCategoryItems.length === 0 ? (
                <EmptyState 
                  title="Ingen varer i denne kategori"
                  subtitle="Tilføj fødevarer til denne kategori"
                  emoji="📦"
                />
              ) : (
                selectedCategoryItems.map((item) => {
                  const category = categories.find(cat => cat.id === item.categoryId) || categories[0];
                  return (
                    <View key={item.id} style={styles.modernItemCard}>
                      <View style={styles.itemHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <Text style={{ fontSize: 16, marginRight: 8 }}>{category?.icon}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemExpiry}>Udløber: {item.expiryDate}</Text>
                            <Text style={styles.itemQty}>Antal: {item.qty}</Text>
                          </View>
                        </View>
                        <View style={{ alignItems: 'center', gap: 6 }}>
                          <StatusBadge daysLeft={daysUntilExpiry(item.expiryDate)} />
                          <DeleteButton
                            onPress={() => handleDeleteItem(item)}
                            size="medium"
                          />
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </>
          )}
        </ScrollView>
        
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
            minimumDate={new Date()}
          />
        )}
        
        {/* Add Category Modal */}
        <AddCategoryModal
          visible={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          onAdd={handleAddCategory}
        />

        {/* Scanner Modal */}
        <Modal
          visible={showScanner}
          animationType="slide"
          onRequestClose={() => {
            setShowScanner(false);
            setScanned(false);
          }}
        >
          <View style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
              {/* Scanner Header */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
                backgroundColor: 'rgba(0,0,0,0.8)'
              }}>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
                  📷 Scanner
                </Text>
              </View>

              {/* Camera */}
              <CameraView
                style={{ flex: 1 }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScan}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr", "pdf417", "ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
                }}
              />

              {/* Scanner Instructions with improved styling */}
              <View style={{
                position: 'absolute',
                bottom: 120,
                left: 0,
                right: 0,
                alignItems: 'center'
              }}>
                {!scanned ? (
                  <View style={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 20,
                    borderRadius: 16,
                    marginHorizontal: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}>
                    <Text style={{ 
                      color: 'white', 
                      textAlign: 'center', 
                      fontSize: 16,
                      fontWeight: '500'
                    }}>
                      🎯 Peg kameraet mod en stregkode
                    </Text>
                    <Text style={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      textAlign: 'center', 
                      fontSize: 14,
                      marginTop: 4
                    }}>
                      Stregkoden vil automatisk blive scannet
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setScanned(false);
                      setScanInProgress(false);
                      setLastScannedBarcode(null);
                    }}
                    style={{
                      backgroundColor: COLORS.primary,
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      borderRadius: 16,
                      marginHorizontal: 20,
                      shadowColor: COLORS.black,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Text style={{ 
                      color: 'white', 
                      textAlign: 'center', 
                      fontSize: 16, 
                      fontWeight: '600' 
                    }}>
                      🔄 Scan igen
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Bottom Cancel Button */}
              <View style={{
                position: 'absolute',
                bottom: 40,
                left: 20,
                right: 20,
                alignItems: 'center'
              }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowScanner(false);
                    setScanned(false);
                    setScanInProgress(false);
                    setLastScannedBarcode(null);
                  }}
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    paddingHorizontal: 32,
                    paddingVertical: 16,
                    borderRadius: 25,
                    borderWidth: 2,
                    borderColor: 'rgba(239, 68, 68, 0.8)',
                    shadowColor: '#ef4444',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text style={{ 
                    color: '#ef4444', 
                    textAlign: 'center', 
                    fontSize: 18, 
                    fontWeight: '700' 
                  }}>
                    ✕ Annuller scanning
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
