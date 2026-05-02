import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { listRowStyles } from '../styles/components';

type ListRowProps = {
  title: string;
  subtitle?: string;
  thumbnailUri?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  children?: React.ReactNode;
};

export function ListRow({
  title,
  subtitle,
  thumbnailUri,
  icon,
  rightIcon,
  onPress,
  children,
}: ListRowProps) {
  const Container = onPress ? Pressable : View;

  return (
    <Container style={listRowStyles.row} onPress={onPress}>
      {thumbnailUri ? <Image source={{ uri: thumbnailUri }} style={listRowStyles.thumbnail} /> : null}

      {icon ? (
        <View style={listRowStyles.iconWrap}>
          <MaterialIcons name={icon} size={20} color={COLORS.secondary} />
        </View>
      ) : null}

      <View style={listRowStyles.textWrap}>
        <Text style={listRowStyles.title}>{title}</Text>
        {subtitle ? <Text style={listRowStyles.subtitle}>{subtitle}</Text> : null}
        {children ? <View style={listRowStyles.childrenWrap}>{children}</View> : null}
      </View>

      {rightIcon ? <MaterialIcons name={rightIcon} size={20} color={COLORS.disabled} /> : null}
    </Container>
  );
}
