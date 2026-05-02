import React, { memo, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { COLORS, GRADIENTS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

/**
 * GlassBackground — animated ambient background with floating glow orbs.
 * Renders behind screen content to create depth and a premium glass feel.
 */
const FloatingOrb = ({ size, x, y, color, delay }) => {
  const ty = useSharedValue(0);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    ty.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 4000 + delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(-20, { duration: 4000 + delay, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, true,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 3000 }),
        withTiming(0.2, { duration: 3000 }),
      ),
      -1, true,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: x,
          top: y,
        },
      ]}
      pointerEvents="none"
    />
  );
};

const GlassBackground = memo(({ variant = 'blue', children }) => {
  const gradient = {
    blue: GRADIENTS.ambientBlue,
    purple: GRADIENTS.ambientPurple,
    gold: GRADIENTS.ambientGold,
    night: GRADIENTS.nightSky,
  }[variant] || GRADIENTS.ambientBlue;

  const orbColor = {
    blue: 'rgba(0,102,255,0.25)',
    purple: 'rgba(168,85,247,0.25)',
    gold: 'rgba(255,215,0,0.18)',
    night: 'rgba(0,102,255,0.18)',
  }[variant] || 'rgba(0,102,255,0.25)';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {/* Floating glow orbs */}
      <FloatingOrb size={250} x={-80} y={height * 0.1} color={orbColor} delay={0} />
      <FloatingOrb size={180} x={width - 100} y={height * 0.4} color={orbColor} delay={1500} />
      <FloatingOrb size={300} x={-120} y={height * 0.7} color={orbColor} delay={3000} />
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  orb: {
    position: 'absolute',
  },
});

export default GlassBackground;
