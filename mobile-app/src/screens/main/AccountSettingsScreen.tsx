import React, { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader, FormField, PrimaryButton, KeyboardAwareScreen } from '../../components';
import {
  changePassword,
  requestEmailChange,
  updateDisplayName,
  verifyEmailChange,
} from '../../services';
import { isValidEmail } from '../../utils';
import type { UserProfile } from '../../types';
import { accountSettingsScreenStyles as s } from '../../styles/screens';

type AccountSettingsScreenProps = {
  user: UserProfile | null;
  onBack: () => void;
};

const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 3;
/** Matches the token length Supabase emits via `{{ .Token }}`. */
const CODE_LENGTH = 8;

/**
 * Settings → Account: the single place a JalanGuard profile can be edited.
 *
 * The web dashboard is read-only for profile data by design — one editing
 * surface means one set of validation rules and no chance of the two UIs
 * disagreeing about what a valid name or address is.
 *
 * Email changes are two-step: request a code, then confirm it. The address
 * only moves once the code from the NEW mailbox is accepted, so a typo can't
 * lock anyone out of their account.
 */
export function AccountSettingsScreen({ user, onBack }: AccountSettingsScreenProps) {
  const { t } = useTranslation();

  const [fullName, setFullName] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  /** Non-null once a code has been sent — holds the address awaiting confirmation. */
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveName = useCallback(async () => {
    if (!user) return;
    if (fullName.trim().length < MIN_NAME_LENGTH) {
      Alert.alert(t('auth.alerts.invalidNameTitle'), t('auth.alerts.invalidNameMessage'));
      return;
    }

    setSavingName(true);
    try {
      await updateDisplayName(user.id, fullName);
      Alert.alert(t('account.savedTitle'), t('account.nameSavedMessage'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      Alert.alert(t('account.saveFailedTitle'), message);
    } finally {
      setSavingName(false);
    }
  }, [fullName, t, user]);

  const handleRequestEmailChange = useCallback(async () => {
    const target = newEmail.trim();
    if (!isValidEmail(target)) {
      Alert.alert(t('auth.alerts.invalidEmailTitle'), t('auth.alerts.invalidEmailMessage'));
      return;
    }
    if (target.toLowerCase() === (user?.email ?? '').toLowerCase()) {
      Alert.alert(t('account.sameEmailTitle'), t('account.sameEmailMessage'));
      return;
    }

    setSavingEmail(true);
    try {
      await requestEmailChange(target);
      setPendingEmail(target);
      setEmailCode('');
      Alert.alert(t('account.emailCodeSentTitle'), t('account.emailCodeSentMessage', { email: target }));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      Alert.alert(t('account.saveFailedTitle'), message);
    } finally {
      setSavingEmail(false);
    }
  }, [newEmail, t, user?.email]);

  const handleConfirmEmailChange = useCallback(async () => {
    if (!pendingEmail) return;
    if (emailCode.length !== CODE_LENGTH) {
      Alert.alert(t('auth.alerts.verifyFailedTitle'), t('account.codeLengthMessage', { count: CODE_LENGTH }));
      return;
    }

    setSavingEmail(true);
    try {
      await verifyEmailChange(pendingEmail, emailCode);
      setPendingEmail(null);
      setNewEmail('');
      setEmailCode('');
      // The auth listener picks up the new address and refreshes `user`.
      Alert.alert(t('account.savedTitle'), t('account.emailSavedMessage'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      Alert.alert(t('account.saveFailedTitle'), message);
    } finally {
      setSavingEmail(false);
    }
  }, [emailCode, pendingEmail, t]);

  const handleCancelEmailChange = useCallback(() => {
    setPendingEmail(null);
    setEmailCode('');
  }, []);

  const handleChangePassword = useCallback(async () => {
    if (!user?.email) return;
    if (!currentPassword) {
      Alert.alert(t('account.passwordRequiredTitle'), t('account.currentPasswordRequired'));
      return;
    }
    if (newPassword.trim().length < MIN_PASSWORD_LENGTH) {
      Alert.alert(t('auth.alerts.invalidPasswordTitle'), t('auth.alerts.invalidPasswordMessage'));
      return;
    }
    if (newPassword === currentPassword) {
      Alert.alert(t('account.samePasswordTitle'), t('account.samePasswordMessage'));
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(user.email, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert(t('account.savedTitle'), t('account.passwordSavedMessage'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      Alert.alert(t('account.saveFailedTitle'), message);
    } finally {
      setSavingPassword(false);
    }
  }, [currentPassword, newPassword, t, user]);

  return (
    <View style={s.screen}>
      <AppHeader title={t('account.title')} onBack={onBack} />

      {/* AppHeader already consumed the top inset. */}
      <KeyboardAwareScreen contentStyle={s.container} applyTopInset={false}>
        {/* ── Display name ────────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>{t('account.profileSection')}</Text>

        <FormField
          icon="person-outline"
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('auth.placeholders.fullName')}
          autoCapitalize="words"
          editable={!savingName}
        />

        <PrimaryButton
          label={savingName ? t('account.saving') : t('account.saveName')}
          onPress={handleSaveName}
          disabled={savingName}
          icon="check"
          style={s.submitButton}
        />

        {/* ── Email ───────────────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>{t('account.emailSection')}</Text>
        <Text style={s.hintText}>{t('account.currentEmail', { email: user?.email ?? '—' })}</Text>

        {pendingEmail === null ? (
          <>
            <FormField
              icon="mail-outline"
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder={t('account.newEmailPlaceholder')}
              keyboardType="email-address"
              editable={!savingEmail}
              style={s.fieldSpacing}
            />

            <PrimaryButton
              label={savingEmail ? t('account.saving') : t('account.sendEmailCode')}
              onPress={handleRequestEmailChange}
              disabled={savingEmail}
              icon="send"
              style={s.submitButton}
            />
          </>
        ) : (
          <>
            <Text style={s.hintText}>
              {t('account.emailPendingHint', { email: pendingEmail })}
            </Text>

            <FormField
              icon="pin"
              value={emailCode}
              onChangeText={(text) => setEmailCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
              placeholder={t('auth.placeholders.verificationCode')}
              keyboardType="number-pad"
              editable={!savingEmail}
              style={s.fieldSpacing}
            />

            <PrimaryButton
              label={savingEmail ? t('account.saving') : t('account.confirmEmailChange')}
              onPress={handleConfirmEmailChange}
              disabled={savingEmail}
              icon="check"
              style={s.submitButton}
            />

            <Text style={s.linkText} onPress={handleCancelEmailChange}>
              {t('common.actions.cancel')}
            </Text>
          </>
        )}

        {/* ── Password ────────────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>{t('account.passwordSection')}</Text>

        <FormField
          icon="lock-outline"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder={t('account.currentPasswordPlaceholder')}
          secureTextEntry
          editable={!savingPassword}
        />

        <FormField
          icon="password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder={t('account.newPasswordPlaceholder')}
          secureTextEntry
          editable={!savingPassword}
          style={s.fieldSpacing}
        />

        <PrimaryButton
          label={savingPassword ? t('account.saving') : t('account.changePassword')}
          onPress={handleChangePassword}
          disabled={savingPassword}
          icon="check"
          style={s.submitButton}
        />
      </KeyboardAwareScreen>
    </View>
  );
}
