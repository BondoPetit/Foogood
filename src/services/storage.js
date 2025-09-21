/**
 * Storage service for persisting app data
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "expiry_items_v1";

/**
 * Load items from storage
 * @returns {Promise<Array>} Array of food items
 */
export async function loadItems() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load items from storage:", error);
    return [];
  }
}

/**
 * Save items to storage
 * @param {Array} items - Array of food items to save
 * @returns {Promise<void>}
 */
export async function saveItems(items) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save items to storage:", error);
    throw new Error("Kunne ikke gemme data");
  }
}

/**
 * Clear all items from storage
 * @returns {Promise<void>}
 */
export async function clearStorage() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear storage:", error);
    throw new Error("Kunne ikke slette data");
  }
}