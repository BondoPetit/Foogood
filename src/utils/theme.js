/**
 * Color utilities for the FooGood app
 */

/**
 * Get status color based on days left until expiry
 * @param {number} daysLeft - Number of days until expiry
 * @returns {string} Hex color code
 */
export function getStatusColor(daysLeft) {
  if (daysLeft < 0) return "#ff6b6b";     // Red for expired
  if (daysLeft <= 2) return "#ffd93d";    // Yellow for expiring soon
  return "#6bcf7f";                       // Green for fresh
}

/**
 * Color theme for the app - matching reference image
 */
export const COLORS = {
  // Primary colors
  primary: '#4a5568',         // Dark gray for buttons and accents
  secondary: '#2d3748',       // Darker gray for secondary elements
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  
  // Text colors
  textPrimary: '#2d3748',     // Dark gray text
  textSecondary: '#718096',   // Medium gray for secondary text
  textLight: '#ffffff',       // White text for colored backgrounds
  
  // Background colors - matching reference image beige/sand tones
  backgroundLight: '#F2DCB6',              // Warm beige background like reference
  backgroundCard: '#ffffff',               // White for cards
  backgroundOverlay: 'rgba(0,0,0,0.1)',   // Light overlay
  border: '#e2e8f0',                       // Light border color
  
  // Gradient colors - using warm beige tones like reference
  gradients: {
    pantry: ['#F2DCB6', '#F2DCB6'],
    expiring: ['#F2DCB6', '#F2DCB6'],
    recipes: ['#F2DCB6', '#F2DCB6'],
    scanner: ['#F2DCB6', '#F2DCB6'],
    settings: ['#F2DCB6', '#F2DCB6'],
    primary: ['#F2DCB6', '#F2DCB6']
  },
  tabBar: {
    background: '#ffffff',     // White tab bar
    active: '#4a5568',         // Dark gray for active (matching reference)
    inactive: '#a0aec0',       // Light gray for inactive
  }
};

