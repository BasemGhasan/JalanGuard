import React, { useMemo } from 'react';
import { DimensionValue, ImageBackground, Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants';
import { PrimaryButton } from '../../components';
import { mapScreenStyles } from '../../styles/screens';

type MapScreenProps = {
  onOpenHazardDetail: () => void;
};

const MAP_IMG =
  'https://images.unsplash.com/photo-1620662892011-f5c2d523fae2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

export function MapScreen({ onOpenHazardDetail }: MapScreenProps) {
  const { t } = useTranslation();

  const pins = useMemo(
    () => [
      { id: '1', top: '35%', left: '28%' },
      { id: '2', top: '46%', left: '58%' },
      { id: '3', top: '59%', left: '40%' },
    ] as Array<{ id: string; top: DimensionValue; left: DimensionValue }>,
    [],
  );

  return (
    <View style={mapScreenStyles.container}>
      <ImageBackground source={{ uri: MAP_IMG }} style={mapScreenStyles.mapArea}>
        <View style={mapScreenStyles.topSearch}>
          <MaterialIcons name="search" size={18} color={COLORS.disabled} />
          <Text style={mapScreenStyles.searchText}>{t('map.searchPlaceholder')}</Text>
        </View>

        {pins.map((pin) => (
          <Pressable
            key={pin.id}
            onPress={onOpenHazardDetail}
            style={[mapScreenStyles.pin, { top: pin.top, left: pin.left }]}
          >
            <MaterialIcons name="warning" size={14} color={COLORS.white} />
          </Pressable>
        ))}

        <View style={mapScreenStyles.bottomSheet}>
          <Text style={mapScreenStyles.bottomTitle}>{t('map.bottomTitle')}</Text>
          <Text style={mapScreenStyles.bottomSubtitle}>{t('map.bottomSubtitle')}</Text>
          <PrimaryButton label={t('common.actions.viewDetails')} onPress={onOpenHazardDetail} icon="chevron-right" />
        </View>
      </ImageBackground>
    </View>
  );
}
