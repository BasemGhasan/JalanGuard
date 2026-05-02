import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types';
import { COLORS } from '../../constants';
import { splashScreenStyles } from '../../styles/screens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1600);

    return () => {
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
