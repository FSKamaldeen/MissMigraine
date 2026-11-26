import React, { useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import LottieView from 'lottie-react-native';

export default function SplashScreen({ onFinish }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [animationDone, setAnimationDone] = useState(false);

const handleAnimationFinish = () => {
  if (animationDone) return;
  setAnimationDone(true);
  setTimeout(() => onFinish?.(), 600);
};

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: '#f1ebf9',
        opacity,
        transform: [{ translateY }],
      }}
    >
      <LottieView
        source={require('../assets/animations/splash.json')}
        autoPlay
        loop={false}
        resizeMode="cover"
        onAnimationFinish={handleAnimationFinish}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}