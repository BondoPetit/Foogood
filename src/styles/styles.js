/**
 * Centralized styles for the FooGood app
 */
import { StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

export const styles = StyleSheet.create({
  // Container styles
  screenGradient: {
    flex: 1,
  },
  
  container: {
    flex: 1,
    padding: 16,
  },
  
  scrollContent: {
    paddingBottom: 20,
  },

  // Card styles
  modernCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },

  modernItemCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },

  // Text styles
  modernTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },

  modernSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
    marginTop: 8,
  },

  headerTitle: {
    color: COLORS.textLight,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },

  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textAlign: 'center',
    fontSize: 16,
  },

  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },

  itemExpiry: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },

  itemQty: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  loadingText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 10,
  },

  // Input styles
  inputContainer: {
    marginBottom: 16,
  },

  modernInput: {
    backgroundColor: '#F2DCB6',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#d4b896',
    color: COLORS.textPrimary,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Simple input for forms
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: COLORS.textPrimary,
  },

  // Button styles
  modernButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  modernButtonText: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  deleteButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  deleteButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Layout styles
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },

  statusText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '700',
  },

  // Image styles
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignSelf: 'center',
    marginVertical: 10,
  },

  // Header styles
  screenHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundOverlay,
  },

  // Camera styles
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },

  camera: {
    flex: 1,
  },

  // Empty state styles
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
    padding: 20,
  },

  emptyStateTitle: {
    color: COLORS.success,
    fontSize: 18,
    fontWeight: '700',
  },

  emptyStateText: {
    color: 'rgba(229,231,235,0.7)',
    textAlign: 'center',
    marginTop: 6,
  },

  // Tab styles
  tabBarStyle: {
    backgroundColor: COLORS.tabBar.background,
    borderTopWidth: 0,
    height: 90,
    paddingBottom: 20,
    paddingTop: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

// Legacy styles for existing components
export const inputStyle = {
  backgroundColor: "#F2DCB6",
  color: COLORS.textPrimary,
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#d4b896",
  flex: 1
};

export const itemCardStyle = {
  marginBottom: 12,
  padding: 12,
  borderRadius: 14,
  backgroundColor: "#ffffff",
  borderWidth: 1,
  borderColor: "#e5e7eb",
  shadowColor: COLORS.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
};

// Common alert/status card styles
export const warningCard = {
  backgroundColor: '#fef3cd',
  borderColor: '#f59e0b',
  borderWidth: 2,
};

export const errorCard = {
  backgroundColor: '#fef2f2',
  borderColor: '#f87171',
  borderWidth: 2,
};

export const infoCard = {
  backgroundColor: 'rgba(74, 85, 104, 0.05)',
  borderColor: 'rgba(74, 85, 104, 0.2)',
  borderWidth: 1,
};