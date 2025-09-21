/**
 * Shopping List Service - Manages shopping list items with smart categorization
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const SHOPPING_LIST_KEY = '@foogood_shopping_list';

/**
 * Shopping List Item Structure:
 * {
 *   id: string,
 *   name: string,
 *   amount: string,
 *   category: string,
 *   categoryIcon: string,
 *   isChecked: boolean,
 *   priority: 'high' | 'medium' | 'low',
 *   addedDate: string,
 *   source: 'manual' | 'recipe',
 *   recipeId?: string,
 *   recipeName?: string,
 *   essential: boolean
 * }
 */

/**
 * Get all shopping list items
 */
export async function getShoppingList() {
  try {
    const stored = await AsyncStorage.getItem(SHOPPING_LIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading shopping list:', error);
    return [];
  }
}

/**
 * Save shopping list items
 */
async function saveShoppingList(items) {
  try {
    await AsyncStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Error saving shopping list:', error);
    return false;
  }
}

/**
 * Add a single item to shopping list
 */
export async function addToShoppingList(item) {
  try {
    const currentList = await getShoppingList();
    
    // Check if item already exists (by name, case insensitive)
    const existingIndex = currentList.findIndex(existing => 
      existing.name.toLowerCase().trim() === item.name.toLowerCase().trim()
    );
    
    if (existingIndex >= 0) {
      // Update existing item (merge amounts if different)
      const existing = currentList[existingIndex];
      currentList[existingIndex] = {
        ...existing,
        amount: combineAmounts(existing.amount, item.amount),
        priority: getHigherPriority(existing.priority, item.priority),
        essential: existing.essential || item.essential,
        isChecked: false, // Reset checked status when adding more
        addedDate: new Date().toISOString()
      };
    } else {
      // Add new item
      const newItem = {
        id: `shopping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name.trim(),
        amount: item.amount || '1 stk',
        category: item.category || 'Andre',
        categoryIcon: item.categoryIcon || '🛒',
        isChecked: false,
        priority: item.priority || 'medium',
        addedDate: new Date().toISOString(),
        source: item.source || 'manual',
        recipeId: item.recipeId,
        recipeName: item.recipeName,
        essential: item.essential || false
      };
      currentList.push(newItem);
    }
    
    await saveShoppingList(currentList);
    return currentList;
  } catch (error) {
    console.error('Error adding to shopping list:', error);
    throw error;
  }
}

/**
 * Add multiple items from a recipe to shopping list
 */
export async function addRecipeToShoppingList(recipe) {
  try {
    if (!recipe.missingIngredients || recipe.missingIngredients.length === 0) {
      throw new Error('Ingen manglende ingredienser at tilføje');
    }
    
    const currentList = await getShoppingList();
    let addedCount = 0;
    
    for (const ingredient of recipe.missingIngredients) {
      // Determine category based on ingredient name
      const category = categorizeIngredient(ingredient.name);
      
      const item = {
        name: ingredient.name,
        amount: ingredient.amount,
        category: category.name,
        categoryIcon: category.icon,
        priority: ingredient.essential ? 'high' : 'medium',
        source: 'recipe',
        recipeId: recipe.id,
        recipeName: recipe.title,
        essential: ingredient.essential || false
      };
      
      // Check if item already exists
      const existingIndex = currentList.findIndex(existing => 
        existing.name.toLowerCase().trim() === item.name.toLowerCase().trim()
      );
      
      if (existingIndex >= 0) {
        // Update existing item
        const existing = currentList[existingIndex];
        currentList[existingIndex] = {
          ...existing,
          amount: combineAmounts(existing.amount, item.amount),
          priority: getHigherPriority(existing.priority, item.priority),
          essential: existing.essential || item.essential,
          isChecked: false,
          addedDate: new Date().toISOString()
        };
      } else {
        // Add new item
        const newItem = {
          id: `shopping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...item,
          isChecked: false,
          addedDate: new Date().toISOString()
        };
        currentList.push(newItem);
        addedCount++;
      }
    }
    
    await saveShoppingList(currentList);
    return { success: true, addedCount, totalItems: currentList.length };
  } catch (error) {
    console.error('Error adding recipe to shopping list:', error);
    throw error;
  }
}

/**
 * Toggle item checked status
 */
export async function toggleShoppingItem(itemId) {
  try {
    const currentList = await getShoppingList();
    const itemIndex = currentList.findIndex(item => item.id === itemId);
    
    if (itemIndex >= 0) {
      currentList[itemIndex].isChecked = !currentList[itemIndex].isChecked;
      await saveShoppingList(currentList);
    }
    
    return currentList;
  } catch (error) {
    console.error('Error toggling shopping item:', error);
    throw error;
  }
}

/**
 * Remove item from shopping list
 */
export async function removeFromShoppingList(itemId) {
  try {
    const currentList = await getShoppingList();
    const filteredList = currentList.filter(item => item.id !== itemId);
    await saveShoppingList(filteredList);
    return filteredList;
  } catch (error) {
    console.error('Error removing from shopping list:', error);
    throw error;
  }
}

/**
 * Clear all checked items
 */
