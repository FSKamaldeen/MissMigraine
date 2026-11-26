import React from 'react';
import { Pressable, Text, View, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { CYCLE_PHASE_META } from '../../../../../constants/colors';
import { formatMonthLabel, isSameDay } from '../../../../../utils/dateUtils';

function buildCalendarGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
  }
  return cells;
}

export default function CycleMonthCalendar({
  displayMonth,
  onShiftMonth,
  selectedDate,
  onSelectDate,
  getSummaryForDate,
  selectedDateSummary,
}) {
  const cells = buildCalendarGrid(displayMonth.getFullYear(), displayMonth.getMonth());
  const currentMonthDays = cells.filter((c) => c.isCurrentMonth);
  const totalDays = currentMonthDays.length;
  const anglePerDay = 360 / totalDays;

  const { width } = Dimensions.get('window');
  
  const size = Math.min(width - 100, 280); 
  const radius = size / 2;
  const strokeWidth = 36; 
  const circleRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * circleRadius;
  const dayDash = (circumference / totalDays) - 1;

  return (
    <View className="mb-8">
      {/* Section Header */}
      <View className="mb-3 flex-row items-center justify-between px-6">
        <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
          Cycle Calendar
        </Text>
      </View>

      <View className="mx-6 rounded-[24px] bg-surface p-6 pb-8 items-center">
        
        {/* Month Navigation */}
        <View className="w-full mb-4 flex-row items-center justify-between">
          <Pressable onPress={() => onShiftMonth(-1)} hitSlop={10} className="p-2">
            <MaterialCommunityIcons name="chevron-left" size={28} color="#f1ebf9" />
          </Pressable>
          <Text className="font-plein-medium text-base text-text-primary">
            {formatMonthLabel(displayMonth)}
          </Text>
          <Pressable onPress={() => onShiftMonth(1)} hitSlop={10} className="p-2">
            <MaterialCommunityIcons name="chevron-right" size={28} color="#f1ebf9" />
          </Pressable>
        </View>

        {/* The Circular Chart */}
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={size} height={size}>
            {currentMonthDays.map((cell, index) => {
              const summary = getSummaryForDate(cell.date);
              const phaseKey = summary?.phaseKey;
              const meta = phaseKey ? CYCLE_PHASE_META[phaseKey] : null;
              const isSelected = isSameDay(cell.date, selectedDate);

              const rotation = (index * anglePerDay) - 90;

              return (
                <Circle
                  key={`ring-${index}`}
                  cx={radius}
                  cy={radius}
                  r={circleRadius}
                  stroke={isSelected ? '#f1ebf9' : (meta ? meta.color : '#2f174f')}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={`${dayDash} ${circumference}`}
                  transform={`rotate(${rotation}, ${radius}, ${radius})`}
                />
              );
            })}

            {currentMonthDays.map((cell, index) => {
              const angle = (index * anglePerDay) - 90 + (anglePerDay / 2);
              const rad = (angle * Math.PI) / 180;

              const textRadius = radius - strokeWidth / 2;
              const x = radius + textRadius * Math.cos(rad);
              const y = radius + textRadius * Math.sin(rad);

              const isSelected = isSameDay(cell.date, selectedDate);

              return (
                <SvgText
                  key={`text-${index}`}
                  x={x}
                  y={y + 4}
                  fill={isSelected ? '#11081b' : '#f1ebf9'}
                  fontSize="12"
                  fontFamily="Plein-Medium"
                  textAnchor="middle"
                  onPress={() => onSelectDate(cell.date)}
                >
                  {cell.date.getDate()}
                </SvgText>
              );
            })}
          </Svg>

          {/* Center Info Panel */}
          <View
            style={{ 
              position: 'absolute', 
              width: circleRadius * 2 - strokeWidth, 
              height: circleRadius * 2 - strokeWidth, 
              borderRadius: 999, 
              backgroundColor: '#211136', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: 20 
            }}
          >
            {selectedDateSummary ? (
              <>
                <Text className="text-center font-plein text-base text-text-primary mb-1">
                  {selectedDateSummary.phaseKey === 'menstrual' ? 'Higher' : 'Lower'} migraine risk
                </Text>
                <Text 
                  className="text-center font-reem text-2xl" 
                  style={{ color: CYCLE_PHASE_META[selectedDateSummary.phaseKey].color }}
                >
                  {CYCLE_PHASE_META[selectedDateSummary.phaseKey].fullName}
                </Text>
                <Text className="text-center font-plein-medium text-sm text-text-secondary mt-1">
                  Day {selectedDateSummary.dayInCycle}
                </Text>
              </>
            ) : (
              <Text className="text-center font-plein text-sm text-text-muted">
                No cycle estimate
              </Text>
            )}
          </View>
        </View>

      </View>
    </View>
  );
}