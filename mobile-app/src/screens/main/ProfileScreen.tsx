import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants';
import { AppHeader, FormField, InfoCard, PrimaryButton } from '../../components';
import * as authService from '../../services';
import type { UserProfile } from '../../types';
import { profileScreenStyles } from '../../styles/screens';

type ProfileScreenProps = {
  user: UserProfile | null;
  onLogout: () => Promise<void>;
  onOpenSettings: () => void;
};

/** "Ada Lovelace" → "AL"; falls back to "JG" when no name is available. */
function initialsOf(name?: string): string {
  if (!name) return 'JG';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0]).join('');
  return initials ? initials.toUpperCase() : 'JG';
}

export function ProfileScreen({ user, onLogout, onOpenSettings }: ProfileScreenProps) {
  const { t } = useTranslation();

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const initials = useMemo(() => initialsOf(user?.name), [user?.name]);

  const handleDelete = useCallback(async () => {
    if (!user?.email) return;
    if (!password) {
      Alert.alert('Password required', 'Enter your password to confirm deletion.');
      return;
    }
    setDeleting(true);
    try {
      // On success, deleteAccount signs the user out — the auth listener then
      // routes the app back to the login stack automatically.
      await authService.deleteAccount(user.email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete account.';
      Alert.alert('Delete failed', message);
    } finally {
      setDeleting(false);
      setPassword('');
      setDeleteVisible(false);
    }
  }, [password, user?.email]);

  return (
    <ScrollView style={profileScreenStyles.container} contentContainerStyle={profileScreenStyles.content}>
      <AppHeader title={t('profile.title')} rightIcon="settings" onRightPress={onOpenSettings} />

      <View style={profileScreenStyles.avatar}>
        <Text style={profileScreenStyles.avatarText}>{initials}</Text>
      </View>
      <Text style={profileScreenStyles.name}>{user?.name ?? t('profile.userName')}</Text>
      <Text style={profileScreenStyles.level}>{user?.email ?? t('profile.level')}</Text>

      <View style={profileScreenStyles.statsWrap}>
        <InfoCard icon="warning" title={t('profile.stats.reports')} value="24" />
        <InfoCard icon="thumb-up" title={t('profile.stats.verifies')} value="58" />
        <InfoCard icon="emoji-events" title={t('profile.stats.rank')} value="#12" />
      </View>

      <Pressable style={profileScreenStyles.logoutButton} onPress={onLogout}>
        <MaterialIcons name="logout" size={18} color={COLORS.error} />
        <Text style={profileScreenStyles.logoutText}>{t('common.actions.logout')}</Text>
      </Pressable>

      <Pressable style={profileScreenStyles.deleteLink} onPress={() => setDeleteVisible(true)}>
        <Text style={profileScreenStyles.deleteLinkText}>Delete account</Text>
      </Pressable>

      <Modal
        visible={deleteVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteVisible(false)}
      >
        <View style={profileScreenStyles.modalOverlay}>
          <View style={profileScreenStyles.modalCard}>
            <Text style={profileScreenStyles.modalTitle}>Delete account</Text>
            <Text style={profileScreenStyles.modalHint}>
              This permanently deletes your account and reports. Enter your password to confirm.
            </Text>

            <FormField
              icon="lock-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              style={profileScreenStyles.modalInput}
            />

            <PrimaryButton
              label={deleting ? 'Deleting…' : 'Delete permanently'}
              onPress={handleDelete}
              disabled={deleting}
              icon="delete-outline"
            />

            <Pressable
              style={profileScreenStyles.modalCancel}
              onPress={() => {
                setPassword('');
                setDeleteVisible(false);
              }}
              disabled={deleting}
            >
              <Text style={profileScreenStyles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
