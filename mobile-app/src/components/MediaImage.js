import React from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Missing media is a neutral placeholder, never a photo of another property.
export default function MediaImage({ source, style, ...props }) {
  if (source && (typeof source === 'number' || source.uri)) {
    return <Image source={source} style={style} {...props} />;
  }
  return (
    <View style={[{ backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }, style]}>
      <Ionicons name="image-outline" size={24} color="#94A3B8" />
    </View>
  );
}
