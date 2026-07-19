import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types';
import { COLORS } from '../../constants';
import { hasSeenOnboarding } from '../../utils';
import { splashScreenStyles } from '../../styles/screens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    let active = true;

    // Onboarding is first-run only; returning users land straight on login.
    // The flag lookup runs alongside the splash delay so it costs no extra time.
    const timeoutId = setTimeout(async () => {
      const seen = await hasSeenOnboarding();
      if (active) navigation.replace(seen ? 'Login' : 'Onboarding');
    }, 1600);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [navigation]);

  return (
    <View style={splashScreenStyles.container}>
      <View style={splashScreenStyles.brandWrap}>
        <View style={splashScreenStyles.logoCircle}>
          <MaterialIcons name="shield" size={42} color={COLORS.white} />
        </View>
        <Text style={splashScreenStyles.brandText}>{t('common.appName')}</Text>
      </View>
      <Text style={splashScreenStyles.tagline}>{t('auth.titles.splashTagline')}</Text>
    </View>
  );
}
