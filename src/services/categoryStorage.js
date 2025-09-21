/**
 * Category storage service
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES_KEY = '@foogood_categories';

// Default categories
const DEFAULT_CATEGORIES = [
  { id: 'fridge', name: 'Køleskab', icon: '❄️' },
  { id: 'freezer', name: 'Fryser', icon: '🧊' }
];

/**
 * Load categories from storage
 * @returns {Promise<Array>} Array of categories
 */
export async function loadCategories() {
  try {
    const data = await AsyncStorage.getItem(CATEGORIES_KEY);
    if (!data) {
      // If no categories exist, save and return defaults
      await saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading categories:', error);
    return DEFAULT_CATEGORIES;
  }
}

/**
 * Save categories to storage
 * @param {Array} categories - Categories to save
 */
export async function saveCategories(categories) {
  try {
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
    throw error;
  }
}

/**
 * Add a new category
 * @param {Object} category - Category to add
 * @returns {Promise<Array>} Updated categories array
 */
export async function addCategory(category) {
  const categories = await loadCategories();
  const newCategory = {
    id: Date.now().toString(),
    name: category.name,
    icon: category.icon || '📁',
    ...category
  };
  
  const updatedCategories = [...categories, newCategory];
  await saveCategories(updatedCategories);
  return updatedCategories;
}

/**
 * Update an existing category
 * @param {string} categoryId - ID of category to update
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Array>} Updated categories array
 */
export async function updateCategory(categoryId, updates) {
  const categories = await loadCategories();
  const updatedCategories = categories.map(cat => 
    cat.id === categoryId ? { ...cat, ...updates } : cat
  );
  await saveCategories(updatedCategories);
  return updatedCategories;
}

/**
 * Delete a category
 * @param {string} categoryId - ID of category to delete
 * @returns {Promise<Array>} Updated categories array
 */
export async function deleteCategory(categoryId) {
  const categories = await loadCategories();
  const updatedCategories = categories.filter(cat => cat.id !== categoryId);
  await saveCategories(updatedCategories);
  return updatedCategories;
}

/**
 * Clear all categories and reset to defaults
 */
export async function clearCategories() {
  try {
    await AsyncStorage.removeItem(CATEGORIES_KEY);
  } catch (error) {
    console.error('Error clearing categories:', error);
    throw error;
  }
}