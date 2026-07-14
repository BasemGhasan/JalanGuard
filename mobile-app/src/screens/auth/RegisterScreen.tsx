import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types';
import { PrimaryButton, FormField } from '../../components';
import { isValidEmail } from '../../utils';
import { registerScreenStyles } from '../../styles/screens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'> & {
  onRegister: (fullName: string, email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
};

export function RegisterScreen({ navigation, onRegister }: Props) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const buttonLabel = useMemo(
    () => (submitting ? t('auth.buttons.creating') : t('auth.buttons.createAccount')),
    [submitting, t],
  );

  const handleRegister = useCallback(async () => {
    if (fullName.trim().length < 3) {
      Alert.alert(t('auth.alerts.invalidNameTitle'), t('auth.alerts.invalidNameMessage'));
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert(t('auth.alerts.invalidEmailTitle'), t('auth.alerts.invalidEmailMessage'));
      return;
    }

    if (password.trim().length < 6) {
      Alert.alert(t('auth.alerts.invalidPasswordTitle'), t('auth.alerts.invalidPasswordMessage'));
      return;
    }

    setSubmitting(true);
    try {
      const { needsConfirmation } = await onRegister(fullName, email, password);
      if (needsConfirmation) {
        // Email confirmation required — no session yet, so guide the user back.
        Alert.alert(t('auth.alerts.checkEmailTitle'), t('auth.alerts.checkEmailMessage'));
        navigation.navigate('Login');
      }
      // Otherwise the auth listener signs the user straight into the app.
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.alerts.genericMessage');
      Alert.alert(t('auth.alerts.registerFailedTitle'), message);
    } finally {
      setSubmitting(false);
    }
  }, [email, fullName, navigation, onRegister, password, t]);

  return (
    <View style={registerScreenStyles.container}>
      <Text style={registerScreenStyles.title}>{t('auth.titles.createAccount')}</Text>
      <Text style={registerScreenStyles.subtitle}>{t('auth.subtitles.register')}</Text>

      <FormField
        icon="person-outline"
        value={fullName}
        onChangeText={setFullName}
        placeholder={t('auth.placeholders.fullName')}
        autoCapitalize="words"
      />

      <FormField
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.placeholders.email')}
        keyboardType="email-address"
        style={registerScreenStyles.inputSpacing}
      />

      <FormField
        icon="lock-outline"
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.placeholders.password')}
        secureTextEntry
        style={registerScreenStyles.inputSpacing}
      />

      <PrimaryButton label={buttonLabel} onPress={handleRegister} disabled={submitting} icon="chevron-right" />

      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={registerScreenStyles.linkText}>{t('auth.links.hasAccount')}</Text>
      </Pressable>
    </View>
  );
}
