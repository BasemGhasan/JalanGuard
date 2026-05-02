import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types';
import { COLORS } from '../../constants';
import { PrimaryButton } from '../../components';
import { isValidEmail } from '../../utils';
import { loginScreenStyles } from '../../styles/screens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'> & {
  onLogin: (email: string) => Promise<void>;
};

export function LoginScreen({ navigation, onLogin }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      await onLogin(email);
    } finally {
      setSubmitting(false);
    }
  }, [email, onLogin, password, t]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  return (
    <View style={loginScreenStyles.container}>
      <Text style={loginScreenStyles.title}>{t('auth.titles.welcomeBack')}</Text>
      <Text style={loginScreenStyles.subtitle}>{t('auth.subtitles.login')}</Text>

      <View style={loginScreenStyles.inputWrap}>
        <MaterialIcons name="mail-outline" size={20} color={COLORS.disabled} />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.placeholders.email')}
          placeholderTextColor={COLORS.disabled}
          keyboardType="email-address"
          autoCapitalize="none"
          style={loginScreenStyles.input}
        />
      </View>

      <View style={[loginScreenStyles.inputWrap, loginScreenStyles.passwordWrap]}>
        <MaterialIcons name="lock-outline" size={20} color={COLORS.disabled} />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.placeholders.password')}
          placeholderTextColor={COLORS.disabled}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          style={loginScreenStyles.input}
        />
        <Pressable onPress={() => setShowPassword((prev) => !prev)}>
          <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={COLORS.disabled} />
        </Pressable>
      </View>

      <Pressable style={loginScreenStyles.forgotWrap} onPress={handleForgotPassword}>
        <Text style={loginScreenStyles.forgotText}>{t('auth.links.forgotPassword')}</Text>
      </Pressable>

      <PrimaryButton label={buttonLabel} onPress={handleLogin} disabled={submitting} icon="chevron-right" />

      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={loginScreenStyles.linkText}>{t('auth.links.noAccount')}</Text>
      </Pressable>
    </View>
  );
}
