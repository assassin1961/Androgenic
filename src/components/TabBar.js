import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

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

  useEffect(() => {
    const idx = tabs.findIndex((t) => t.name === activeTab);
    Animated.spring(indicatorX, {
      toValue: idx * TAB_WIDTH + (TAB_WIDTH - 40) / 2,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // Bounce the active tab icon
    scaleAnims.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === idx ? 1.15 : 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });
  }, [activeTab]);

  return (
    <View style={styles.container}>
      {/* Animated indicator */}
      <Animated.View style={[styles.indicator, { transform: [{ translateX: indicatorX }] }]} />

      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => onTabPress(tab.name)}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnims[index] }] }}>
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={22}
                color={isActive ? COLORS.accent : COLORS.textMuted}
              />
            </Animated.View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 20,
    paddingTop: 8,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 3,
    backgroundColor: COLORS.accent,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 3,
  },
  labelActive: {
    color: COLORS.accent,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginTop: 3,
  },
});

export default TabBar;
