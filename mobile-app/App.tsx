/**
 * JalanGuard Mobile App
 * Road Defect Reporting System
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { RootNavigator } from './src/navigation';
import { LoadingSpinner } from './src/components';
import { useAuth } from './src/hooks';
import { COLORS } from './src/constants/theme';
import './src/i18n';
import { loadSavedLanguage } from './src/i18n/language';

export default function App() {
  const { t } = useTranslation();
  const { isAuthenticated, user, checkAuthStatus, login, register, logout } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      // Apply the saved language before the first render so the UI never
      // flashes English on a device set to Malay.
      await Promise.all([loadSavedLanguage(), checkAuthStatus()]);
      setIsInitializing(false);
    };
    initialize();
  }, [checkAuthStatus]);


  if (isInitializing) {
    return (
      <SafeAreaProvider>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={COLORS.primary} />
        <RootNavigator
          isAuthenticated={isAuthenticated}
          user={user}
          onLogin={login}
          onRegister={register}
          onLogout={logout}
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
