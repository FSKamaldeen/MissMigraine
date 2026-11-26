import React from 'react';
import { Text, TextInput, View } from 'react-native';

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  secureTextEntry = false,
  multiline = false,
  numberOfLines,
  required = false,
  style,
  inputStyle,
}) {
  return (
    <View className="mb-4" style={style}>
      {label && (
        <Text className="mb-2 font-plein-medium text-sm text-text-secondary">
          {label}
          {required && <Text className="text-danger"> *</Text>}
        </Text>
      )}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#ad89dc"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'auto'}
        className={`rounded-2xl bg-surface px-5 font-plein text-base text-text-primary ${
          multiline ? 'py-4 h-28' : 'h-[54px]'
        }`}
        style={inputStyle}
      />
    </View>
  );
}