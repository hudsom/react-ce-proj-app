'use client';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SafeAreaView = React.forwardRef<View, any>(({ style, ...props }, ref) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      ref={ref}
      style={[
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style,
      ]}
      {...props}
    />
  );
});
