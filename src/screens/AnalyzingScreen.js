import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { COLORS } from '../utils/theme';
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
