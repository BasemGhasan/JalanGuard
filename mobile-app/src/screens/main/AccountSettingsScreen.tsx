import React, { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader, FormField, InfoCard, PrimaryButton, KeyboardAwareScreen } from '../../components';
import { changePassword, updateDisplayName } from '../../services';
import type { UserProfile } from '../../types';
import { accountSettingsScreenStyles as s } from '../../styles/screens';

type AccountSettingsScreenProps = {
  user: UserProfile | null;
  onBack: () => void;
};

const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 3;

/**
 * Settings → Account: edit the display name and change the password.
 *
 * Email is shown read-only. Changing it in Supabase triggers a confirmation
 * flow on both the old and new address, which the mobile app has no path to
 * complete — so it's deliberately not editable here.
 */
export function AccountSettingsScreen({ user, onBack }: AccountSettingsScreenProps) {
  const { t } = useTranslation();

  const [fullName, setFullName] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);

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
        <Text style={s.sectionTitle}>{t('account.profileSection')}</Text>

        <InfoCard icon="mail-outline" title={t('account.emailLabel')} value={user?.email ?? '—'} />
        <Text style={s.hintText}>{t('account.emailHint')}</Text>

        <FormField
          icon="person-outline"
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('auth.placeholders.fullName')}
          autoCapitalize="words"
          editable={!savingName}
          style={s.fieldSpacing}
        />

        <PrimaryButton
          label={savingName ? t('account.saving') : t('account.saveName')}
          onPress={handleSaveName}
          disabled={savingName}
          icon="check"
          style={s.submitButton}
        />

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
