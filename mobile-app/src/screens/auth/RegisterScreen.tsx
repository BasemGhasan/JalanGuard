/**
 * RegisterScreen Component
 * User registration page
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
import { isValidEmail, isValidPassword } from '../../utils';
import { AuthStackParamList } from '../../navigation/types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const { handleRegister, loadingState, error } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const isLoading = useMemo(() => loadingState === 'loading', [loadingState]);

    const validateForm = useCallback((): boolean => {
        let isValid = true;
        setFirstNameError('');
        setLastNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        if (!firstName.trim()) {
            setFirstNameError(t('validation.field_required'));
            isValid = false;
        }

        if (!lastName.trim()) {
            setLastNameError(t('validation.field_required'));
            isValid = false;
        }

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
        } else if (!isValidPassword(password)) {
            setPasswordError(t('validation.password_min_length'));
            isValid = false;
        }

        if (!confirmPassword) {
            setConfirmPasswordError(t('validation.field_required'));
            isValid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError(t('auth.password_mismatch'));
            isValid = false;
        }

        return isValid;
    }, [firstName, lastName, email, password, confirmPassword, t]);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;

        await handleRegister({ firstName, lastName, email, password });
    }, [validateForm, handleRegister, firstName, lastName, email, password]);

    const navigateToLogin = useCallback(() => {
        navigation.navigate('Login');
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
                        <Text style={styles.title}>{t('auth.register')}</Text>
                        <Text style={styles.subtitle}>{t('auth.register_button')}</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.nameRow}>
                            <View style={styles.nameInput}>
                                <CustomInput
                                    label={t('common.first_name') || 'First Name'}
                                    placeholder="John"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    error={firstNameError}
                                    autoCapitalize="words"
                                />
                            </View>
                            <View style={styles.nameInput}>
                                <CustomInput
                                    label={t('common.last_name') || 'Last Name'}
                                    placeholder="Doe"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    error={lastNameError}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

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
                            autoComplete="password-new"
                            leftIcon="lock-closed-outline"
                        />

                        <CustomInput
                            label={t('auth.confirm_password')}
                            placeholder={t('auth.confirm_password')}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            error={confirmPasswordError}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                        />

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <CustomButton
                            title={t('auth.register_button')}
                            onPress={handleSubmit}
                            loading={isLoading}
                            fullWidth
                            style={styles.registerButton}
                        />
                    </View>

                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>{t('auth.already_have_account')}</Text>
                        <TouchableOpacity onPress={navigateToLogin}>
                            <Text style={styles.loginLink}>{t('auth.login')}</Text>
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
    nameRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    nameInput: {
        flex: 1,
    },
    errorText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.error,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    registerButton: {
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
    loginLink: {
        fontSize: FONT_SIZES.md,
        color: COLORS.secondary,
        fontWeight: '600',
        marginLeft: SPACING.xs,
    },
});
