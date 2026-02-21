import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
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

const OnboardingScreen = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0.2)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(30)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0.9)).current;
  const ring2Scale = useRef(new Animated.Value(0)).current;
  const ring2Opacity = useRef(new Animated.Value(0.7)).current;
  const ring3Scale = useRef(new Animated.Value(0)).current;
  const ring3Opacity = useRef(new Animated.Value(0.5)).current;
  const scanLineY = useRef(new Animated.Value(-50)).current;
  const scanLineOpacity = useRef(new Animated.Value(0)).current;
  const featuresOpacity = useRef(new Animated.Value(0)).current;
  const featuresTranslate = useRef(new Animated.Value(40)).current;
  const wholeOpacity = useRef(new Animated.Value(1)).current;
  const glowPulse = useRef(new Animated.Value(0.5)).current;
  const particleAnims = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    particleAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(PARTICLES[i].delay),
          Animated.timing(anim, { toValue: 1, duration: PARTICLES[i].speed, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: PARTICLES[i].speed, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 0.8, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ringScale, { toValue: 4, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 0, duration: 900, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(150),
          Animated.parallel([
            Animated.timing(ring2Scale, { toValue: 4, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(ring2Opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          ]),
        ]),
        Animated.sequence([
          Animated.delay(300),
          Animated.parallel([
            Animated.timing(ring3Scale, { toValue: 4, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(ring3Opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          ]),
        ]),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(taglineTranslate, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(scanLineOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(scanLineY, { toValue: 60, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
      Animated.timing(scanLineOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(featuresOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(featuresTranslate, { toValue: 0, friction: 7, useNativeDriver: true }),
      ]),
      Animated.delay(700),
      Animated.timing(wholeOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: wholeOpacity }]}>
      <LinearGradient colors={['#000000', '#060612', '#000000']} style={styles.bg}>
        {PARTICLES.map((p, i) => (
          <Animated.View
            key={i}
            style={[styles.particle, {
              left: p.x, top: p.y, width: p.size, height: p.size, borderRadius: p.size / 2,
              opacity: particleAnims[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.1, 0.5, 0.1] }),
              transform: [{ translateY: particleAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) }],
            }]}
          />
        ))}
        <Animated.View style={[styles.bgGlow, { opacity: glowPulse }]} />
        <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
        <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ring2Scale }], opacity: ring2Opacity }]} />
        <Animated.View style={[styles.ring, styles.ring3, { transform: [{ scale: ring3Scale }], opacity: ring3Opacity }]} />
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
          <LinearGradient colors={GRADIENTS.accent} style={[styles.logoCircle, SHADOWS.accentGlow]}>
            <Text style={styles.logoIcon}>A</Text>
          </LinearGradient>
        </Animated.View>
        <Animated.Text style={[styles.logoText, { opacity: logoOpacity }]}>ANDROGENIC</Animated.Text>
        <Animated.View style={[styles.scanLine, { opacity: scanLineOpacity, transform: [{ translateY: scanLineY }] }]}>
          <LinearGradient
            colors={['rgba(0,102,255,0)', COLORS.accent, 'rgba(0,102,255,0)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.scanLineGradient}
          />
        </Animated.View>
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity, transform: [{ translateY: taglineTranslate }] }]}>
          AI Face Analysis & Looksmaxxing
        </Animated.Text>
        <Animated.View style={[styles.features, { opacity: featuresOpacity, transform: [{ translateY: featuresTranslate }] }]}>
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
  ring: { position: 'absolute', width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: COLORS.accent },
  ring2: { borderColor: COLORS.accentLight },
  ring3: { borderColor: 'rgba(0,102,255,0.4)' },
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
