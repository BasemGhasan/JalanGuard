import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../types';
import { COLORS, SPACING } from '../constants';
import { markOnboardingSeen } from '../utils';
import { onboardingScreenStyles } from '../styles/screens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

type OnboardingSlide = {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

export function OnboardingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);

  const slides = useMemo<OnboardingSlide[]>(
    () => [
      {
        title: t('onboarding.slides.one.title'),
        description: t('onboarding.slides.one.description'),
        icon: 'camera-alt',
      },
      {
        title: t('onboarding.slides.two.title'),
        description: t('onboarding.slides.two.description'),
        icon: 'map',
      },
      {
        title: t('onboarding.slides.three.title'),
        description: t('onboarding.slides.three.description'),
        icon: 'thumb-up',
      },
      {
        title: t('onboarding.slides.four.title'),
        description: t('onboarding.slides.four.description'),
        icon: 'fact-check',
      },
    ],
    [t],
  );

  const activeSlide = useMemo(() => slides[stepIndex], [slides, stepIndex]);
  const isLastSlide = useMemo(() => stepIndex === slides.length - 1, [slides.length, stepIndex]);

  // Every exit from the carousel — Skip, Get started, or the login link —
  // marks it seen, so it never reappears on a later launch.
  //
  // Onboarding is dropped from the stack on the way out, and Login is always
  // seeded as the root so that Register sits exactly one level above it. That
  // keeps the auth stack at most two deep no matter how the user got there.
  const leaveOnboarding = useCallback(
    (destination: 'Login' | 'Register') => {
      void markOnboardingSeen();
      if (destination === 'Login') {
        navigation.replace('Login');
      } else {
        navigation.reset({ index: 1, routes: [{ name: 'Login' }, { name: 'Register' }] });
      }
    },
    [navigation],
  );

  const handleSkip = useCallback(() => {
    leaveOnboarding('Register');
  }, [leaveOnboarding]);

  const handleNext = useCallback(() => {
    setStepIndex((prev) => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const handleGetStarted = useCallback(() => {
    leaveOnboarding('Register');
  }, [leaveOnboarding]);

  const handleLoginNavigate = useCallback(() => {
    leaveOnboarding('Login');
  }, [leaveOnboarding]);

  return (
    <View
      style={[
        onboardingScreenStyles.container,
        { paddingTop: insets.top + SPACING.md, paddingBottom: insets.bottom + SPACING.lg },
      ]}
    >
      {/* The only light-backgrounded screen — needs dark status-bar content. */}
      <StatusBar style="dark" backgroundColor={COLORS.background} />

      <View style={onboardingScreenStyles.headerRow}>
        <View />
        <Pressable onPress={handleSkip} hitSlop={8}>
          <Text style={onboardingScreenStyles.skipText}>{t('common.actions.skip')}</Text>
        </Pressable>
      </View>

      <View style={onboardingScreenStyles.contentWrap}>
        <View style={onboardingScreenStyles.iconBadge}>
          <MaterialIcons name={activeSlide.icon} size={56} color={COLORS.secondary} />
        </View>

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
