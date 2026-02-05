/**
 * ForgotPasswordScreen Component
 * Password reset request page
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton, CustomInput } from '../../components';
import { forgotPassword } from '../../services';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';
import { isValidEmail } from '../../utils';

export const ForgotPasswordScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const validateForm = useCallback((): boolean => {
        setEmailError('');

        if (!email.trim()) {
            setEmailError(t('validation.field_required'));
            return false;
        }

        if (!isValidEmail(email)) {
            setEmailError(t('validation.email_invalid'));
            return false;
        }

        return true;
    }, [email, t]);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            setError('');
            await forgotPassword(email);
            setIsSuccess(true);
        } catch (err) {
            setError(t('errors.unknown_error'));
        } finally {
            setIsLoading(false);
        }
    }, [validateForm, email, t]);

    const handleGoBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    if (isSuccess) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.successContainer}>
                    <Ionicons name="mail-outline" size={64} color={COLORS.success} />
                    <Text style={styles.successTitle}>{t('common.success')}</Text>
                    <Text style={styles.successMessage}>
                        Check your email for password reset instructions.
                    </Text>
                    <CustomButton
                        title={t('common.back')}
                        onPress={handleGoBack}
                        variant="outline"
                        style={styles.backButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backIcon}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>

                    <View style={styles.headerContainer}>
                        <Ionicons name="lock-closed-outline" size={48} color={COLORS.secondary} />
                        <Text style={styles.title}>{t('auth.forgot_password')}</Text>
                        <Text style={styles.subtitle}>
                            Enter your email address and we&apos;ll send you instructions to reset your password.
                        </Text>
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

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <CustomButton
                            title="Send Reset Link"
                            onPress={handleSubmit}
                            loading={isLoading}
                            fullWidth
                        />
                    </View>
                </View>
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
    content: {
        flex: 1,
        padding: SPACING.lg,
        justifyContent: 'center',
    },
    backIcon: {
        position: 'absolute',
        top: SPACING.lg,
        left: SPACING.lg,
        padding: SPACING.xs,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: SPACING.md,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.accent,
        textAlign: 'center',
        paddingHorizontal: SPACING.lg,
    },
    formContainer: {
        marginBottom: SPACING.lg,
    },
    errorText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.error,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    successTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.success,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    successMessage: {
        fontSize: FONT_SIZES.md,
        color: COLORS.accent,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    backButton: {
        marginTop: SPACING.md,
    },
});
