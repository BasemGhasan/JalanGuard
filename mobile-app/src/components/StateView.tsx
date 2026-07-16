import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants';
import { isOfflineError } from '../utils';
import { stateViewStyles as s } from '../styles/components';

type StateViewProps = {
  /** Shows a centered spinner. Takes precedence over error/empty. */
  loading?: boolean;
  /** When set, renders an error message with a Retry button. */
  error?: Error | null;
  onRetry?: () => void;
  /** When true (and not loading/error), renders the empty state. */
  empty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: keyof typeof MaterialIcons.glyphMap;
};

/**
 * Shared loading / error / empty presenter so every data-backed screen offers
 * the same fallbacks — a spinner while fetching, a friendly retry on failure
 * (with an offline-specific heading), and a tidy empty state when there's no
 * data. Replaces the ad-hoc mock placeholders the screens used to ship with.
 */
export function StateView({
  loading,
  error,
  onRetry,
  empty,
  emptyTitle,
  emptyMessage,
  emptyIcon = 'inbox',
}: StateViewProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={s.container}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  if (error) {
    const offline = isOfflineError(error);
    return (
      <View style={s.container}>
        <MaterialIcons
          name={offline ? 'wifi-off' : 'error-outline'}
          size={40}
          color={COLORS.disabled}
        />
        <Text style={s.title}>
          {offline ? t('common.states.offlineTitle') : t('common.states.errorTitle')}
        </Text>
        <Text style={s.message}>{error.message}</Text>
        {onRetry && (
          <Pressable style={s.retryButton} onPress={onRetry}>
            <Text style={s.retryText}>{t('common.states.retry')}</Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={s.container}>
        <MaterialIcons name={emptyIcon} size={40} color={COLORS.disabled} />
        <Text style={s.title}>{emptyTitle ?? t('common.states.emptyTitle')}</Text>
        {emptyMessage && <Text style={s.message}>{emptyMessage}</Text>}
      </View>
    );
  }

  return null;
}
