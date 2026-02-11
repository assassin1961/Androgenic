import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(20)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0.8)).current;
  const ring2Scale = useRef(new Animated.Value(0)).current;
  const ring2Opacity = useRef(new Animated.Value(0.6)).current;
  const scanLineY = useRef(new Animated.Value(-50)).current;
  const scanLineOpacity = useRef(new Animated.Value(0)).current;
  const featuresOpacity = useRef(new Animated.Value(0)).current;
  const featuresTranslate = useRef(new Animated.Value(30)).current;
  const wholeOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // 1. Logo appears with scale bounce
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // 2. Expanding rings
      Animated.parallel([
        Animated.timing(ringScale, { toValue: 3, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(ring2Scale, { toValue: 3, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(ring2Opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
          ]),
        ]),
      ]),
      // 3. Tagline slides in
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(taglineTranslate, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]),
      // 4. Scan line animation
      Animated.parallel([
        Animated.timing(scanLineOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(scanLineY, { toValue: 60, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
      Animated.timing(scanLineOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      // 5. Features fade in
      Animated.parallel([
        Animated.timing(featuresOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(featuresTranslate, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]),
      // 6. Hold then fade out
      Animated.delay(800),
      Animated.timing(wholeOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      onFinish();
    });
  }, []);

  const features = ['Face Analysis', 'Score Tracking', 'Looksmax Tips', 'AI Powered'];

  return (
    <Animated.View style={[styles.container, { opacity: wholeOpacity }]}>
      <LinearGradient colors={['#0a0a0a', '#111118', '#0a0a0a']} style={styles.bg}>
        {/* Expanding rings */}
        <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
        <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ring2Scale }], opacity: ring2Opacity }]} />

        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
          <LinearGradient colors={GRADIENTS.accent} style={styles.logoCircle}>
            <Text style={styles.logoIcon}>A</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.Text style={[styles.logoText, { opacity: logoOpacity }]}>
          ANDROGENIC
        </Animated.Text>

        {/* Scan line */}
        <Animated.View style={[styles.scanLine, { opacity: scanLineOpacity, transform: [{ translateY: scanLineY }] }]} />

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity, transform: [{ translateY: taglineTranslate }] }]}>
          AI Face Analysis & Looksmaxxing
        </Animated.Text>

        {/* Feature pills */}
        <Animated.View style={[styles.features, { opacity: featuresOpacity, transform: [{ translateY: featuresTranslate }] }]}>
          {features.map((feat, i) => (
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
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  ring2: {
    borderColor: COLORS.accentLight,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 4,
    marginBottom: 4,
  },
  scanLine: {
    width: 200,
    height: 2,
    backgroundColor: COLORS.accent,
    marginVertical: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.accentLight,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 32,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  featurePill: {
    backgroundColor: 'rgba(108,92,231,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(108,92,231,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  featurePillText: {
    color: COLORS.accentLight,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
