import React from 'react';
import { Image, Text, View } from 'react-native';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

export default function GreetingHeader({ name = 'there' }) {
  return (
    <View 
      className="mx-6 mt-6 mb-8 h-44 rounded-[28px] bg-wisteria-300 overflow-hidden flex-row"
      style={{
        shadowColor: '#11081b',
        shadowOpacity: 0.4,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      
      {/* Left Side: Text Block */}
      <View className="flex-1 justify-center pl-6 pr-4 z-10">
        <Text className="font-reem text-3xl text-text-inverse mb-1">
          {getGreeting()}
        </Text>
        <Text 
          className="font-reem text-5xl text-text-primary" 
          style={{ lineHeight: 60 }}
        >
          {name}
        </Text>
      </View>

      {/* Right Side: Mascot peeking from bottom right */}
      <View className="absolute bottom-0 right-0 w-48 h-48 justify-end items-end">
        <Image
          source={require('../../../../assets/images/normal.png')}
          style={{ 
            width: 200, 
            height: 200,
            marginBottom: -50, 
            marginRight: -54,
          }}
          resizeMode="contain"
        />
      </View>

    </View>
  );
}