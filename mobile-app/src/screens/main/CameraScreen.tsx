import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING } from '../../constants';
import { BadgeChip, PrimaryButton } from '../../components';
import { CapturedReport } from '../../types';
import { cameraScreenStyles } from '../../styles/screens';

type CameraScreenProps = {
  onBack: () => void;
  onCapture: (report: CapturedReport) => void;
};

export function CameraScreen({ onBack, onCapture }: CameraScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!active) return;

      if (status !== 'granted') {
        setLocationDenied(true);
        return;
      }

      try {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (active) {
          setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        }
      } catch {
        if (active) setLocationDenied(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !isCameraReady || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      onCapture({
        photoUri: photo.uri,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      });
    } finally {
      setIsCapturing(false);
    }
  }, [coords, isCameraReady, isCapturing, onCapture]);

  if (!permission) {
    return <View style={cameraScreenStyles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={cameraScreenStyles.permissionContainer}>
        <MaterialIcons name="photo-camera" size={48} color={COLORS.secondary} />
        <Text style={cameraScreenStyles.permissionTitle}>{t('camera.permissionTitle')}</Text>
        <Text style={cameraScreenStyles.permissionMessage}>{t('camera.permissionMessage')}</Text>
        <View style={cameraScreenStyles.permissionActions}>
          <PrimaryButton label={t('camera.grantAccess')} onPress={requestPermission} />
        </View>
      </View>
    );
  }

  const locationText = coords
    ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
    : locationDenied
      ? t('camera.locationUnavailable')
      : t('camera.locating');

  return (
    <View style={cameraScreenStyles.container}>
      <CameraView ref={cameraRef} style={cameraScreenStyles.camera} facing="back" onCameraReady={() => setIsCameraReady(true)} />

      <View
        style={[
          cameraScreenStyles.overlay,
          { paddingTop: insets.top + SPACING.md, paddingBottom: insets.bottom + SPACING.lg },
        ]}
        pointerEvents="box-none"
      >
        <View style={cameraScreenStyles.topRow}>
          <Pressable onPress={onBack} style={cameraScreenStyles.iconButton}>
            <MaterialIcons name="close" size={22} color={COLORS.white} />
          </Pressable>
          <View style={cameraScreenStyles.livePillWrap}>
            <View style={cameraScreenStyles.liveDot} />
            <BadgeChip label={t('camera.live')} tone="success" />
          </View>
        </View>

        <View style={cameraScreenStyles.focusBox}>
          <View style={cameraScreenStyles.cornerTopLeft} />
          <View style={cameraScreenStyles.cornerTopRight} />
          <View style={cameraScreenStyles.cornerBottomLeft} />
          <View style={cameraScreenStyles.cornerBottomRight} />
        </View>

        <View style={cameraScreenStyles.bottomPanel}>
          <View style={cameraScreenStyles.locationRow}>
            <MaterialIcons name="location-on" size={14} color={COLORS.secondary} />
            <Text style={cameraScreenStyles.locationText}>{locationText}</Text>
          </View>

          <Pressable
            onPress={handleCapture}
            disabled={!isCameraReady || isCapturing}
            style={[cameraScreenStyles.captureOuter, (!isCameraReady || isCapturing) && cameraScreenStyles.captureDisabled]}
          >
            <View style={cameraScreenStyles.captureInner} />
          </Pressable>

          <Text style={cameraScreenStyles.hintText}>{t('camera.hint')}</Text>
        </View>
      </View>
    </View>
  );
}
