/**
 * AI Recipe Service - Generates recipe suggestions using Azure OpenAI
 */
import { AI_CONFIG, isAIEnabled } from '../config/aiConfig';

/**
 * Generate recipe suggestions based on available ingredients
 * @param {Array} ingredients - Array of ingredient objects with name, quantity, and expiry info
 * @param {Object} preferences - User preferences like difficulty, cuisine type, etc.
 * @returns {Promise<Array>} Array of recipe suggestions
 */
export async function generateRecipeSuggestions(ingredients, preferences = {}) {
  try {
    // Check if we have enough ingredients
    if (!ingredients || ingredients.length === 0) {
      throw new Error('Ingen ingredienser tilgængelige');
    }

    // Check if AI is enabled and configured
    if (!isAIEnabled()) {
      console.log('AI not configured, using fallback recipes');
      return getFallbackRecipes(ingredients);
    }

    // Debug: Log configuration
    console.log('AI Config:', {
      endpoint: AI_CONFIG.azure.endpoint,
      hasApiKey: !!AI_CONFIG.azure.apiKey,
      deploymentName: AI_CONFIG.azure.deploymentName,
      apiVersion: AI_CONFIG.azure.apiVersion
    });

    const prompt = createRecipePrompt(ingredients, preferences);
    const response = await callAzureOpenAI(prompt);
    const aiRecipes = parseRecipeResponse(response);
    
    // Match AI recipes with user ingredients
    return matchRecipesWithIngredients(aiRecipes, ingredients);
    
  } catch (error) {
    console.error('Error generating recipe suggestions:', error);
    
    // Fallback to simple recipes if AI fails
    if (AI_CONFIG.enableFallback) {
      console.log('Using fallback recipes due to AI error');
      return getFallbackRecipes(ingredients);
    }
    
    throw new Error('Kunne ikke generere opskriftsforslag. Prøv igen senere.');
  }
}

/**
 * Create a structured prompt for recipe generation
 */
function createRecipePrompt(ingredients, preferences) {
  // Apply token saving optimizations
  const tokenSaving = AI_CONFIG.tokenSaving;
  const maxIngredients = tokenSaving.enabled ? tokenSaving.maxIngredientsInPrompt : ingredients.length;
  const maxRecipes = tokenSaving.enabled ? tokenSaving.reducedRecipeCount : AI_CONFIG.maxRecipes;
  
  // Limit ingredients to reduce prompt size
  const limitedIngredients = ingredients.slice(0, maxIngredients);
  const ingredientList = limitedIngredients
    .map(ing => `${ing.name} (${ing.qty} stk, udløber om ${ing.daysLeft} dage)`)
    .join(', ');

  const difficultyText = preferences.difficulty === 'easy' ? 'nemme' : 
                        preferences.difficulty === 'medium' ? 'mellemsvære' : 
                        preferences.difficulty === 'hard' ? 'avancerede' : 'forskellige sværhedsgrader';

  // Create shorter prompt for token saving
  if (tokenSaving.enabled && tokenSaving.shorterDescriptions) {
    return `Generer UDELUKKENDE gyldig JSON array med ${maxRecipes} ${difficultyText} opskrifter baseret på: ${ingredientList}

Returner KUN JSON array uden forklarende tekst:
[
{
  "id": "recipe-1",
  "title": "Opskriftens navn",
  "difficulty": "easy",
  "time": "30 min",
  "servings": 4,
  "priority": "high", 
  "description": "Kort beskrivelse",
  "ingredientsAvailable": [{"name": "ingrediens", "amount": "2 dl", "available": true, "priority": "high"}],
  "missingIngredients": [{"name": "manglende", "amount": "1 stk", "essential": true, "alternative": "alternativ"}],
  "instructions": ["Trin 1", "Trin 2", "Trin 3"],
  "tips": "Hurtig tip"${tokenSaving.skipNutritionInfo ? '' : ',\n  "nutritionInfo": {"calories": "300 kcal", "prepTime": "10 min"}'}
}
]

Prioriter ingredienser der snart udløber. Skriv på dansk.`;
  }

  // Original detailed prompt
  return `Generer UDELUKKENDE et gyldig JSON array med ${maxRecipes} ${difficultyText} opskrifter baseret på ingredienser: ${ingredientList}

Du kan inkludere opskrifter hvor nogle ingredienser mangler - angiv disse under "missingIngredients".

VIGTIGT: Returner KUN JSON array uden forklarende tekst. Brug specifikke mængder:
- Væsker: dl, liter, ml  
- Krydderier: tsk, spsk, knivspids
- Tørre varer: gram, kg
- Frugt/grønt: stk, pakke, pose
- Kød/fisk: gram, kg, stk

JSON struktur:
[
{
  "id": "recipe-1",
  "title": "Opskriftens navn",
  "difficulty": "easy",
  "time": "30 min",
  "servings": 4,
  "priority": "high", 
  "description": "Beskrivelse af retten",
  "ingredientsAvailable": [
    {
      "name": "ingrediens navn",
      "amount": "2 dl",
      "available": true,
      "priority": "high"
    }
  ],
  "missingIngredients": [
    {
      "name": "manglende ingrediens",
      "amount": "1 stk",
      "essential": true,
      "alternative": "alternativ"
    }
  ],
  "instructions": [
    "Trin 1: Detaljeret instruktion",
    "Trin 2: Næste trin"
  ],
  "tips": "Tips til forbedring",
  "nutritionInfo": {
    "calories": "300 kcal per portion",
    "prepTime": "15 min forberedelse"
  }
}
]

Prioriter opskrifter der bruger ingredienser der snart udløber og minimerer madspild. Skriv på dansk.`;
}

