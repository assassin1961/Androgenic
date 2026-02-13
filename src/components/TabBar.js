import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../utils/theme';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

const tabs = [
  { name: 'Home', icon: 'scan-outline', iconActive: 'scan', label: 'Scan' },
  { name: 'Routine', icon: 'today-outline', iconActive: 'today', label: 'Routine' },
  { name: 'Compare', icon: 'git-compare-outline', iconActive: 'git-compare', label: 'Compare' },
  { name: 'Leaderboard', icon: 'trophy-outline', iconActive: 'trophy', label: 'Ranks' },
  { name: 'Profile', icon: 'person-outline', iconActive: 'person', label: 'Profile' },
];

const TabBar = ({ activeTab, onTabPress }) => {
  const indicatorX = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(tabs.map(() => new Animated.Value(1))).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const idx = tabs.findIndex((t) => t.name === activeTab);
    Animated.spring(indicatorX, {
      toValue: idx * TAB_WIDTH + (TAB_WIDTH - 40) / 2,
      friction: 7, tension: 80, useNativeDriver: true,
    }).start();

    scaleAnims.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === idx ? 1.2 : 1, friction: 5, useNativeDriver: true,
      }).start();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [activeTab]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowLine, { transform: [{ translateX: indicatorX }], opacity: glowOpacity }]} />
      <Animated.View style={[styles.indicator, { transform: [{ translateX: indicatorX }] }]} />
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity key={tab.name} style={styles.tab} onPress={() => onTabPress(tab.name)} activeOpacity={0.7}>
            <Animated.View style={[styles.iconWrapper, isActive && styles.iconWrapperActive, { transform: [{ scale: scaleAnims[index] }] }]}>
              <Ionicons name={isActive ? tab.iconActive : tab.icon} size={20} color={isActive ? COLORS.accent : COLORS.textMuted} />
            </Animated.View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', backgroundColor: COLORS.bgSecondary,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingBottom: 22, paddingTop: 6, position: 'relative',
  },
  glowLine: {
    position: 'absolute', top: -4, width: 40, height: 8,
    borderRadius: 4, backgroundColor: COLORS.accentGlow,
  },
  indicator: {
    position: 'absolute', top: 0, width: 40, height: 3,
    backgroundColor: COLORS.accent, borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2, ...SHADOWS.glow,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  iconWrapper: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iconWrapperActive: { backgroundColor: COLORS.accentGlow },
  label: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted, marginTop: 2 },
  labelActive: { color: COLORS.accent, fontWeight: '700' },
});

export default TabBar;
