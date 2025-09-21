/**
 * Configuration for AI services
 * Note: In production, these values should come from environment variables or secure storage
 */
import Constants from 'expo-constants';

// Debug: Log what Constants contains
console.log('Constants.expoConfig:', Constants.expoConfig);
console.log('Constants.expoConfig?.extra:', Constants.expoConfig?.extra);

export const AI_CONFIG = {
  // Azure OpenAI Configuration
  azure: {
    endpoint: Constants.expoConfig?.extra?.azureOpenAI?.endpoint || 'https://phpe2-mfslft3c-eastus2.openai.azure.com/',
    // Note: In production, consider using Expo SecureStore or backend proxy for API keys
    apiKey: Constants.expoConfig?.extra?.azureOpenAI?.apiKey || 'CtfFp3tInNebtxUPEp8vU9DQcqtbGximo1aXS101ejyvMMPpKnMsJQQJ99BIAC5RqLJXJ3w3AAABACOGl0Yp',
    deploymentName: Constants.expoConfig?.extra?.azureOpenAI?.deploymentName || 'gpt-4.1-nano',
    apiVersion: Constants.expoConfig?.extra?.azureOpenAI?.apiVersion || '2024-02-15-preview'
  },
  
  // Fallback options
  enableFallback: true,
  
  // Request settings
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  
  // Recipe generation settings
  maxRecipes: 5, // Reduced from 8 to 5 to save tokens
  defaultDifficulty: 'medium',
  
  // Token optimization settings - Always enabled for cost efficiency
  tokenSaving: {
    enabled: true, // Always use token saving mode
    maxIngredientsInPrompt: 8, // Limit ingredients to reduce prompt size
    reducedRecipeCount: 3, // Always use fewer recipes for cost efficiency
    shorterDescriptions: true, // Use shorter descriptions to save tokens
    skipNutritionInfo: false // Keep nutrition info for now
  }
};

/**
 * Validate AI configuration
 */
export function validateAIConfig() {
  const { azure } = AI_CONFIG;
  
  if (!azure.endpoint || !azure.apiKey || !azure.deploymentName) {
    console.warn('AI Configuration incomplete. Using fallback recipes.');
    return false;
  }
  
  return true;
}

/**
 * Check if AI service is enabled and properly configured
 */
export function isAIEnabled() {
  return validateAIConfig();
}