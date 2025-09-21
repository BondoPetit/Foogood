/**
 * Reusable UI components for the FooGood app
 */
import React from 'react';
import { View, Text, TouchableOpacity, Pressable, Image, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../utils/theme';
import { Logo, ChefIcon, ShoppingIcon, SettingsIcon, ExpireIcon } from './Logo';

/**
 * Primary button component
 */
export function PrimaryButton({ title, onPress, style, loading = false, disabled = false, hapticFeedback = true, ...props }) {
  
  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <Pressable 
      onPress={disabled || loading ? undefined : handlePress} 
      style={({ pressed }) => [
        {
          backgroundColor: disabled || loading 
            ? '#9ca3af' 
            : pressed ? '#2d3748' : COLORS.primary,
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 12,
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
        },
        style
      ]}
      {...props}
    >
      {loading && (
        <ActivityIndicator size="small" color={COLORS.textLight} />
      )}
      <Text style={{ 
        color: COLORS.textLight, 
        fontWeight: '700',
        fontSize: 16,
        textAlign: 'center'
      }}>
        {loading ? 'Arbejder...' : title}
      </Text>
    </Pressable>
  );
}

/**
 * Ghost button component
 */
export function GhostButton({ title, onPress, style, hapticFeedback = true, ...props }) {
  
  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const isIconOnly = title.length === 1;

  return (
    <Pressable 
      onPress={handlePress} 
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? 'rgba(239, 68, 68, 0.2)' : COLORS.danger,
          paddingVertical: isIconOnly ? 8 : 12,
          paddingHorizontal: isIconOnly ? 8 : 16,
          borderRadius: 8,
          borderWidth: 0,
          minWidth: isIconOnly ? 32 : undefined,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        },
        style
      ]}
      {...props}
    >
      <Text style={{ 
        color: COLORS.textLight, 
        fontWeight: '700',
        fontSize: isIconOnly ? 16 : 14,
        textAlign: 'center'
      }}>
        {title}
      </Text>
    </Pressable>
  );
}

/**
 * Status badge component
 */
export function StatusBadge({ daysLeft, style }) {
  const getBackgroundColor = () => {
    if (daysLeft < 0) return COLORS.danger;
    if (daysLeft === 0) return COLORS.danger;
    if (daysLeft <= 2) return COLORS.warning;
    if (daysLeft <= 5) return '#f59e0b'; // Orange for soon
    return COLORS.success;
  };

  const getText = () => {
    if (daysLeft < 0) return 'Udløbet';
    if (daysLeft === 0) return 'I dag!';
    if (daysLeft === 1) return '1 dag';
    return `${daysLeft} dage`;
  };

  return (
    <View 
      style={[
        {
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 4,
          backgroundColor: getBackgroundColor(),
          minWidth: 60,
          alignItems: 'center',
        },
        style
      ]}
    >
      <Text style={{ 
        color: COLORS.textLight, 
        fontSize: 11, 
        fontWeight: '700',
        textAlign: 'center'
      }}>
        {getText()}
      </Text>
    </View>
  );
}

/**
 * Empty state component
 */
