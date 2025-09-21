/**
 * Recipes Screen - Recipe suggestions based on available items
 */
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { useAppContext } from '../context/AppContext';
import { daysUntilExpiry } from '../utils/dateUtils';
import { COLORS } from '../utils/theme';
import { styles } from '../styles/styles';
import { ScreenHeader, StatusBadge, EmptyState, PrimaryButton, GhostButton } from '../components/UI';
import { ChefIcon } from '../components/Logo';
import { generateRecipeSuggestions } from '../services/aiRecipeService';
import { addRecipeToShoppingList } from '../services/shoppingListService';

export function RecipesScreen() {
  const { items, categories } = useAppContext();
  const navigation = useNavigation();
  const [selectedDifficulty, setSelectedDifficulty] = useState('all'); // 'easy', 'medium', 'hard', 'all'
  const [aiRecipes, setAiRecipes] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [recipeError, setRecipeError] = useState(null);

  // Get prioritized ingredients based on expiry dates
  const prioritizedIngredients = useMemo(() => {
    return items
      .filter(item => item.qty > 0) // Only items we have
      .map(item => ({
        ...item,
        daysLeft: daysUntilExpiry(item.expiryDate),
        category: categories.find(c => c.id === item.categoryId)
      }))
      .sort((a, b) => {
        // Prioritize by expiry date (items expiring soon first)
        if (a.daysLeft !== b.daysLeft) {
          return a.daysLeft - b.daysLeft;
        }
        // Then by quantity (more items first)
        return b.qty - a.qty;
      });
  }, [items, categories]);

  // Load AI recipe suggestions when ingredients change
  useEffect(() => {
    if (prioritizedIngredients.length > 0) {
      loadAIRecipes();
    } else {
      setAiRecipes([]);
      setRecipeError(null);
    }
  }, [prioritizedIngredients, selectedDifficulty]);

  const loadAIRecipes = async () => {
    if (prioritizedIngredients.length === 0) return;
    
    setIsLoadingRecipes(true);
    setRecipeError(null);
    
    try {
      // Import AI config to apply token saving settings
      const { AI_CONFIG } = await import('../config/aiConfig');
      
      // Always use token saving mode
      const originalTokenSaving = AI_CONFIG.tokenSaving.enabled;
      AI_CONFIG.tokenSaving.enabled = true;
      
      const preferences = {
        difficulty: selectedDifficulty === 'all' ? undefined : selectedDifficulty,
        maxRecipes: 3 // Always use fewer recipes for token saving
      };
      
      const recipes = await generateRecipeSuggestions(prioritizedIngredients, preferences);
      setAiRecipes(recipes);
      
      // Restore original setting
      AI_CONFIG.tokenSaving.enabled = originalTokenSaving;
      
    } catch (error) {
      console.error('Error loading AI recipes:', error);
      setRecipeError(error.message);
      // Keep existing recipes if we have them
    } finally {
      setIsLoadingRecipes(false);
    }
  };


  const generateShoppingList = async (recipe) => {
    if (!recipe.missingIngredients || recipe.missingIngredients.length === 0) {
      Alert.alert('Ingen manglende ingredienser', 'Alle ingredienser er tilgængelige!');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Add recipe ingredients to shopping list
      const result = await addRecipeToShoppingList(recipe);
      
      Alert.alert(
        '🛒 Tilføjet til indkøbsliste!',
        `${result.addedCount} nye varer tilføjet fra "${recipe.title}"\n\nTotal: ${result.totalItems} varer på listen`,
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Se indkøbsliste', 
            onPress: () => {
              // Navigate to shopping list screen
              navigation.navigate('ShoppingList');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      Alert.alert('Fejl', error.message || 'Kunne ikke tilføje til indkøbsliste');
    }
  };

  // Use AI recipes if available, otherwise fall back to mock recipes
  const recipesSuggestions = useMemo(() => {
    if (prioritizedIngredients.length === 0) return [];
    
    // If we have AI recipes, use them
    if (aiRecipes.length > 0) {
      return aiRecipes;
    }
    
    // Otherwise, fall back to the original mock recipes logic
    if (prioritizedIngredients.length === 0) return [];

    const recipes = [
      {
        id: 1,
        title: 'Hurtig Pasta med Grøntsager',
        difficulty: 'easy',
        time: '15 min',
        priority: 'high',
        description: 'En nem og hurtig pasta ret perfekt til at bruge grøntsager der snart udløber.',
        ingredients: ['pasta', 'grøntsager', 'olie', 'salt'],
        matchedIngredients: [],
        searchQuery: 'hurtig pasta grøntsager opskrift'
      },
      {
        id: 2,
        title: 'Grøntsags Wok',
        difficulty: 'easy',
        time: '20 min',
        priority: 'high',
        description: 'Wok med blandede grøntsager - perfekt til at redde grøntsager der snart udløber.',
        ingredients: ['grøntsager', 'olie', 'soja sauce', 'ingefær'],
        matchedIngredients: [],
        searchQuery: 'grøntsags wok opskrift'
      },
      {
        id: 3,
        title: 'Smoothie med Frugt',
        difficulty: 'easy',
        time: '5 min',
        priority: 'medium',
        description: 'Lækker smoothie til at bruge frugt der snart bliver for modent.',
        ingredients: ['frugt', 'yoghurt', 'mælk', 'honning'],
        matchedIngredients: [],
        searchQuery: 'frugt smoothie opskrift'
      },
      {
        id: 4,
        title: 'Brød med Påskag',
        difficulty: 'easy',
        time: '10 min',
        priority: 'medium',
        description: 'Klassiske påskagsmadder til morgenmad eller lunch.',
        ingredients: ['brød', 'påskag', 'smør', 'salt'],
        matchedIngredients: [],
        searchQuery: 'brød påskag opskrift'
      },
      {
        id: 5,
        title: 'Omelet med Rester',
        difficulty: 'medium',
        time: '10 min',
        priority: 'high',
        description: 'Perfekt måde at bruge æg og forskellige rester på.',
        ingredients: ['æg', 'mælk', 'grøntsager', 'ost'],
        matchedIngredients: [],
        searchQuery: 'omelet rester opskrift'
      },
      {
        id: 6,
        title: 'Grøntsagssuppe',
        difficulty: 'medium',
        time: '30 min',
        priority: 'high',
        description: 'Varmende suppe der kan bruge mange forskellige grøntsager og rester.',
        ingredients: ['grøntsager', 'bouillon', 'løg', 'krydderier'],
        matchedIngredients: [],
        searchQuery: 'grøntsagssuppe rester opskrift'
      },
      {
        id: 7,
        title: 'Bananbrød',
        difficulty: 'medium',
        time: '60 min',
        priority: 'medium',
        description: 'Perfekt til overmodne bananer. Lækker kage til kaffen.',
        ingredients: ['banan', 'mel', 'sukker', 'æg', 'smør'],
        matchedIngredients: [],
        searchQuery: 'bananbrød opmodne bananer opskrift'
      },
      {
        id: 8,
        title: 'Stegt Ris med Rester',
        difficulty: 'easy',
        time: '15 min',
        priority: 'high',
        description: 'Klassisk måde at bruge ris og grøntsager på.',
        ingredients: ['ris', 'grøntsager', 'æg', 'soja sauce'],
        matchedIngredients: [],
        searchQuery: 'stegt ris rester opskrift'
      },
      {
        id: 9,
        title: 'Gratin med Kartofler',
        difficulty: 'medium',
        time: '45 min',
        priority: 'medium',
        description: 'Cremet kartoffelgratin perfekt som tilbehør.',
        ingredients: ['kartoffel', 'fløde', 'ost', 'smør'],
        matchedIngredients: [],
        searchQuery: 'kartoffel gratin opskrift'
      },
      {
        id: 10,
        title: 'Pandekager',
        difficulty: 'easy',
        time: '20 min',
        priority: 'medium',
        description: 'Klassiske pandekager til mælk der snart udløber.',
        ingredients: ['mel', 'mælk', 'æg', 'sukker'],
        matchedIngredients: [],
        searchQuery: 'pandekager grundopskrift'
      }
    ];

    // Match recipes with available ingredients
    return recipes.map(recipe => {
      const matched = [];
      const ingredientNames = prioritizedIngredients.map(i => i.name.toLowerCase());
      
      recipe.ingredients.forEach(ingredient => {
        const found = prioritizedIngredients.find(item => {
          const itemName = item.name.toLowerCase();
          const ingredientLower = ingredient.toLowerCase();
          
          return (
            itemName.includes(ingredientLower) ||
            ingredientLower.includes(itemName) ||
            (ingredient === 'grøntsager' && ['gulerod', 'løg', 'kartoffel', 'tomat', 'salat', 'peberfrugt', 'broccoli', 'spinat', 'courgette', 'aubergine'].some(veg => 
              itemName.includes(veg)
            )) ||
            (ingredient === 'frugt' && ['æble', 'banan', 'appelsin', 'citron', 'pære', 'jordbær', 'blåbær', 'kiwi', 'mango', 'ananas'].some(fruit => 
              itemName.includes(fruit)
            )) ||
            (ingredient === 'mælk' && ['mælk', 'yoghurt', 'fløde', 'kærnemælk', 'skummetmælk'].some(dairy => 
              itemName.includes(dairy)
            )) ||
            (ingredient === 'ost' && itemName.includes('ost')) ||
            (ingredient === 'æg' && itemName.includes('æg')) ||
            (ingredient === 'brød' && ['brød', 'toast', 'bagel', 'bolle'].some(bread => 
              itemName.includes(bread)
            )) ||
            (ingredient === 'pasta' && ['pasta', 'spaghetti', 'makaroni', 'penne', 'fusilli'].some(pasta => 
              itemName.includes(pasta)
            )) ||
            (ingredient === 'ris' && itemName.includes('ris')) ||
            (ingredient === 'mel' && ['mel', 'hvedemel', 'rugmel'].some(flour => 
              itemName.includes(flour)
            )) ||
            (ingredient === 'kartoffel' && ['kartoffel', 'kartofler'].some(potato => 
              itemName.includes(potato)
            )) ||
            (ingredient === 'løg' && ['løg', 'rødløg', 'hvidløg'].some(onion => 
              itemName.includes(onion)
            )) ||
            (ingredient === 'tomat' && ['tomat', 'tomater', 'cherrytomater'].some(tomato => 
              itemName.includes(tomato)
            ))
          );
        });
        
        if (found) {
          matched.push(found);
        }
      });

      // Calculate priority score based on matched ingredients and their expiry
      let priorityScore = matched.length;
      matched.forEach(item => {
        if (item.daysLeft <= 2) priorityScore += 3; // High priority for expiring soon
        else if (item.daysLeft <= 5) priorityScore += 2; // Medium priority
        else priorityScore += 1; // Low priority
      });

      return {
        ...recipe,
        matchedIngredients: matched,
        matchScore: matched.length,
        priorityScore,
        canMake: matched.length >= Math.ceil(recipe.ingredients.length * 0.5) // Can make if we have 50%+ ingredients
      };
    })
    .filter(recipe => recipe.matchScore > 0) // Only show recipes we have some ingredients for
    .sort((a, b) => {
      // Sort by priority score (higher first), then by match score
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return b.matchScore - a.matchScore;
    });
  }, [prioritizedIngredients, aiRecipes]);

  const filteredRecipes = useMemo(() => {
    if (selectedDifficulty === 'all') return recipesSuggestions;
    return recipesSuggestions.filter(recipe => recipe.difficulty === selectedDifficulty);
  }, [recipesSuggestions, selectedDifficulty]);

  const handleRecipeSearch = async (recipe) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // If it's an AI-generated recipe with instructions, show them directly
    if (recipe.source === 'AI Generated' && recipe.instructions && recipe.instructions.length > 0) {
      const instructionsText = recipe.instructions.map((step, index) => `${index + 1}. ${step}`).join('\n\n');
      const fullText = `${recipe.description}\n\n--- FREMGANGSMÅDE ---\n\n${instructionsText}${recipe.tips ? `\n\n--- TIPS ---\n${recipe.tips}` : ''}`;
      
      Alert.alert(
        recipe.title,
        fullText,
        [
          { text: 'Luk', style: 'cancel' },
          {
            text: 'Søg online også',
            onPress: () => searchRecipeOnline(recipe)
          }
        ],
        { cancelable: true }
      );
      return;
    }
    
    // For other recipes, search online
    searchRecipeOnline(recipe);
  };

  const searchRecipeOnline = (recipe) => {
    const searchQuery = recipe.searchQuery || recipe.title + ' opskrift';
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    const madkasseUrl = `https://madkasse.dk/opskrifter?s=${encodeURIComponent(recipe.title)}`;
    const arlaUrl = `https://www.arla.dk/opskrifter/?search=${encodeURIComponent(recipe.title)}`;
    
    Alert.alert(
      'Søg efter opskrift',
      `Hvor vil du søge efter "${recipe.title}"?`,
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Google',
          onPress: () => Linking.openURL(googleSearchUrl),
        },
        {
          text: 'Madkasse.dk',
          onPress: () => Linking.openURL(madkasseUrl),
        },
        {
          text: 'Arla.dk',
          onPress: () => Linking.openURL(arlaUrl),
        },
      ]
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return COLORS.success;
      case 'medium': return '#f59e0b';
      case 'hard': return COLORS.danger;
      default: return COLORS.textSecondary;
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Let';
      case 'medium': return 'Medium';
      case 'hard': return 'Svær';
      default: return 'Ukendt';
    }
  };

  const getPriorityIcon = (priorityScore) => {
    if (priorityScore >= 6) return '🔥'; // High priority
    if (priorityScore >= 4) return '⭐'; // Medium priority
    return '💡'; // Low priority
  };

  return (
    <LinearGradient colors={COLORS.gradients.recipes} style={styles.screenGradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        
        <ScreenHeader 
          title="Opskrifter" 
          subtitle={`${filteredRecipes.length} forslag baseret på dine varer`}
          customIcon={<ChefIcon size={60} />}
          bannerMode={true}
        />

        <ScrollView style={styles.container}>
          {/* Difficulty filter */}
          <View style={[styles.modernCard, { marginBottom: 20 }]}>
            <Text style={[styles.modernTitle, { fontSize: 16, marginBottom: 12 }]}>
              Sværhedsgrad:
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { key: 'all', label: 'Alle', icon: '🍽️' },
                { key: 'easy', label: 'Let', icon: '😊' },
                { key: 'medium', label: 'Medium', icon: '🤔' },
                { key: 'hard', label: 'Svær', icon: '😅' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => setSelectedDifficulty(option.key)}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: selectedDifficulty === option.key ? COLORS.primary : '#f3f4f6',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 16, marginBottom: 4 }}>{option.icon}</Text>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: selectedDifficulty === option.key ? 'white' : COLORS.textPrimary
                  }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* AI Recipe Controls */}
          {prioritizedIngredients.length > 0 && (
            <View style={[styles.modernCard, { marginBottom: 20, paddingVertical: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View>
                    <Text style={[styles.modernTitle, { fontSize: 14, marginBottom: 2 }]}>
                      AI Opskrifter
                    </Text>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                      {aiRecipes.length > 0 ? `${aiRecipes.length} AI-genererede forslag` : 'Bruger fallback opskrifter'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={loadAIRecipes}
                  disabled={isLoadingRecipes}
                  style={{
                    backgroundColor: isLoadingRecipes ? COLORS.border : COLORS.primary,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    opacity: isLoadingRecipes ? 0.6 : 1
                  }}
                >
                  <Text style={{ 
                    color: 'white', 
                    fontWeight: '600',
                    fontSize: 13
                  }}>
                    {isLoadingRecipes ? 'Indlæser...' : 'Generer nye'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Recipes list */}
          {isLoadingRecipes ? (
            <View style={[styles.modernCard, { alignItems: 'center', paddingVertical: 40 }]}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ color: COLORS.textSecondary, marginTop: 12, fontSize: 16 }}>
                Genererer opskriftsforslag med AI...
              </Text>
              <Text style={{ color: COLORS.textSecondary, marginTop: 4, fontSize: 14 }}>
                Dette kan tage et øjeblik
              </Text>
            </View>
          ) : recipeError ? (
            <View style={[styles.modernCard, styles.errorCard, {
              alignItems: 'center',
              paddingVertical: 24
            }]}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>⚠️</Text>
              <Text style={[styles.modernTitle, { fontSize: 16, marginBottom: 8, color: '#dc2626' }]}>
                Kunne ikke generere AI opskrifter
              </Text>
              <Text style={{ color: '#dc2626', fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
                {recipeError}
              </Text>
              <TouchableOpacity
                onPress={loadAIRecipes}
                style={{
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8
                }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  Prøv igen
                </Text>
              </TouchableOpacity>
              {aiRecipes.length === 0 && (
                <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 12, textAlign: 'center' }}>
                  Bruger fallback opskrifter i stedet
                </Text>
              )}
            </View>
          ) : filteredRecipes.length === 0 ? (
            <EmptyState 
              title={prioritizedIngredients.length === 0 ? "Ingen varer" : "Ingen opskrifter"}
              subtitle={prioritizedIngredients.length === 0 
                ? "Tilføj varer til dit pantry for at få opskriftsforslag" 
                : "Prøv at ændre sværhedsgrad eller tilføj flere varer"}
              emoji="🍽️"
            />
          ) : (
            <>
              {/* Priority ingredients info */}
              {prioritizedIngredients.filter(item => item.daysLeft <= 3).length > 0 && (
                <View style={[styles.modernCard, styles.warningCard, { marginBottom: 20 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 20, marginRight: 8 }}>⚡</Text>
                    <Text style={[styles.modernTitle, { fontSize: 16, marginBottom: 0, color: '#92400e' }]}>
                      Prioriterede ingredienser
                    </Text>
                  </View>
                  <Text style={{ color: '#92400e', fontSize: 14, marginBottom: 12 }}>
                    Brug disse snart:
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {prioritizedIngredients
                      .filter(item => item.daysLeft <= 3)
                      .slice(0, 6)
                      .map((item) => (
                        <View key={`priority-${item.id}`} style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          padding: 6,
                          borderRadius: 8
                        }}>
                          <Text style={{ fontSize: 16, marginRight: 6 }}>{item.category?.icon}</Text>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#92400e' }}>
                            {item.name}
                          </Text>
                          <StatusBadge daysLeft={item.daysLeft} style={{ marginLeft: 4, transform: [{ scale: 0.8 }] }} />
                        </View>
                      ))}
                  </View>
                </View>
              )}

              {/* Recipe cards */}
              {filteredRecipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={[styles.modernItemCard, {
                    backgroundColor: COLORS.backgroundCard,
                    borderLeftWidth: 4,
                    borderLeftColor: recipe.canMake ? COLORS.success : COLORS.warning,
                    marginBottom: 16
                  }]}
                  onPress={() => handleRecipeSearch(recipe)}
                >
                  <View style={styles.itemHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={{
                        backgroundColor: 'rgba(74, 85, 104, 0.1)',
                        padding: 12,
                        borderRadius: 12,
                        marginRight: 12
                      }}>
                        <Text style={{ fontSize: 24 }}>{getPriorityIcon(recipe.priorityScore)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemName, { fontSize: 16 }]}>{recipe.title}</Text>
                        <Text style={[styles.itemExpiry, { fontSize: 13, marginBottom: 4 }]}>
                          {recipe.description}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                          <View style={{
                            backgroundColor: getDifficultyColor(recipe.difficulty) + '20',
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 6
                          }}>
                            <Text style={{ 
                              fontSize: 11, 
                              fontWeight: '600',
                              color: getDifficultyColor(recipe.difficulty)
                            }}>
                              {getDifficultyText(recipe.difficulty)}
                            </Text>
                          </View>
                          {recipe.time && (
                            <View style={{
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 6
                            }}>
                              <Text style={{ fontSize: 11, fontWeight: '600', color: '#6366f1' }}>
                                ⏱️ {recipe.time}
                              </Text>
                            </View>
                          )}
                          {recipe.servings && (
                            <View style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 6
                            }}>
                              <Text style={{ fontSize: 11, fontWeight: '600', color: '#10b981' }}>
                                👥 {recipe.servings} port.
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Available Ingredients */}
                        {recipe.ingredientsAvailable && recipe.ingredientsAvailable.length > 0 && (
                          <View style={{ marginBottom: 8 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 }}>
                              Du har ({recipe.ingredientsAvailable.length}):
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                              {recipe.ingredientsAvailable.slice(0, 6).map((ingredient, index) => (
                                <View key={`available-${index}`} style={{
                                  backgroundColor: ingredient.priority === 'high' ? '#fef3cd' : 'rgba(16, 185, 129, 0.1)',
                                  paddingHorizontal: 6,
                                  paddingVertical: 3,
                                  borderRadius: 4,
                                  borderWidth: ingredient.priority === 'high' ? 1 : 0,
                                  borderColor: ingredient.priority === 'high' ? '#f59e0b' : 'transparent'
                                }}>
                                  <Text style={{ 
                                    fontSize: 10, 
                                    fontWeight: '500',
                                    color: ingredient.priority === 'high' ? '#92400e' : '#10b981'
                                  }}>
                                    {ingredient.name} ({ingredient.amount})
                                    {ingredient.priority === 'high' && ' ⚡'}
                                  </Text>
                                </View>
                              ))}
                              {recipe.ingredientsAvailable.length > 6 && (
                                <Text style={{ fontSize: 10, color: COLORS.textSecondary, alignSelf: 'center' }}>
                                  +{recipe.ingredientsAvailable.length - 6} mere
                                </Text>
                              )}
                            </View>
                          </View>
                        )}

                        {/* Missing Ingredients */}
                        {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                          <View style={{ marginBottom: 8 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 }}>
                              Mangler ({recipe.missingIngredients.length}):
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                              {recipe.missingIngredients.slice(0, 4).map((ingredient, index) => (
                                <View key={`missing-${index}`} style={{
                                  backgroundColor: ingredient.essential ? 'rgba(239, 68, 68, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                                  paddingHorizontal: 6,
                                  paddingVertical: 3,
                                  borderRadius: 4,
                                  borderWidth: ingredient.essential ? 1 : 0,
                                  borderColor: ingredient.essential ? '#ef4444' : 'transparent'
                                }}>
                                  <Text style={{ 
                                    fontSize: 10, 
                                    fontWeight: '500',
                                    color: ingredient.essential ? '#dc2626' : '#6b7280'
                                  }}>
                                    {ingredient.name} ({ingredient.amount})
                                    {ingredient.essential && ' ❗'}
                                  </Text>
                                </View>
                              ))}
                              {recipe.missingIngredients.length > 4 && (
                                <Text style={{ fontSize: 10, color: COLORS.textSecondary, alignSelf: 'center' }}>
                                  +{recipe.missingIngredients.length - 4} mere
                                </Text>
                              )}
                            </View>
                            
                            {/* Shopping List Button */}
                            <TouchableOpacity
                              style={{
                                backgroundColor: COLORS.primary,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 6,
                                alignSelf: 'flex-start',
                                marginTop: 6
                              }}
                              onPress={() => generateShoppingList(recipe)}
                            >
                              <Text style={{ fontSize: 10, color: 'white', fontWeight: '600' }}>
                                🛒 Tilføj til indkøbsliste
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {/* Nutrition Info */}
                        {recipe.nutritionInfo && (
                          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                            {recipe.nutritionInfo.calories && (
                              <Text style={{ fontSize: 10, color: COLORS.textSecondary }}>
                                🔥 {recipe.nutritionInfo.calories}
                              </Text>
                            )}
                            {recipe.nutritionInfo.prepTime && (
                              <Text style={{ fontSize: 10, color: COLORS.textSecondary }}>
                                🕐 {recipe.nutritionInfo.prepTime}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>→</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}