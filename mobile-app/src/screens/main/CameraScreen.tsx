import React from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants';
import { BadgeChip } from '../../components';
import { cameraScreenStyles } from '../../styles/screens';

type CameraScreenProps = {
  onBack: () => void;
  onCapture: () => void;
};

const PREVIEW_IMAGE =
  'https://images.unsplash.com/photo-1709934730506-fba12664d4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

export function CameraScreen({ onBack, onCapture }: CameraScreenProps) {
  const { t } = useTranslation();

  return (
    <ImageBackground source={{ uri: PREVIEW_IMAGE }} style={cameraScreenStyles.container}>
      <View style={cameraScreenStyles.overlay}>
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
          <View style={cameraScreenStyles.severityTag}>
            <BadgeChip label={t('camera.highSeverity')} tone="danger" />
          </View>
        </View>

        <View style={cameraScreenStyles.bottomPanel}>
          <View style={cameraScreenStyles.locationRow}>
            <MaterialIcons name="location-on" size={14} color={COLORS.secondary} />
            <Text style={cameraScreenStyles.locationText}>{t('camera.coordinates')}</Text>
          </View>

          <Pressable onPress={onCapture} style={cameraScreenStyles.captureOuter}>
            <View style={cameraScreenStyles.captureInner} />
          </Pressable>

          <Text style={cameraScreenStyles.hintText}>{t('camera.hint')}</Text>
        </View>
      </View>
    </ImageBackground>
  );
}
