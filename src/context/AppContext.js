/**
 * Application context for managing food items state
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { loadItems, saveItems, clearStorage } from '../services/storage';
import { loadCategories, saveCategories, addCategory as addCategoryService, updateCategory, deleteCategory } from '../services/categoryStorage';
import { scheduleExpiryNotification, cancelNotification, rescheduleAllNotifications } from '../services/notifications';

const AppContext = createContext();

/**
 * Hook to use app context
 * @returns {Object} App context value
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

/**
 * App context provider component
 */
export function AppProvider({ children }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data on startup
  useEffect(() => {
    loadInitialData();
  }, []);

  // Save items whenever they change
  useEffect(() => {
    if (!loading && items.length >= 0) {
      saveItemsToStorage();
    }
  }, [items, loading]);

  async function loadInitialData() {
    try {
      const [loadedItems, loadedCategories] = await Promise.all([
        loadItems(),
        loadCategories()
      ]);
      setItems(loadedItems);
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      Alert.alert('Fejl', 'Kunne ikke indlæse data fra storage');
    } finally {
      setLoading(false);
    }
  }

  async function saveItemsToStorage() {
    try {
      await saveItems(items);
    } catch (error) {
      Alert.alert('Fejl', 'Kunne ikke gemme data');
    }
  }

  /**
   * Add new food item
   * @param {Object} itemData - Item data
   */
  async function addItem(itemData) {
    try {
      const item = {
        id: String(Date.now()),
        categoryId: itemData.categoryId || 'pantry', // Default to pantry category
        ...itemData
      };

      // Schedule notification
      const notificationId = await scheduleExpiryNotification(item);
      if (notificationId) {
        item.notificationId = notificationId;
      }

      setItems(prev => [...prev, item]);
    } catch (error) {
      console.error('Failed to add item:', error);
      Alert.alert('Fejl', 'Kunne ikke tilføje vare');
    }
  }

  /**
   * Delete food item
   * @param {string} id - Item ID to delete
   */
  async function deleteItem(id) {
    try {
      const item = items.find(x => x.id === id);
      if (item?.notificationId) {
        await cancelNotification(item.notificationId);
      }
      
      setItems(prev => prev.filter(x => x.id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
      Alert.alert('Fejl', 'Kunne ikke slette vare');
    }
  }

  /**
   * Reschedule all notifications
   */
  async function rescheduleAll() {
    try {
      const updatedItems = await rescheduleAllNotifications(items);
      setItems(updatedItems);
      Alert.alert('Succes', 'Alle notifikationer er blevet genplanlagt');
    } catch (error) {
      Alert.alert('Fejl', 'Kunne ikke genplanlægge notifikationer');
    }
  }

  /**
   * Clear all items
   */
  async function clearAllItems() {
    Alert.alert(
      'Slet alle varer',
      'Er du sikker på, at du vil slette alle varer? Dette kan ikke fortrydes.',
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Slet alle',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearStorage();
              setItems([]);
              Alert.alert('Succes', 'Alle varer er blevet slettet');
            } catch (error) {
              Alert.alert('Fejl', 'Kunne ikke slette alle varer');
            }
          }
        }
      ]
    );
  }

  // Category management functions
  async function addCategory(category) {
    try {
      const updatedCategories = await addCategoryService(category);
      setCategories(updatedCategories);
      return updatedCategories;
    } catch (error) {
      Alert.alert('Fejl', 'Kunne ikke tilføje kategori');
      throw error;
    }
  }

  async function editCategory(categoryId, updates) {
    try {
      const updatedCategories = await updateCategory(categoryId, updates);
      setCategories(updatedCategories);
      return updatedCategories;
    } catch (error) {
      Alert.alert('Fejl', 'Kunne ikke opdatere kategori');
      throw error;
    }
  }

  async function removeCategory(categoryId) {
    try {
      const updatedCategories = await deleteCategory(categoryId);
      setCategories(updatedCategories);
      
      // Update items that belong to this category to use default category
      const updatedItems = items.map(item => 
        item.categoryId === categoryId 
          ? { ...item, categoryId: 'pantry' }
          : item
      );
      setItems(updatedItems);
      
      return updatedCategories;
    } catch (error) {
      Alert.alert('Fejl', 'Kunne ikke slette kategori');
      throw error;
    }
  }

  const value = {
    items,
    categories,
    loading,
    addItem,
    deleteItem,
    rescheduleAll,
    clearAllItems,
    addCategory,
    editCategory,
    removeCategory
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}