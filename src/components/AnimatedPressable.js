import React, { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressableRN = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 12, stiffness: 200, mass: 0.6 };

const AnimatedPressable = memo(({
  children,
  style,
  onPress,
  scaleDown = 0.96,
  haptic = true,
  disabled = false,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleDown, SPRING);
    opacity.value = withTiming(0.85, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING);
    opacity.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    if (disabled) return;
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <AnimatedPressableRN
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[animatedStyle, style]}
      {...props}
    >
      {children}
    </AnimatedPressableRN>
  );
});

export default AnimatedPressable;
