import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types';
import { AuthHero, PrimaryButton, FormField, KeyboardAwareScreen } from '../../components';
import { resendVerificationCode, verifyEmailCode } from '../../services';
import { verifyEmailScreenStyles } from '../../styles/screens';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

const CODE_LENGTH = 8;

/**
 * Signup confirmation by 8-digit code.
 *
 * Mobile can't rely on the emailed confirmation link: its `redirect_to` points
 * at the dashboard's web origin, which a phone on another network can't open.
 * The code in the same email has no such dependency, so this screen is the
 * mobile confirmation path. On success Supabase returns a session and the auth
 * listener drops the user straight into the app.
 */
export function VerifyEmailScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { email } = route.params;

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const canSubmit = useMemo(
    () => code.trim().length === CODE_LENGTH && !submitting,
    [code, submitting],
  );

  const handleVerify = useCallback(async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await verifyEmailCode(email, code);
      // Success returns a session; the auth listener swaps in the main app.
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      Alert.alert(t('auth.alerts.verifyFailedTitle'), message);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, code, email, t]);

  const handleResend = useCallback(async () => {
    setResending(true);
    try {
      await resendVerificationCode(email);
      Alert.alert(t('auth.alerts.codeResentTitle'), t('auth.alerts.codeResentMessage', { email }));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      Alert.alert(t('auth.alerts.resendFailedTitle'), message);
    } finally {
      setResending(false);
    }
  }, [email, t]);

  return (
    <KeyboardAwareScreen contentStyle={verifyEmailScreenStyles.container}>
      <AuthHero
        icon="mark-email-read"
        title={t('auth.titles.verifyEmail')}
        subtitle={t('auth.subtitles.verifyEmail', { email })}
      />

      <FormField
        icon="pin"
        value={code}
        onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
        placeholder={t('auth.placeholders.verificationCode')}
        keyboardType="number-pad"
        editable={!submitting}
      />

      <PrimaryButton
        label={submitting ? t('auth.buttons.verifying') : t('auth.buttons.verifyEmail')}
        onPress={handleVerify}
        disabled={!canSubmit}
        icon="check"
        style={verifyEmailScreenStyles.submitButton}
      />

      <Pressable onPress={handleResend} disabled={resending}>
        <Text style={verifyEmailScreenStyles.linkText}>
          {resending ? t('auth.links.resending') : t('auth.links.resendCode')}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.popTo('Login')}>
        <Text style={verifyEmailScreenStyles.secondaryLinkText}>
          {t('common.actions.backToLogin')}
        </Text>
      </Pressable>
    </KeyboardAwareScreen>
  );
}
