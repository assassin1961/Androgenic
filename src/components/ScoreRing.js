import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { COLORS, getScoreColor, getScoreLabel, getScoreGradient } from '../utils/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ScoreRing = ({ score, size = 120, strokeWidth = 8, label, showLabel = true, animated = true, delay = 0 }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score);
  const gradient = getScoreGradient(score);

  useEffect(() => {
    if (animated) {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animValue, {
            toValue: score / 100,
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      animValue.setValue(score / 100);
      scaleAnim.setValue(1);
      glowOpacity.setValue(1);
    }
  }, [score]);

  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const displayScore = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, score],
  });

  const glowSize = size + 20;

  return (
    <Animated.View style={[styles.container, { width: size, height: size, transform: [{ scale: scaleAnim }] }]}>
      {/* Glow effect behind the ring */}
      <Animated.View
        style={[styles.glow, {
          width: glowSize,
          height: glowSize,
          borderRadius: glowSize / 2,
          backgroundColor: color,
          opacity: glowOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.12],
          }),
        }]}
      />
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <SvgGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={gradient[0]} />
            <Stop offset="1" stopColor={gradient[1]} />
          </SvgGradient>
        </Defs>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.bgCard}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Track circle (subtle) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color + '15'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Score circle with gradient */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGrad)"
          strokeWidth={strokeWidth + 1}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.innerContent}>
        <AnimatedScore value={displayScore} color={color} size={size} />
        {showLabel && (
          <Text style={[styles.label, { color, fontSize: size > 80 ? 11 : 9 }]}>
            {label || getScoreLabel(score)}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

// Separate component for animated number
const AnimatedScore = ({ value, color, size }) => {
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    const id = value.addListener(({ value: v }) => {
      setDisplay(Math.round(v));
    });
    return () => value.removeListener(id);
  }, [value]);

  return (
    <Text style={[styles.score, { color, fontSize: size > 100 ? 32 : size > 60 ? 20 : 14 }]}>
      {display}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
  },
  svg: {
    position: 'absolute',
  },
  innerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    fontWeight: '900',
    letterSpacing: -1,
  },
  label: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
});

export default ScoreRing;
