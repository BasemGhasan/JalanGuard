/**
 * JalanGuard Mobile App
 * Road Defect Reporting System
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { LoadingSpinner } from './src/components';
import { useAuth } from './src/hooks';
import { COLORS } from './src/constants/theme';
import './src/i18n';

export default function App() {
  const { isAuthenticated, checkAuthStatus, loadingState } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await checkAuthStatus();
      setIsInitializing(false);
    };
    initialize();
  }, [checkAuthStatus]);

  if (isInitializing) {
    return (
      <SafeAreaProvider>
        <LoadingSpinner fullScreen message="Loading..." />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor={COLORS.background} />
        <RootNavigator isAuthenticated={isAuthenticated} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
