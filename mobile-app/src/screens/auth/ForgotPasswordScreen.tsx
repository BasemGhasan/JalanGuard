import React, { useCallback, useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types';
import { AuthHero, PrimaryButton, FormField, KeyboardAwareScreen } from '../../components';
import { isValidEmail } from '../../utils';
import { resetPassword } from '../../services';
import { forgotPasswordScreenStyles } from '../../styles/screens';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSendResetLink = useCallback(async () => {
    if (!isValidEmail(email)) {
      Alert.alert(t('auth.alerts.invalidEmailTitle'), t('auth.alerts.invalidEmailMessage'));
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email);
      Alert.alert(t('auth.alerts.resetEmailSentTitle'), t('auth.alerts.resetEmailSentMessage'));
      navigation.popTo('Login');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.alerts.genericMessage');
      Alert.alert(t('auth.alerts.resetFailedTitle'), message);
    } finally {
      setSubmitting(false);
    }
  }, [email, navigation, t]);

  return (
    <KeyboardAwareScreen contentStyle={forgotPasswordScreenStyles.container}>
      <AuthHero
        icon="lock-reset"
        title={t('auth.titles.resetPassword')}
        subtitle={t('auth.subtitles.resetPassword')}
      />

      <FormField
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.placeholders.email')}
        keyboardType="email-address"
      />

      <PrimaryButton
        label={t('common.actions.sendResetLink')}
        onPress={handleSendResetLink}
        disabled={submitting}
        icon="chevron-right"
        style={forgotPasswordScreenStyles.submitButton}
      />

      {/* popTo returns to the Login already in the stack rather than pushing a
          duplicate — see the note in RegisterScreen. */}
      <Pressable onPress={() => navigation.popTo('Login')}>
        <Text style={forgotPasswordScreenStyles.linkText}>{t('common.actions.backToLogin')}</Text>
      </Pressable>
    </KeyboardAwareScreen>
  );
}
