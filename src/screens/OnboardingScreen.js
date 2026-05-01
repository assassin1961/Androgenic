import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay,
  withSequence, withRepeat, Easing, runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SHADOWS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  x: Math.random() * width,
  y: Math.random() * height,
  size: 2 + Math.random() * 4,
  speed: 3000 + Math.random() * 4000,
  delay: Math.random() * 2000,
}));

const Particle = ({ config }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: config.speed, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: config.speed, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: 0.1 + progress.value * 0.4,
    transform: [{ translateY: progress.value * -40 }],
  }));

  return (
    <Animated.View
      style={[styles.particle, style, {
        left: config.x, top: config.y, width: config.size, height: config.size, borderRadius: config.size / 2,
      }]}
    />
  );
};

const ExpandingRing = ({ delay, borderColor, initialOpacity }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withTiming(4, { duration: 900, easing: Easing.out(Easing.cubic) }));
    opacity.value = withDelay(delay, withSequence(
      withTiming(initialOpacity, { duration: 50 }),
      withTiming(0, { duration: 850 }),
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.ring, { borderColor }, style]} />;
};

const OnboardingScreen = ({ onFinish }) => {
  const logoScale = useSharedValue(0.2);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(30);
  const scanLineOpacity = useSharedValue(0);
  const scanLineY = useSharedValue(-50);
  const featuresOpacity = useSharedValue(0);
  const featuresY = useSharedValue(40);
  const wholeOpacity = useSharedValue(1);
  const glowPulse = useSharedValue(0.5);

  useEffect(() => {
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 }),
      ),
      -1,
      false,
    );

    // Logo entrance
    logoScale.value = withSpring(1, { damping: 5, stiffness: 80 });
    logoOpacity.value = withTiming(1, { duration: 500 });

    // Tagline after logo (1000ms)
    taglineOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    taglineY.value = withDelay(1000, withSpring(0, { damping: 8, stiffness: 100 }));

    // Scan line (1500ms)
    scanLineOpacity.value = withDelay(1500, withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 500 }),
      withTiming(0, { duration: 200 }),
    ));
    scanLineY.value = withDelay(1500, withTiming(60, { duration: 700, easing: Easing.inOut(Easing.ease) }));

    // Features (2200ms)
    featuresOpacity.value = withDelay(2200, withTiming(1, { duration: 500 }));
    featuresY.value = withDelay(2200, withSpring(0, { damping: 7, stiffness: 100 }));

    // Fade out and finish (3400ms)
    wholeOpacity.value = withDelay(3400, withTiming(0, { duration: 500 }));

    const timer = setTimeout(() => onFinish(), 3900);
    return () => clearTimeout(timer);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ opacity: wholeOpacity.value }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowPulse.value }));
  const logoContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));
  const logoTextStyle = useAnimatedStyle(() => ({ opacity: logoOpacity.value }));
  const scanStyle = useAnimatedStyle(() => ({
    opacity: scanLineOpacity.value,
    transform: [{ translateY: scanLineY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));
  const featuresStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
    transform: [{ translateY: featuresY.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient colors={['#000000', '#060612', '#000000']} style={styles.bg}>
        {PARTICLES.map((p, i) => (
          <Particle key={i} config={p} />
        ))}
        <Animated.View style={[styles.bgGlow, glowStyle]} />
        <ExpandingRing delay={500} borderColor={COLORS.accent} initialOpacity={0.9} />
        <ExpandingRing delay={650} borderColor={COLORS.accentLight} initialOpacity={0.7} />
        <ExpandingRing delay={800} borderColor="rgba(0,102,255,0.4)" initialOpacity={0.5} />
        <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
          <LinearGradient colors={GRADIENTS.accent} style={[styles.logoCircle, SHADOWS.accentGlow]}>
            <Text style={styles.logoIcon}>A</Text>
          </LinearGradient>
        </Animated.View>
        <Animated.Text style={[styles.logoText, logoTextStyle]}>ANDROGENIC</Animated.Text>
        <Animated.View style={[styles.scanLine, scanStyle]}>
          <LinearGradient
            colors={['rgba(0,102,255,0)', COLORS.accent, 'rgba(0,102,255,0)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.scanLineGradient}
          />
        </Animated.View>
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          AI Face Analysis & Looksmaxxing
        </Animated.Text>
        <Animated.View style={[styles.features, featuresStyle]}>
          {['Face Analysis', 'Score Tracking', 'Looksmax Tips', 'AI Powered'].map((feat, i) => (
            <View key={i} style={styles.featurePill}>
              <Text style={styles.featurePillText}>{feat}</Text>
            </View>
          ))}
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  bg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  particle: { position: 'absolute', backgroundColor: COLORS.accentLight },
  bgGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.accentGlow },
  ring: { position: 'absolute', width: 70, height: 70, borderRadius: 35, borderWidth: 2 },
  logoContainer: { marginBottom: 14 },
  logoCircle: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center' },
  logoIcon: { fontSize: 44, fontWeight: '900', color: '#fff' },
  logoText: { fontSize: 30, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 5, marginBottom: 4 },
  scanLine: { width: 220, height: 3, marginVertical: 8 },
  scanLineGradient: { flex: 1, borderRadius: 2 },
  tagline: { fontSize: 14, color: COLORS.accentLight, fontWeight: '600', letterSpacing: 1.5, marginBottom: 36 },
  features: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: 30 },
  featurePill: {
    backgroundColor: 'rgba(0,102,255,0.12)', borderWidth: 1,
    borderColor: 'rgba(0,102,255,0.25)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  featurePillText: { color: COLORS.accentLight, fontSize: 12, fontWeight: '600' },
});

export default OnboardingScreen;