/**
 * Call Azure OpenAI API
 */
async function callAzureOpenAI(prompt) {
  const { azure } = AI_CONFIG;
  const url = `${azure.endpoint}openai/deployments/${azure.deploymentName}/chat/completions?api-version=${azure.apiVersion}`;
  
  // Debug logging
  console.log('Azure OpenAI Request:', {
    url,
    endpoint: azure.endpoint,
    deploymentName: azure.deploymentName,
    apiVersion: azure.apiVersion,
    hasApiKey: !!azure.apiKey,
    apiKeyLength: azure.apiKey ? azure.apiKey.length : 0,
    apiKeyStart: azure.apiKey ? azure.apiKey.substring(0, 10) + '...' : 'none'
  });
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azure.apiKey
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Du er en hjælpsom kok-assistent der genererer kreative opskrifter baseret på tilgængelige ingredienser. Svar altid på dansk.'
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        max_tokens: AI_CONFIG.tokenSaving.enabled ? 1200 : 2000, // Reduced for token saving
        temperature: 0.7,
        top_p: 0.9
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response body:', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Log token usage
    if (data.usage) {
      console.log('🔹 Token Usage:', {
        prompt_tokens: data.usage.prompt_tokens,
        completion_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens,
        estimated_cost_usd: (data.usage.total_tokens * 0.00002).toFixed(4) // Rough estimate for GPT-4
      });
    }
    
    return data.choices[0].message.content;
    
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('AI request timed out');
    }
    console.error('Azure OpenAI Error Details:', error);
    throw error;
  }
}

/**
 * Parse the AI response and validate the JSON structure
 */
