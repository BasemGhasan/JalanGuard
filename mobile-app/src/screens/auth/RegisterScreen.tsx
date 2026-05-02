import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types';
import { COLORS } from '../../constants';
import { PrimaryButton } from '../../components';
import { isValidEmail } from '../../utils';
import { registerScreenStyles } from '../../styles/screens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'> & {
  onRegister: (email: string) => Promise<void>;
};

export function RegisterScreen({ navigation, onRegister }: Props) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const buttonLabel = useMemo(
    () => (submitting ? t('auth.buttons.creating') : t('auth.buttons.createAccount')),
    [submitting, t],
  );

  const handleRegister = useCallback(async () => {
    if (fullName.trim().length < 3) {
      Alert.alert(t('auth.alerts.invalidNameTitle'), t('auth.alerts.invalidNameMessage'));
      return;
    }

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
      await onRegister(email);
    } finally {
      setSubmitting(false);
    }
  }, [email, fullName, onRegister, password, t]);

  return (
    <View style={registerScreenStyles.container}>
      <Text style={registerScreenStyles.title}>{t('auth.titles.createAccount')}</Text>
      <Text style={registerScreenStyles.subtitle}>{t('auth.subtitles.register')}</Text>

      <View style={registerScreenStyles.inputWrap}>
        <MaterialIcons name="person-outline" size={20} color={COLORS.disabled} />
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('auth.placeholders.fullName')}
          placeholderTextColor={COLORS.disabled}
          autoCapitalize="words"
          style={registerScreenStyles.input}
        />
      </View>

      <View style={[registerScreenStyles.inputWrap, registerScreenStyles.inputSpacing]}>
        <MaterialIcons name="mail-outline" size={20} color={COLORS.disabled} />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.placeholders.email')}
          placeholderTextColor={COLORS.disabled}
          keyboardType="email-address"
          autoCapitalize="none"
          style={registerScreenStyles.input}
        />
      </View>

      <View style={[registerScreenStyles.inputWrap, registerScreenStyles.inputSpacing]}>
        <MaterialIcons name="lock-outline" size={20} color={COLORS.disabled} />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.placeholders.password')}
          placeholderTextColor={COLORS.disabled}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          style={registerScreenStyles.input}
        />
        <Pressable onPress={() => setShowPassword((prev) => !prev)}>
          <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={COLORS.disabled} />
        </Pressable>
      </View>

      <PrimaryButton label={buttonLabel} onPress={handleRegister} disabled={submitting} icon="chevron-right" />

      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={registerScreenStyles.linkText}>{t('auth.links.hasAccount')}</Text>
      </Pressable>
    </View>
  );
}
