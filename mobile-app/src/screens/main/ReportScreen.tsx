/**
 * ReportScreen Component
 * Create new road defect report
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, CustomButton, LoadingSpinner } from '../../components';
import { useLocation, useImagePicker } from '../../hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { DEFECT_CATEGORIES, DefectCategory } from '../../constants/config';

export const ReportScreen: React.FC = () => {
    const { t } = useTranslation();
    const { location, address, isLoading: locationLoading, refreshLocation } = useLocation();
    const {
        images,
        isLoading: imageLoading,
        pickFromGallery,
        takePhoto,
        removeImage,
        canAddMore
    } = useImagePicker();

    const [category, setCategory] = useState<DefectCategory | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isFormValid = useMemo(() => {
        return category !== null && images.length > 0 && location !== null;
    }, [category, images, location]);

    const handleCategorySelect = useCallback((cat: DefectCategory) => {
        setCategory(cat);
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!isFormValid) {
            Alert.alert(t('common.error'), 'Please fill in all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            // TODO: Submit report to API
            await new Promise((resolve) => setTimeout(resolve, 1500));
            Alert.alert(t('common.success'), t('report.report_submitted'));
            // Reset form
            setCategory(null);
            setDescription('');
        } catch (error) {
            Alert.alert(t('common.error'), t('report.report_failed'));
        } finally {
            setIsSubmitting(false);
        }
    }, [isFormValid, t]);

    const handleShowImageOptions = useCallback(() => {
        Alert.alert(
            t('report.take_photo'),
            '',
            [
                { text: t('report.take_photo'), onPress: takePhoto },
                { text: t('report.choose_from_gallery'), onPress: pickFromGallery },
                { text: t('common.cancel'), style: 'cancel' },
            ]
        );
    }, [t, takePhoto, pickFromGallery]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>{t('report.new_report')}</Text>

                {/* Image Section */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('report.take_photo')}</Text>

                    <View style={styles.imageGrid}>
                        {images.map((image, index) => (
                            <View key={index} style={styles.imageContainer}>
                                <Image source={{ uri: image.uri }} style={styles.image} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => removeImage(index)}
                                >
                                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {canAddMore && (
                            <TouchableOpacity
                                style={styles.addImageButton}
                                onPress={handleShowImageOptions}
                                disabled={imageLoading}
                            >
                                {imageLoading ? (
                                    <LoadingSpinner size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="camera-outline" size={32} color={COLORS.disabled} />
                                        <Text style={styles.addImageText}>Add Photo</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </Card>

                {/* Category Section */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('report.select_category')}</Text>

                    <View style={styles.categoryGrid}>
                        {DEFECT_CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.categoryButton,
                                    category === cat && styles.categoryButtonActive,
                                ]}
                                onPress={() => handleCategorySelect(cat)}
                            >
                                <Text
                                    style={[
                                        styles.categoryText,
                                        category === cat && styles.categoryTextActive,
                                    ]}
                                >
                                    {t(`report.categories.${cat}`)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                {/* Location Section */}
                <Card style={styles.section}>
                    <View style={styles.locationHeader}>
                        <Text style={styles.sectionTitle}>{t('report.current_location')}</Text>
                        <TouchableOpacity onPress={refreshLocation} disabled={locationLoading}>
                            <Ionicons
                                name="refresh"
                                size={20}
                                color={locationLoading ? COLORS.disabled : COLORS.secondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {locationLoading ? (
                        <LoadingSpinner size="small" />
                    ) : (
                        <View style={styles.locationInfo}>
                            <Ionicons name="location" size={20} color={COLORS.secondary} />
                            <Text style={styles.locationText}>
                                {address ?? `${location?.latitude.toFixed(6)}, ${location?.longitude.toFixed(6)}`}
                            </Text>
                        </View>
                    )}
                </Card>

                {/* Description Section */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('report.add_description')}</Text>

                    <TextInput
                        style={styles.descriptionInput}
                        placeholder={t('report.description_placeholder')}
                        placeholderTextColor={COLORS.disabled}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </Card>

                {/* Submit Button */}
                <CustomButton
                    title={t('report.submit_report')}
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={!isFormValid}
                    fullWidth
                    style={styles.submitButton}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.md,
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.lg,
    },
    section: {
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: SPACING.sm,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: BORDER_RADIUS.md,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.full,
    },
    addImageButton: {
        width: 100,
        height: 100,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 2,
        borderColor: COLORS.surface,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addImageText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.disabled,
        marginTop: SPACING.xs,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    categoryButton: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.surface,
    },
    categoryButtonActive: {
        backgroundColor: COLORS.secondary,
    },
    categoryText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.accent,
    },
    categoryTextActive: {
        color: COLORS.white,
        fontWeight: '600',
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    locationText: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        color: COLORS.accent,
    },
    descriptionInput: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: FONT_SIZES.md,
        color: COLORS.primary,
        minHeight: 100,
    },
    submitButton: {
        marginTop: SPACING.md,
        marginBottom: SPACING.xl,
    },
});
