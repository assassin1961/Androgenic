import React, { useEffect, memo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BLUR } from '../utils/theme';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

const SPRING_CONFIG = { damping: 15, stiffness: 150, mass: 0.5 };

const tabs = [
  { name: 'Home', icon: 'scan-outline', iconActive: 'scan', label: 'Scan' },
  { name: 'Routine', icon: 'today-outline', iconActive: 'today', label: 'Routine' },
  { name: 'Compare', icon: 'git-compare-outline', iconActive: 'git-compare', label: 'Compare' },
  { name: 'Leaderboard', icon: 'trophy-outline', iconActive: 'trophy', label: 'Ranks' },
  { name: 'Profile', icon: 'person-outline', iconActive: 'person', label: 'Profile' },
];

const TabItem = memo(({ tab, isActive, onPress, index }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.12 : 1, SPRING_CONFIG);
  }, [isActive]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(tab.name);
  };

  return (
    <Pressable style={styles.tab} onPress={handlePress}>
      <Animated.View style={[styles.iconWrapper, isActive && styles.iconWrapperActive, iconStyle]}>
        <Ionicons
          name={isActive ? tab.iconActive : tab.icon}
          size={20}
          color={isActive ? COLORS.accent : COLORS.textMuted}
        />
      </Animated.View>
      <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
    </Pressable>
  );
});

const TabBar = ({ activeTab, onTabPress }) => {
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    const idx = tabs.findIndex((t) => t.name === activeTab);
    indicatorX.value = withSpring(idx * TAB_WIDTH + (TAB_WIDTH - 40) / 2, SPRING_CONFIG);
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View style={styles.wrapper}>
      {Platform.OS !== 'web' && (
        <BlurView intensity={BLUR.heavy} tint="dark" style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient
        colors={['rgba(0,102,255,0.04)', 'rgba(0,0,0,0.6)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.container}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        {tabs.map((tab, index) => (
          <TabItem
            key={tab.name}
            tab={tab}
            index={index}
            isActive={activeTab === tab.name}
            onPress={onTabPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  container: {
    flexDirection: 'row',
    paddingBottom: 22,
    paddingTop: 8,
    position: 'relative',
  },
  indicator: {
    position: 'absolute', top: 0, width: 40, height: 2.5,
    backgroundColor: COLORS.accentNeon, borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    shadowColor: COLORS.accentNeon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  iconWrapper: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iconWrapperActive: {
    backgroundColor: 'rgba(0,102,255,0.18)',
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  label: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted, marginTop: 2 },
  labelActive: { color: COLORS.accentNeon, fontWeight: '800' },
});

export default memo(TabBar);
