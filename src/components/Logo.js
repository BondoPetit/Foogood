/**
 * Logo Component - FooGood mascot egg logo
 */
import React from 'react';
import { Image } from 'react-native';
import PropTypes from 'prop-types';

// Generic icon component factory
function createIconComponent(imagePath, fallbackEmoji = '📦') {
  return function IconComponent({ size = 60, style, ...props }) {
    return (
      <Image 
        source={imagePath}
        style={[{
          width: size,
          height: size,
        }, style]}
        resizeMode="contain"
        {...props}
      />
    );
  };
}

// Create all icon components
export const Logo = createIconComponent(require('../assets/logo.png'), '🥚');
export const ChefIcon = createIconComponent(require('../assets/chef.png'), '👨‍🍳');
export const ShoppingIcon = createIconComponent(require('../assets/shopping.png'), '🛒');
export const SettingsIcon = createIconComponent(require('../assets/settings.png'), '⚙️');
export const ExpireIcon = createIconComponent(require('../assets/expire.png'), '⏰');

// PropTypes for all components
const iconPropTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
};

Logo.propTypes = iconPropTypes;
ChefIcon.propTypes = iconPropTypes;
ShoppingIcon.propTypes = iconPropTypes;
SettingsIcon.propTypes = iconPropTypes;
ExpireIcon.propTypes = iconPropTypes;