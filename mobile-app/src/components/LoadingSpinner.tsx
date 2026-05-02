import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { COLORS } from '../constants';
import { loadingSpinnerStyles } from '../styles/components';

type LoadingSpinnerProps = {
  fullScreen?: boolean;
  message?: string;
};

export function LoadingSpinner({ fullScreen = false, message }: LoadingSpinnerProps) {
  return (
    <View style={[loadingSpinnerStyles.container, fullScreen && loadingSpinnerStyles.fullScreen]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message ? <Text style={loadingSpinnerStyles.message}>{message}</Text> : null}
    </View>
  );
}
