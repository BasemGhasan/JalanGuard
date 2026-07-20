import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types';
import { AuthHero, PrimaryButton, FormField, KeyboardAwareScreen } from '../../components';
import { resetPassword, setNewPassword, verifyPasswordResetCode } from '../../services';
import { resetPasswordScreenStyles } from '../../styles/screens';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

const CODE_LENGTH = 8;
const MIN_PASSWORD_LENGTH = 6;

/**
 * Password recovery by 8-digit code.
 *
 * The project's email templates emit codes rather than links, so there is no
 * URL to land on — the code and the new password are collected together and
 * committed in one submit:
 *   1. `verifyPasswordResetCode` swaps the code for a recovery session.
 *   2. `setNewPassword` commits the new password on that session.
 *
 * `useAuth` suppresses authentication between those two steps (PASSWORD_RECOVERY
 * is not "signed in"), so the app can't jump to the main tabs mid-flow.
 */
export function ResetPasswordScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { email } = route.params;

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const canSubmit = useMemo(
    () => code.length === CODE_LENGTH && password.length > 0 && !submitting,
    [code, password, submitting],
  );

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    if (password.trim().length < MIN_PASSWORD_LENGTH) {
      Alert.alert(t('auth.alerts.invalidPasswordTitle'), t('auth.alerts.invalidPasswordMessage'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('auth.alerts.passwordMismatchTitle'), t('auth.alerts.passwordMismatchMessage'));
      return;
    }

    setSubmitting(true);
    try {
      await verifyPasswordResetCode(email, code);
      await setNewPassword(password);
      // USER_UPDATED clears the recovery hold, signing the user in for real.
      Alert.alert(t('auth.alerts.passwordUpdatedTitle'), t('auth.alerts.passwordUpdatedMessage'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      Alert.alert(t('auth.alerts.resetFailedTitle'), message);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, code, confirmPassword, email, password, t]);

  const handleResend = useCallback(async () => {
    setResending(true);
    try {
      await resetPassword(email);
      Alert.alert(t('auth.alerts.codeResentTitle'), t('auth.alerts.codeResentMessage', { email }));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      Alert.alert(t('auth.alerts.resendFailedTitle'), message);
    } finally {
      setResending(false);
    }
  }, [email, t]);

  return (
    <KeyboardAwareScreen contentStyle={resetPasswordScreenStyles.container}>
      <AuthHero
        icon="lock-reset"
        title={t('auth.titles.setNewPassword')}
        subtitle={t('auth.subtitles.setNewPassword', { email })}
      />

      <FormField
        icon="pin"
        value={code}
        onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
        placeholder={t('auth.placeholders.verificationCode')}
        keyboardType="number-pad"
        editable={!submitting}
      />

      <FormField
        icon="lock-outline"
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.placeholders.newPassword')}
        secureTextEntry
        editable={!submitting}
        style={resetPasswordScreenStyles.fieldSpacing}
      />

      <FormField
        icon="password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder={t('auth.placeholders.confirmPassword')}
        secureTextEntry
        editable={!submitting}
        style={resetPasswordScreenStyles.fieldSpacing}
      />

      <PrimaryButton
        label={submitting ? t('auth.buttons.updatingPassword') : t('auth.buttons.setNewPassword')}
        onPress={handleSubmit}
        disabled={!canSubmit}
        icon="check"
        style={resetPasswordScreenStyles.submitButton}
      />

      <Pressable onPress={handleResend} disabled={resending}>
        <Text style={resetPasswordScreenStyles.linkText}>
          {resending ? t('auth.links.resending') : t('auth.links.resendCode')}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.popTo('Login')}>
        <Text style={resetPasswordScreenStyles.secondaryLinkText}>
          {t('common.actions.backToLogin')}
        </Text>
      </Pressable>
    </KeyboardAwareScreen>
  );
}
