import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types';
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
        {/* The real app logo, not a placeholder glyph — this screen is the
            first thing a user sees, so it should carry the actual brand mark. */}
        <Image
          source={require('../../../assets/logo.png')}
          style={splashScreenStyles.logo}
          resizeMode="contain"
        />
        <Text style={splashScreenStyles.brandText}>{t('common.appName')}</Text>
      </View>
      <Text style={splashScreenStyles.tagline}>{t('auth.titles.splashTagline')}</Text>
    </View>
  );
}
