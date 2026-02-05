/**
 * Custom hook for image picker functionality
 */

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { MAX_IMAGE_SIZE, MAX_IMAGES_PER_REPORT } from '../constants/config';

interface ImageAsset {
    uri: string;
    width: number;
    height: number;
    type?: string;
    fileSize?: number;
}

interface UseImagePickerReturn {
    images: ImageAsset[];
    isLoading: boolean;
    error: string | null;
    pickFromGallery: () => Promise<void>;
    takePhoto: () => Promise<void>;
    removeImage: (index: number) => void;
    clearImages: () => void;
    canAddMore: boolean;
}

export const useImagePicker = (maxImages: number = MAX_IMAGES_PER_REPORT): UseImagePickerReturn => {
    const [images, setImages] = useState<ImageAsset[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canAddMore = images.length < maxImages;

    const requestMediaLibraryPermission = useCallback(async (): Promise<boolean> => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setError('Permission to access gallery was denied');
            return false;
        }
        return true;
    }, []);

    const requestCameraPermission = useCallback(async (): Promise<boolean> => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            setError('Permission to access camera was denied');
            return false;
        }
        return true;
    }, []);

    const validateImage = useCallback((asset: ImagePicker.ImagePickerAsset): boolean => {
        if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) {
            setError(`Image size exceeds ${MAX_IMAGE_SIZE / (1024 * 1024)}MB limit`);
            return false;
        }
        return true;
    }, []);

    const pickFromGallery = useCallback(async (): Promise<void> => {
        if (!canAddMore) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        const hasPermission = await requestMediaLibraryPermission();
        if (!hasPermission) return;

        try {
            setIsLoading(true);
            setError(null);

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                if (validateImage(asset)) {
                    setImages((prev) => [
                        ...prev,
                        {
                            uri: asset.uri,
                            width: asset.width,
                            height: asset.height,
                            type: asset.mimeType,
                            fileSize: asset.fileSize,
                        },
                    ]);
                }
            }
        } catch {
            setError('Failed to pick image from gallery');
        } finally {
            setIsLoading(false);
        }
    }, [canAddMore, maxImages, requestMediaLibraryPermission, validateImage]);

    const takePhoto = useCallback(async (): Promise<void> => {
        if (!canAddMore) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        try {
            setIsLoading(true);
            setError(null);

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                if (validateImage(asset)) {
                    setImages((prev) => [
                        ...prev,
                        {
                            uri: asset.uri,
                            width: asset.width,
                            height: asset.height,
                            type: asset.mimeType,
                            fileSize: asset.fileSize,
                        },
                    ]);
                }
            }
        } catch {
            setError('Failed to take photo');
        } finally {
            setIsLoading(false);
        }
    }, [canAddMore, maxImages, requestCameraPermission, validateImage]);

    const removeImage = useCallback((index: number): void => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setError(null);
    }, []);

    const clearImages = useCallback((): void => {
        setImages([]);
        setError(null);
    }, []);

    return {
        images,
        isLoading,
        error,
        pickFromGallery,
        takePhoto,
        removeImage,
        clearImages,
        canAddMore,
    };
};