function parseRecipeResponse(response) {
  try {
    console.log('Raw AI Response:', response.substring(0, 500) + '...');
    
    // Clean the response - sometimes AI adds markdown formatting
    let cleanedResponse = response
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    // Look for JSON array in the response
    const jsonStartIndex = cleanedResponse.indexOf('[');
    const jsonEndIndex = cleanedResponse.lastIndexOf(']');
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
      cleanedResponse = cleanedResponse.substring(jsonStartIndex, jsonEndIndex + 1);
    }
    
    console.log('Cleaned Response:', cleanedResponse.substring(0, 300) + '...');

    const recipes = JSON.parse(cleanedResponse);
    console.log('Parsed recipes:', recipes);
    
    // Ensure we have an array
    const recipeArray = Array.isArray(recipes) ? recipes : [recipes];
    
    // Validate and clean the recipe data
    return recipeArray.map((recipe, index) => ({
      id: recipe.id || `ai-recipe-${Date.now()}-${index}`,
      title: recipe.title || 'Unavngiven opskrift',
      difficulty: ['easy', 'medium', 'hard'].includes(recipe.difficulty) ? recipe.difficulty : 'medium',
      time: recipe.time || '30 min',
      priority: ['high', 'medium', 'low'].includes(recipe.priority) ? recipe.priority : 'medium',
      description: recipe.description || 'Lækker hjemmelavet ret',
      // Map ingredientsAvailable to usedIngredients for compatibility
      usedIngredients: Array.isArray(recipe.ingredientsAvailable) ? 
        recipe.ingredientsAvailable.map(ing => ing.name || ing) : 
        Array.isArray(recipe.usedIngredients) ? recipe.usedIngredients : [],
      missingIngredients: Array.isArray(recipe.missingIngredients) ? recipe.missingIngredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : ['Se online opskrift for instruktioner'],
      tips: recipe.tips || '',
      source: 'AI Generated',
      matchedIngredients: [] // Will be populated when matching with actual ingredients
    }));
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('Kunne ikke forstå AI svar. Prøv igen.');
  }
}

/**
 * Fallback function that provides sample recipes when AI is not available
 */
export function getFallbackRecipes(ingredients) {
  // Ensure ingredients is an array
  const safeIngredients = Array.isArray(ingredients) ? ingredients : [];
  
  const fallbackRecipes = [
    {
      id: 'fallback-1',
      title: 'Hurtig Grøntsagsret',
      difficulty: 'easy',
      time: '20 min',
      priority: 'high',
      description: 'En nem og hurtig ret der bruger dine tilgængelige grøntsager.',
      usedIngredients: safeIngredients.slice(0, 3).map(ing => ing.name),
      missingIngredients: [],
      instructions: [
        'Vask og skær grøntsagerne i mindre stykker',
        'Varm olie op i en pande ved medium varme',
        'Tilsæt grøntsagerne og sautér i 5-7 minutter',
        'Krydre efter smag med salt og peber',
        'Server varmt'
      ],
      tips: 'Tilføj krydderier eller krydderurter for ekstra smag',
      source: 'Fallback Recipe',
      matchedIngredients: safeIngredients.slice(0, 3)
    },
    {
      id: 'fallback-2',
      title: 'Simpel Suppe',
      difficulty: 'easy',
      time: '30 min',
      priority: 'medium',
      description: 'En varmende suppe der kan bruge de fleste grøntsager.',
      usedIngredients: safeIngredients.slice(0, 4).map(ing => ing.name),
      missingIngredients: ['bouillon'],
      instructions: [
        'Skær alle grøntsager i tern',
        'Bring bouillon i kog i en gryde',
        'Tilsæt grøntsagerne og lad koge i 15-20 minutter',
        'Krydre efter smag',
        'Server med brød'
      ],
      tips: 'Blend suppen for en cremet konsistens',
      source: 'Fallback Recipe',
      matchedIngredients: safeIngredients.slice(0, 4)
    }
  ];

  return fallbackRecipes;
}

/**
 * Match AI-generated recipes with actual user ingredients
 */
export function matchRecipesWithIngredients(recipes, userIngredients) {
  return recipes.map(recipe => {
    const matchedIngredients = userIngredients.filter(userIng => 
      recipe.usedIngredients.some(recipeIng => 
        recipeIng.toLowerCase().includes(userIng.name.toLowerCase()) ||
        userIng.name.toLowerCase().includes(recipeIng.toLowerCase())
      )
    );

    return {
      ...recipe,
      matchedIngredients,
      matchScore: matchedIngredients.length / Math.max(recipe.usedIngredients.length, 1)
    };
  });
}