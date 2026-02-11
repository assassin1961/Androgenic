import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/theme';
import { analyzeFace, getAnalysisSteps } from '../utils/faceAnalysis';
import { useScan } from '../utils/pro';
import { saveToHistory } from '../utils/history';

const AnalyzingScreen = ({ route, navigation }) => {
  const { imageUri } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const steps = getAnalysisSteps();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const gridOpacity = useRef(new Animated.Value(0)).current;
  const scanBeamY = useRef(new Animated.Value(-100)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spin animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Grid overlay fades in
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(gridOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Scan beam animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanBeamY, { toValue: 100, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scanBeamY, { toValue: -100, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Landmark dots
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotsOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotsOpacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    // Progress through steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 500);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Run analysis
    const runAnalysis = async () => {
      try {
        const scores = await analyzeFace(imageUri);
        await useScan();
        await saveToHistory(scores, imageUri);

        // Wait for animations to finish
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

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Photo with scanning effect */}
      <View style={styles.photoContainer}>
        <Animated.View style={[styles.photoWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <Image source={{ uri: imageUri }} style={styles.photo} />
          {/* Grid overlay */}
          <Animated.View style={[styles.gridOverlay, { opacity: gridOpacity }]}>
            <View style={styles.gridLineH1} />
            <View style={styles.gridLineH2} />
            <View style={styles.gridLineV1} />
            <View style={styles.gridLineV2} />
          </Animated.View>
          {/* Scan beam */}
          <Animated.View style={[styles.scanBeam, { transform: [{ translateY: scanBeamY }] }]} />
          {/* Landmark dots */}
          <Animated.View style={[styles.landmarkDots, { opacity: dotsOpacity }]}>
            {[
              { top: '25%', left: '35%' }, { top: '25%', left: '65%' },
              { top: '35%', left: '30%' }, { top: '35%', left: '70%' },
              { top: '50%', left: '50%' }, { top: '60%', left: '40%' },
              { top: '60%', left: '60%' }, { top: '72%', left: '45%' },
              { top: '72%', left: '55%' }, { top: '80%', left: '50%' },
            ].map((pos, i) => (
              <View key={i} style={[styles.dot, { top: pos.top, left: pos.left }]} />
            ))}
          </Animated.View>
          {/* Spinning ring */}
          <Animated.View style={[styles.scanRing, { transform: [{ rotate: spin }] }]}>
            <View style={styles.scanDot} />
          </Animated.View>
        </Animated.View>
      </View>

      {/* Analysis Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.analyzingText}>Analyzing Face</Text>
        <Text style={styles.stepText}>{steps[currentStep]}</Text>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        {/* Steps indicators */}
        <View style={styles.stepsContainer}>
          {steps.map((step, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i <= currentStep && styles.stepDotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  photoContainer: {
    marginBottom: 48,
  },
  photoWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: COLORS.accent,
  },
  gridOverlay: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
  },
  gridLineH1: { position: 'absolute', top: '33%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(108,92,231,0.3)' },
  gridLineH2: { position: 'absolute', top: '66%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(108,92,231,0.3)' },
  gridLineV1: { position: 'absolute', left: '33%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(108,92,231,0.3)' },
  gridLineV2: { position: 'absolute', left: '66%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(108,92,231,0.3)' },
  scanBeam: {
    position: 'absolute',
    width: 180,
    height: 3,
    backgroundColor: COLORS.accent,
    opacity: 0.6,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  landmarkDots: {
    position: 'absolute',
    width: 180,
    height: 180,
  },
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.scoreHigh,
    marginLeft: -2,
    marginTop: -2,
  },
  scanRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: COLORS.accent,
    borderRightColor: COLORS.accentLight,
  },
  scanDot: {
    position: 'absolute',
    top: -3,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  statusContainer: {
    alignItems: 'center',
    width: '100%',
  },
  analyzingText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.accent,
    marginBottom: 24,
    fontWeight: '500',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: COLORS.bgCard,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.bgCard,
  },
  stepDotActive: {
    backgroundColor: COLORS.accent,
  },
});

export default AnalyzingScreen;
