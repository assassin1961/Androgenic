import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SHADOWS } from '../utils/theme';
import { analyzeFace, getAnalysisSteps } from '../utils/faceAnalysis';
import { useScan } from '../utils/pro';
import { saveToHistory } from '../utils/history';

const { width } = Dimensions.get('window');

const AnalyzingScreen = ({ route, navigation }) => {
  const { imageUri } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const steps = getAnalysisSteps();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spin2Anim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const gridOpacity = useRef(new Animated.Value(0)).current;
  const scanBeamY = useRef(new Animated.Value(-120)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const cornerOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;
  const statusFade = useRef(new Animated.Value(0)).current;
  const stepAnims = useRef(steps.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Outer ring spin
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Inner ring counter-spin
    Animated.loop(
      Animated.timing(spin2Anim, { toValue: 1, duration: 5000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Photo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 0.7, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.3, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Corner brackets fade in
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(cornerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Grid overlay
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(gridOpacity, { toValue: 0.7, duration: 600, useNativeDriver: true }),
    ]).start();

    // Scan beam
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanBeamY, { toValue: 120, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scanBeamY, { toValue: -120, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Landmark dots blink
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotsOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(dotsOpacity, { toValue: 0.2, duration: 500, useNativeDriver: true }),
      ])
    ).start();

    // Status text fade in
    Animated.timing(statusFade, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }).start();

    // Progress through steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 500);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1, duration: 3500, easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();

    // Run analysis
    const runAnalysis = async () => {
      try {
        const scores = await analyzeFace(imageUri);
        await useScan();
        await saveToHistory(scores, imageUri);
        setTimeout(() => {
          clearInterval(stepInterval);
          navigation.replace('Results', { scores, imageUri });
        }, 3800);
      } catch (err) {
        console.error('Analysis error:', err);
        clearInterval(stepInterval);
        navigation.goBack();
      }
    };

    runAnalysis();
    return () => clearInterval(stepInterval);
  }, []);

  // Animate step checkmarks
  useEffect(() => {
    if (currentStep < stepAnims.length) {
      Animated.spring(stepAnims[currentStep], {
        toValue: 1, friction: 6, useNativeDriver: true,
      }).start();
    }
  }, [currentStep]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spin2 = spin2Anim.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.nightSky} style={styles.bg}>
        {/* Photo with scanning effect */}
        <View style={styles.photoContainer}>
          {/* Background glow */}
          <Animated.View style={[styles.bgGlow, { opacity: glowPulse }]} />

          {/* Outer spinning ring */}
          <Animated.View style={[styles.scanRing, { transform: [{ rotate: spin }] }]}>
            <View style={styles.ringDot1} />
            <View style={styles.ringDot2} />
          </Animated.View>

          {/* Inner counter-spin ring */}
          <Animated.View style={[styles.scanRingInner, { transform: [{ rotate: spin2 }] }]}>
            <View style={styles.ringDotInner} />
          </Animated.View>

          {/* Photo */}
          <Animated.View style={[styles.photoWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <Image source={{ uri: imageUri }} style={styles.photo} />

            {/* Corner brackets */}
            <Animated.View style={[styles.corners, { opacity: cornerOpacity }]}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </Animated.View>

            {/* Grid overlay */}
            <Animated.View style={[styles.gridOverlay, { opacity: gridOpacity }]}>
              <View style={styles.gridLineH1} />
              <View style={styles.gridLineH2} />
              <View style={styles.gridLineV1} />
              <View style={styles.gridLineV2} />
            </Animated.View>

            {/* Scan beam */}
            <Animated.View style={[styles.scanBeam, { transform: [{ translateY: scanBeamY }] }]}>
              <LinearGradient
                colors={['rgba(124,108,240,0)', 'rgba(124,108,240,0.6)', 'rgba(124,108,240,0)']}
                style={styles.scanBeamGradient}
              />
            </Animated.View>

            {/* Landmark dots */}
            <Animated.View style={[styles.landmarkDots, { opacity: dotsOpacity }]}>
              {[
                { top: '22%', left: '33%' }, { top: '22%', left: '67%' },
                { top: '35%', left: '28%' }, { top: '35%', left: '72%' },
                { top: '48%', left: '50%' }, { top: '58%', left: '38%' },
                { top: '58%', left: '62%' }, { top: '70%', left: '43%' },
                { top: '70%', left: '57%' }, { top: '80%', left: '50%' },
              ].map((pos, i) => (
                <View key={i} style={[styles.dot, { top: pos.top, left: pos.left }]}>
                  <View style={styles.dotInner} />
                </View>
              ))}
            </Animated.View>
          </Animated.View>
        </View>

        {/* Analysis Status */}
        <Animated.View style={[styles.statusContainer, { opacity: statusFade }]}>
          <Text style={styles.analyzingText}>Analyzing Face</Text>
          <Text style={styles.stepText}>{steps[currentStep]}</Text>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
              <LinearGradient
                colors={GRADIENTS.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressGradient}
              />
            </Animated.View>
          </View>

          {/* Steps with checkmarks */}
          <View style={styles.stepsContainer}>
            {steps.map((step, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: i <= currentStep ? COLORS.accent : COLORS.bgCard,
                    transform: [{
                      scale: stepAnims[i] ? stepAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.3],
                      }) : 1,
                    }],
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  photoContainer: { marginBottom: 48, justifyContent: 'center', alignItems: 'center' },
  bgGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.accentGlow,
  },
  photoWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  corners: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.accent,
  },
  cornerTL: { top: 20, left: 20, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 20, right: 20, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 20, left: 20, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 20, right: 20, borderBottomWidth: 2, borderRightWidth: 2 },
  gridOverlay: { position: 'absolute', width: 200, height: 200, borderRadius: 100, overflow: 'hidden' },
  gridLineH1: { position: 'absolute', top: '33%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(124,108,240,0.2)' },
  gridLineH2: { position: 'absolute', top: '66%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(124,108,240,0.2)' },
  gridLineV1: { position: 'absolute', left: '33%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(124,108,240,0.2)' },
  gridLineV2: { position: 'absolute', left: '66%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(124,108,240,0.2)' },
  scanBeam: { position: 'absolute', width: 200, height: 40, overflow: 'hidden' },
  scanBeamGradient: { width: '100%', height: '100%' },
  landmarkDots: { position: 'absolute', width: 200, height: 200 },
  dot: {
    position: 'absolute', width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(0,230,118,0.3)', marginLeft: -4, marginTop: -4,
    justifyContent: 'center', alignItems: 'center',
  },
  dotInner: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.scoreHigh },
  scanRing: {
    position: 'absolute', width: 230, height: 230, borderRadius: 115,
    borderWidth: 2, borderColor: 'transparent',
    borderTopColor: COLORS.accent, borderRightColor: COLORS.accentLight,
  },
  ringDot1: {
    position: 'absolute', top: -4, left: '50%', marginLeft: -4,
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent,
    ...SHADOWS.glow,
  },
  ringDot2: {
    position: 'absolute', bottom: -4, left: '50%', marginLeft: -3,
    width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accentLight,
  },
  scanRingInner: {
    position: 'absolute', width: 216, height: 216, borderRadius: 108,
    borderWidth: 1, borderColor: 'transparent',
    borderBottomColor: 'rgba(124,108,240,0.3)', borderLeftColor: 'rgba(168,154,250,0.2)',
  },
  ringDotInner: {
    position: 'absolute', right: -3, top: '50%', marginTop: -3,
    width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accentLight,
  },
  statusContainer: { alignItems: 'center', width: '100%' },
  analyzingText: {
    fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6, letterSpacing: 0.5,
  },
  stepText: {
    fontSize: 14, color: COLORS.accentLight, marginBottom: 24, fontWeight: '500',
  },
  progressBar: {
    width: '80%', height: 5, backgroundColor: COLORS.bgCard,
    borderRadius: 3, overflow: 'hidden', marginBottom: 20,
  },
  progressFill: { height: '100%', borderRadius: 3, overflow: 'hidden' },
  progressGradient: { flex: 1 },
  stepsContainer: { flexDirection: 'row', gap: 6 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
});

export default AnalyzingScreen;