export async function clearCheckedItems() {
  try {
    const currentList = await getShoppingList();
    const filteredList = currentList.filter(item => !item.isChecked);
    await saveShoppingList(filteredList);
    return filteredList;
  } catch (error) {
    console.error('Error clearing checked items:', error);
    throw error;
  }
}

/**
 * Clear entire shopping list
 */
export async function clearShoppingList() {
  try {
    await saveShoppingList([]);
    return [];
  } catch (error) {
    console.error('Error clearing shopping list:', error);
    throw error;
  }
}

/**
 * Group shopping list items by category
 */
export function groupShoppingListByCategory(items) {
  const grouped = {};
  
  items.forEach(item => {
    const category = item.category || 'Andre';
    if (!grouped[category]) {
      grouped[category] = {
        name: category,
        icon: item.categoryIcon || '🛒',
        items: []
      };
    }
    grouped[category].items.push(item);
  });
  
  // Sort categories by priority and items within categories
  const sortedCategories = Object.values(grouped).map(category => ({
    ...category,
    items: category.items.sort((a, b) => {
      // Sort by checked status first (unchecked first)
      if (a.isChecked !== b.isChecked) {
        return a.isChecked ? 1 : -1;
      }
      // Then by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      // Finally by name
      return a.name.localeCompare(b.name);
    })
  })).sort((a, b) => {
    // Sort categories by number of unchecked items (most unchecked first)
    const aUnchecked = a.items.filter(item => !item.isChecked).length;
    const bUnchecked = b.items.filter(item => !item.isChecked).length;
    return bUnchecked - aUnchecked;
  });
  
  return sortedCategories;
}

/**
 * Get shopping statistics
 */
export function getShoppingStats(items) {
  const total = items.length;
  const checked = items.filter(item => item.isChecked).length;
  const unchecked = total - checked;
  const essential = items.filter(item => item.essential && !item.isChecked).length;
  
  return {
    total,
    checked,
    unchecked,
    essential,
    progress: total > 0 ? Math.round((checked / total) * 100) : 0
  };
}

// Helper functions

/**
 * Categorize ingredient based on name
 */
function categorizeIngredient(name) {
  const lowerName = name.toLowerCase();
  
  // Dairy products
  if (['mælk', 'fløde', 'yoghurt', 'ost', 'smør', 'kærnemælk'].some(word => lowerName.includes(word))) {
    return { name: 'Mejeriprodukter', icon: '🥛' };
  }
  
  // Meat and fish
  if (['kød', 'kylling', 'oksekød', 'svinekød', 'fisk', 'laks', 'tuna', 'hakket'].some(word => lowerName.includes(word))) {
    return { name: 'Kød & Fisk', icon: '🥩' };
  }
  
  // Vegetables
  if (['løg', 'gulerod', 'kartoffel', 'tomat', 'salat', 'peberfrugt', 'broccoli', 'spinat', 'courgette', 'aubergine', 'agurk', 'grøntsag'].some(word => lowerName.includes(word))) {
    return { name: 'Grøntsager', icon: '🥕' };
  }
  
  // Fruits
  if (['æble', 'banan', 'appelsin', 'citron', 'pære', 'jordbær', 'blåbær', 'kiwi', 'mango', 'ananas', 'frugt'].some(word => lowerName.includes(word))) {
    return { name: 'Frugt', icon: '🍎' };
  }
  
  // Bread and grains
  if (['brød', 'pasta', 'ris', 'mel', 'havregryn', 'quinoa', 'bulgur'].some(word => lowerName.includes(word))) {
    return { name: 'Brød & Korn', icon: '🍞' };
  }
  
  // Spices and condiments
  if (['salt', 'peber', 'krydderi', 'oregano', 'basilikum', 'soja', 'olie', 'eddike', 'honning', 'sukker'].some(word => lowerName.includes(word))) {
    return { name: 'Krydderier', icon: '🧂' };
  }
  
  // Eggs
  if (['æg'].some(word => lowerName.includes(word))) {
    return { name: 'Æg', icon: '🥚' };
  }
  
  // Default category
  return { name: 'Andre', icon: '🛒' };
}

/**
 * Combine amounts (simple text combination for now)
 */
function combineAmounts(amount1, amount2) {
  if (amount1 === amount2) return amount1;
  return `${amount1} + ${amount2}`;
}

/**
 * Get higher priority between two priorities
 */
function getHigherPriority(priority1, priority2) {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return priorityOrder[priority1] >= priorityOrder[priority2] ? priority1 : priority2;
}

/**
 * Export shopping list as text
 */
export function exportShoppingListAsText(items) {
  if (items.length === 0) return 'Indkøbslisten er tom';
  
  const grouped = groupShoppingListByCategory(items);
  let text = '🛒 INDKØBSLISTE\n\n';
  
  grouped.forEach(category => {
    text += `${category.icon} ${category.name.toUpperCase()}\n`;
    category.items.forEach(item => {
      const checkbox = item.isChecked ? '✅' : '☐';
      const essential = item.essential ? ' ⭐' : '';
      text += `${checkbox} ${item.name} (${item.amount})${essential}\n`;
    });
    text += '\n';
  });
  
  const stats = getShoppingStats(items);
  text += `📊 Status: ${stats.checked}/${stats.total} afkrydset (${stats.progress}%)`;
  
  return text;
}