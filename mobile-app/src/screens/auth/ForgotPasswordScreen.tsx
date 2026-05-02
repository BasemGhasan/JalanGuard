import React, { useCallback, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types';
import { COLORS } from '../../constants';
import { PrimaryButton } from '../../components';
import { isValidEmail } from '../../utils';
import { forgotPasswordScreenStyles } from '../../styles/screens';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleSendResetLink = useCallback(() => {
    if (!isValidEmail(email)) {
      Alert.alert(t('auth.alerts.invalidEmailTitle'), t('auth.alerts.invalidEmailMessage'));
      return;
    }

    Alert.alert(t('auth.alerts.resetEmailSentTitle'), t('auth.alerts.resetEmailSentMessage'));
    navigation.navigate('Login');
  }, [email, navigation, t]);

  return (
    <View style={forgotPasswordScreenStyles.container}>
      <Text style={forgotPasswordScreenStyles.title}>{t('auth.titles.resetPassword')}</Text>
      <Text style={forgotPasswordScreenStyles.subtitle}>{t('auth.subtitles.resetPassword')}</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.placeholders.email')}
        placeholderTextColor={COLORS.disabled}
        keyboardType="email-address"
        autoCapitalize="none"
        style={forgotPasswordScreenStyles.input}
      />

      <PrimaryButton label={t('common.actions.sendResetLink')} onPress={handleSendResetLink} icon="chevron-right" />

      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={forgotPasswordScreenStyles.linkText}>{t('common.actions.backToLogin')}</Text>
      </Pressable>
    </View>
  );
}
