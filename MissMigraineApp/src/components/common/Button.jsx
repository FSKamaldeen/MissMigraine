import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ─────────────────────────────────────────────────────
// Shared size tokens
// ─────────────────────────────────────────────────────

const SIZE_PADDING = {
  sm: 'py-2 px-4',
  md: 'py-3 px-5',
  lg: 'py-4 px-6',
};

const SIZE_TEXT = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
};

const ICON_SIZE = {
  sm: 16,
  md: 18,
  lg: 20,
};

// ─────────────────────────────────────────────────────
// PrimaryButton
// ─────────────────────────────────────────────────────

export function PrimaryButton({
  label,
  onPress,
  icon,
  loading = false,
  disabled = false,
  size = 'lg',
  fullWidth = true,
  style,
}) {
  const isDisabled = disabled || loading;
  const iconColor = isDisabled ? '#ad89dc' : '#11081b';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-full ${
        SIZE_PADDING[size]
      } ${isDisabled ? 'bg-elevated' : 'bg-brand active:bg-brand-dark'} ${
        fullWidth ? 'w-full' : ''
      }`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={ICON_SIZE[size]}
              color={iconColor}
              style={{ marginRight: label ? 8 : 0 }}
            />
          )}
          {label && (
            <Text
              className={`font-plein-medium ${SIZE_TEXT[size]} ${
                isDisabled ? 'text-text-muted' : 'text-text-inverse'
              }`}
            >
              {label}
            </Text>
          )}
        </>
      )}
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────
// SecondaryButton
// ─────────────────────────────────────────────────────

export function SecondaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  size = 'lg',
  fullWidth = true,
  style,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center rounded-full border-[1.5px] border-brand-light bg-transparent ${
        SIZE_PADDING[size]
      } ${disabled ? 'opacity-50' : 'active:bg-elevated'} ${
        fullWidth ? 'w-full' : ''
      }`}
      style={style}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={ICON_SIZE[size]}
          color="#c8b0e8"
          style={{ marginRight: label ? 8 : 0 }}
        />
      )}
      {label && (
        <Text
          className={`font-plein-medium ${SIZE_TEXT[size]} text-brand-light`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────
// DangerButton
// ─────────────────────────────────────────────────────

export function DangerButton({
  label,
  onPress,
  icon,
  disabled = false,
  size = 'lg',
  fullWidth = true,
  style,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center rounded-full bg-danger ${
        SIZE_PADDING[size]
      } ${disabled ? 'opacity-50' : 'active:opacity-80'} ${
        fullWidth ? 'w-full' : ''
      }`}
      style={style}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={ICON_SIZE[size]}
          color="#f1ebf9"
          style={{ marginRight: label ? 8 : 0 }}
        />
      )}
      {label && (
        <Text
          className={`font-plein-medium ${SIZE_TEXT[size]} text-text-primary`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────
// TextButton
// ─────────────────────────────────────────────────────

export function TextButton({
  label,
  onPress,
  disabled = false,
  style,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={disabled ? 'opacity-50' : 'active:opacity-60'}
      style={style}
    >
      <Text className="font-plein text-sm text-brand-light">{label}</Text>
    </Pressable>
  );
}