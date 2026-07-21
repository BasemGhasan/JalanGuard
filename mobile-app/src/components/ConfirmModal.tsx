import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { confirmModalStyles as s } from '../styles/components';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  icon,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.overlay}>
        <View style={s.card}>
          {icon ? (
            <View style={s.iconWrap}>
              <MaterialIcons name={icon} size={24} color={COLORS.error} />
            </View>
          ) : null}

          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>

          <View style={s.actions}>
            <Pressable style={s.cancelButton} onPress={onCancel}>
              <Text style={s.cancelText}>{cancelLabel}</Text>
            </Pressable>

            <Pressable style={s.confirmButton} onPress={onConfirm}>
              <Text style={s.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
