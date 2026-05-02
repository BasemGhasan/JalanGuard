import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../types';
import { COLORS } from '../constants';
import { onboardingScreenStyles } from '../styles/screens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

type OnboardingSlide = {
  title: string;
  description: string;
  imageUri: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

export function OnboardingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);

  const slides = useMemo<OnboardingSlide[]>(
    () => [
      {
        title: t('onboarding.slides.one.title'),
        description: t('onboarding.slides.one.description'),
        imageUri: 'https://images.unsplash.com/photo-1709934730506-fba12664d4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        icon: 'camera-alt',
      },
      {
        title: t('onboarding.slides.two.title'),
        description: t('onboarding.slides.two.description'),
        imageUri: 'https://images.unsplash.com/photo-1620662892011-f5c2d523fae2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        icon: 'map',
      },
      {
        title: t('onboarding.slides.three.title'),
        description: t('onboarding.slides.three.description'),
        imageUri: 'https://images.unsplash.com/photo-1616107838939-1b29303d66c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        icon: 'thumb-up',
      },
      {
        title: t('onboarding.slides.four.title'),
        description: t('onboarding.slides.four.description'),
        imageUri: 'https://images.unsplash.com/photo-1683162113343-d65c480229ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        icon: 'emoji-events',
      },
    ],
    [t],
  );

  const activeSlide = useMemo(() => slides[stepIndex], [slides, stepIndex]);
  const isLastSlide = useMemo(() => stepIndex === slides.length - 1, [slides.length, stepIndex]);

  const handleSkip = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  const handleNext = useCallback(() => {
    setStepIndex((prev) => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const handleGetStarted = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  const handleLoginNavigate = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <View style={onboardingScreenStyles.container}>
      <View style={onboardingScreenStyles.headerRow}>
        <View />
        <Pressable onPress={handleSkip}>
          <Text style={onboardingScreenStyles.skipText}>{t('common.actions.skip')}</Text>
        </Pressable>
      </View>

      <View style={onboardingScreenStyles.contentWrap}>
        <View style={onboardingScreenStyles.iconBadge}>
          <MaterialIcons name={activeSlide.icon} size={30} color={COLORS.secondary} />
        </View>

        <Image source={{ uri: activeSlide.imageUri }} style={onboardingScreenStyles.previewImage} />

        <Text style={onboardingScreenStyles.title}>{activeSlide.title}</Text>
        <Text style={onboardingScreenStyles.subtitle}>{activeSlide.description}</Text>
      </View>

      <View style={onboardingScreenStyles.footer}>
        <View style={onboardingScreenStyles.dotsRow}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[onboardingScreenStyles.dot, index === stepIndex && onboardingScreenStyles.dotActive]}
            />
          ))}
        </View>

        {isLastSlide ? (
          <Pressable style={onboardingScreenStyles.primaryButtonFull} onPress={handleGetStarted}>
            <Text style={onboardingScreenStyles.primaryButtonText}>{t('common.actions.getStarted')}</Text>
          </Pressable>
        ) : (
          <Pressable style={onboardingScreenStyles.primaryButton} onPress={handleNext}>
            <Text style={onboardingScreenStyles.primaryButtonText}>{t('common.actions.next')}</Text>
            <MaterialIcons name="chevron-right" size={20} color={COLORS.white} />
          </Pressable>
        )}

        <Pressable onPress={handleLoginNavigate}>
          <Text style={onboardingScreenStyles.linkText}>{t('onboarding.alreadyHaveAccount')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
