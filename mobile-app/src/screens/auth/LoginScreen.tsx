/**
 * LoginScreen Component
 * User authentication login page
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomButton, CustomInput } from '../../components';
import { useAuth } from '../../hooks';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';
import { isValidEmail } from '../../utils';
import { AuthStackParamList } from '../../navigation/types';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const { handleLogin, loadingState, error } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const isLoading = useMemo(() => loadingState === 'loading', [loadingState]);

    const validateForm = useCallback((): boolean => {
        let isValid = true;
        setEmailError('');
        setPasswordError('');

        if (!email.trim()) {
            setEmailError(t('validation.field_required'));
            isValid = false;
        } else if (!isValidEmail(email)) {
            setEmailError(t('validation.email_invalid'));
            isValid = false;
        }

        if (!password) {
            setPasswordError(t('validation.field_required'));
            isValid = false;
        }

        return isValid;
    }, [email, password, t]);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;

        await handleLogin({ email, password });
    }, [validateForm, handleLogin, email, password]);

    const navigateToRegister = useCallback(() => {
        navigation.navigate('Register');
    }, [navigation]);

    const navigateToForgotPassword = useCallback(() => {
        navigation.navigate('ForgotPassword');
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>{t('common.app_name')}</Text>
                        <Text style={styles.subtitle}>{t('home.welcome_message')}</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <CustomInput
                            label={t('auth.email')}
                            placeholder={t('auth.email')}
                            value={email}
                            onChangeText={setEmail}
                            error={emailError}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            leftIcon="mail-outline"
                        />

                        <CustomInput
                            label={t('auth.password')}
                            placeholder={t('auth.password')}
                            value={password}
                            onChangeText={setPassword}
                            error={passwordError}
                            secureTextEntry
                            autoComplete="password"
                            leftIcon="lock-closed-outline"
                        />

                        <TouchableOpacity
                            onPress={navigateToForgotPassword}
                            style={styles.forgotPassword}
                        >
                            <Text style={styles.forgotPasswordText}>
                                {t('auth.forgot_password')}
                            </Text>
                        </TouchableOpacity>

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <CustomButton
                            title={t('auth.login_button')}
                            onPress={handleSubmit}
                            loading={isLoading}
                            fullWidth
                            style={styles.loginButton}
                        />
                    </View>

                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>{t('auth.dont_have_account')}</Text>
                        <TouchableOpacity onPress={navigateToRegister}>
                            <Text style={styles.registerLink}>{t('auth.register')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.accent,
    },
    formContainer: {
        marginBottom: SPACING.lg,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.md,
    },
    forgotPasswordText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.secondary,
    },
    errorText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.error,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    loginButton: {
        marginTop: SPACING.sm,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.accent,
    },
    registerLink: {
        fontSize: FONT_SIZES.md,
        color: COLORS.secondary,
        fontWeight: '600',
        marginLeft: SPACING.xs,
    },
});