export function EmptyState({ title, subtitle, emoji = "📦" }) {
  return (
    <View style={{
      marginTop: 40,
      alignItems: 'center',
      padding: 20,
      backgroundColor: COLORS.backgroundCard,
      borderRadius: 16,
      marginHorizontal: 8,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>
        {emoji}
      </Text>
      <Text style={{ 
        color: COLORS.textPrimary, 
        fontSize: 18, 
        fontWeight: '700',
        textAlign: 'center' 
      }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ 
          color: COLORS.textSecondary, 
          textAlign: 'center', 
          marginTop: 6,
          fontSize: 14
        }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

/**
 * Screen header component
 */
export function ScreenHeader({ title, subtitle, showLogo = false, logoSize, customIcon, bannerMode = false }) {
  const bannerStyle = bannerMode ? {
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
  } : {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 12,
  };

  return (
    <View style={bannerStyle}>
      {(showLogo || customIcon) && title ? (
        // Show logo/icon next to title (matching PantryScreen layout)
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: subtitle ? 8 : 0
        }}>
          {customIcon ? customIcon : <Logo size={logoSize || 40} />}
          <Text style={{
            color: COLORS.textPrimary,
            fontSize: 28,
            fontWeight: '800',
            flex: 1,
            textAlign: 'center'
          }}>
            {title}
          </Text>
          <View style={{ width: logoSize || 40 }} />
        </View>
      ) : (
        // Show logo above title or just title
        <>
          {showLogo && (
            <Logo size={logoSize || 80} style={{ marginBottom: title ? 12 : 4, marginTop: 4 }} />
          )}
          {title && (
            <Text style={{
              color: COLORS.textPrimary,
              fontSize: 28,
              fontWeight: '800',
              textAlign: 'center'
            }}>
              {title}
            </Text>
          )}
        </>
      )}
      {subtitle && (
        <Text style={{
          color: COLORS.textSecondary,
          marginTop: 4,
          textAlign: 'center',
          fontSize: 16
        }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

/**
 * Loading state component
 */
export function LoadingState({ message = "Indlæser...", emoji = "⏳" }) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: COLORS.backgroundCard,
      borderRadius: 12,
      marginVertical: 10,
      gap: 12,
    }}>
      <ActivityIndicator size="small" color={COLORS.primary} />
      <Text style={{ fontSize: 16 }}>{emoji}</Text>
      <Text style={{ 
        color: COLORS.textPrimary, 
        fontSize: 16,
        fontWeight: '500'
      }}>
        {message}
      </Text>
    </View>
  );
}

/**
 * Tab icon component
 */
export function TabIcon({ route, focused }) {
  const iconProps = {
    size: 32,
    style: {
      opacity: focused ? 1 : 0.6,
      borderRadius: 16,
      overflow: 'hidden'
    }
  };

  switch (route.name) {
    case 'Pantry': return <Logo {...iconProps} />;
    case 'ExpiringSoon': return <ExpireIcon {...iconProps} />;
    case 'Recipes': return <ChefIcon {...iconProps} />;
    case 'ShoppingList': return <ShoppingIcon {...iconProps} />;
    case 'Settings': return <SettingsIcon {...iconProps} />;
    default: 
      return (
        <Text style={{
          fontSize: 32,
          color: focused ? '#6366f1' : '#6b7280'
        }}>
          ❓
        </Text>
      );
  }
}

  // PropTypes for type checking
  PrimaryButton.propTypes = {
    title: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    style: PropTypes.object,
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    hapticFeedback: PropTypes.bool,
  };

  GhostButton.propTypes = {
    title: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    style: PropTypes.object,
    hapticFeedback: PropTypes.bool,
  };

  StatusBadge.propTypes = {
    daysLeft: PropTypes.number.isRequired,
    style: PropTypes.object,
  };

  EmptyState.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    emoji: PropTypes.string,
  };

  LoadingState.propTypes = {
    message: PropTypes.string,
    emoji: PropTypes.string,
  };

  ScreenHeader.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    showLogo: PropTypes.bool,
    logoSize: PropTypes.number,
    customIcon: PropTypes.element,
    bannerMode: PropTypes.bool,
  };

  TabIcon.propTypes = {
    route: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
    focused: PropTypes.bool.isRequired,
  };

/**
 * Delete button component with consistent styling
 */
export function DeleteButton({ onPress, style, size = 'medium', icon = '✕', hapticFeedback = true }) {
  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const sizes = {
    small: { padding: 4, minWidth: 20, fontSize: 12 },
    medium: { padding: 6, minWidth: 28, fontSize: 14 },
    large: { padding: 8, minWidth: 32, fontSize: 16 }
  };

  const sizeStyle = sizes[size] || sizes.medium;

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        {
          backgroundColor: COLORS.danger,
          borderRadius: 6,
          paddingVertical: sizeStyle.padding,
          paddingHorizontal: sizeStyle.padding,
          minWidth: sizeStyle.minWidth,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        },
        style
      ]}
    >
      <Text style={{ 
        color: COLORS.textLight, 
        fontSize: sizeStyle.fontSize,
        fontWeight: '700',
        textAlign: 'center'
      }}>
        {icon}
      </Text>
    </TouchableOpacity>
  );
}

// PropTypes
DeleteButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  style: PropTypes.object,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  icon: PropTypes.string,
  hapticFeedback: PropTypes.bool,
};