// LazyIonicons - Safe wrapper for Ionicons with error handling
import React from 'react';
import { Text } from 'react-native';

// Safely import Ionicons
let IconsModule = null;

try {
  // Dynamically import Ionicons
  IconsModule = require('@expo/vector-icons').Ionicons;
  console.log('✅ Ionicons imported successfully');
} catch (error) {
  console.error('❌ Error importing Ionicons:', error);
}

// Create a fallback component in case Ionicons fails to load
const FallbackIcon = ({ name, size, color }) => {
  return (
    <Text style={{ 
      fontSize: size || 24, 
      color: color || '#000',
      width: size || 24,
      height: size || 24,
      textAlign: 'center'
    }}>
      □
    </Text>
  );
};

// Export the actual component or the fallback
export const Ionicons = (props) => {
  if (!IconsModule) {
    console.warn('⚠️ Using fallback icon because Ionicons failed to load');
    return <FallbackIcon {...props} />;
  }
  
  try {
    return <IconsModule {...props} />;
  } catch (error) {
    console.error('❌ Error rendering Ionicon:', error);
    return <FallbackIcon {...props} />;
  }
};

export default Ionicons;