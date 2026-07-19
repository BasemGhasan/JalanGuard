import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types';
import { PrimaryButton, FormField, KeyboardAwareScreen } from '../../components';
import { isValidEmail } from '../../utils';
import { loginScreenStyles } from '../../styles/screens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'> & {
  onLogin: (email: string, password: string) => Promise<void>;
};

export function LoginScreen({ navigation, onLogin }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const buttonLabel = useMemo(
    () => (submitting ? t('auth.buttons.signingIn') : t('auth.buttons.login')),
    [submitting, t],
  );

  const handleLogin = useCallback(async () => {
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
      await onLogin(email, password);
      // On success the auth listener flips the navigator to the main app.
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.alerts.genericMessage');
      Alert.alert(t('auth.alerts.loginFailedTitle'), message);
    } finally {
      setSubmitting(false);
    }
  }, [email, onLogin, password, t]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  return (
    <KeyboardAwareScreen contentStyle={loginScreenStyles.container}>
      <Text style={loginScreenStyles.title}>{t('auth.titles.welcomeBack')}</Text>
      <Text style={loginScreenStyles.subtitle}>{t('auth.subtitles.login')}</Text>

      <FormField
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.placeholders.email')}
        keyboardType="email-address"
      />

      <FormField
        icon="lock-outline"
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.placeholders.password')}
        secureTextEntry
        style={loginScreenStyles.passwordWrap}
      />

      <Pressable style={loginScreenStyles.forgotWrap} onPress={handleForgotPassword}>
        <Text style={loginScreenStyles.forgotText}>{t('auth.links.forgotPassword')}</Text>
      </Pressable>

      <PrimaryButton label={buttonLabel} onPress={handleLogin} disabled={submitting} icon="chevron-right" />

      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={loginScreenStyles.linkText}>{t('auth.links.noAccount')}</Text>
      </Pressable>
    </KeyboardAwareScreen>
  );
}
