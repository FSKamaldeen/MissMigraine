import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MultiSelectList({
  options,
  selected,
  onToggle,
  allowCustom = false,
  customPlaceholder = 'Add custom',
  onAddCustom,
}) {
  const [customValue, setCustomValue] = useState('');

  const handleAdd = () => {
    const trimmed = customValue.trim();
    if (!trimmed) return;
    if (onAddCustom) onAddCustom(trimmed);
    setCustomValue('');
  };

  return (
    <View>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <Pressable
              key={option}
              onPress={() => onToggle(option)}
              className={`flex-row items-center gap-2 rounded-full border-[1.5px] px-4 py-2.5 ${
                isSelected
                  ? 'border-brand-light bg-brand-dark/30'
                  : 'border-outline bg-surface'
              }`}
            >
              <Text
                className={`font-plein-medium text-sm ${
                  isSelected ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {option}
              </Text>
              {isSelected && (
                <MaterialCommunityIcons name="check" size={16} color="#ad89dc" />
              )}
            </Pressable>
          );
        })}
      </View>

      {allowCustom && (
        <View className="mt-4 flex-row items-center gap-2">
          <TextInput
            value={customValue}
            onChangeText={setCustomValue}
            placeholder={customPlaceholder}
            placeholderTextColor="#ad89dc"
            className="h-12 flex-1 rounded-full bg-surface px-5 font-plein text-sm text-text-primary"
            onSubmitEditing={handleAdd}
          />
          <Pressable
            onPress={handleAdd}
            className="h-12 w-12 items-center justify-center rounded-full bg-brand active:bg-brand-dark"
          >
            <MaterialCommunityIcons name="plus" size={20} color="#11081b" />
          </Pressable>
        </View>
      )}
    </View>
  );
}