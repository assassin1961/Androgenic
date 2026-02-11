import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, getScoreColor, getScoreLabel } from '../utils/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ScoreRing = ({ score, size = 120, strokeWidth = 8, label, showLabel = true, animated = true, delay = 0 }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score);

  useEffect(() => {
    if (animated) {
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animValue, {
          toValue: score / 100,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      animValue.setValue(score / 100);
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

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.bgCard}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Score circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
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
    </View>
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
  svg: {
    position: 'absolute',
  },
  innerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    fontWeight: '900',
  },
  label: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
});

export default ScoreRing;
