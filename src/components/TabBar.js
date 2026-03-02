import React, { useEffect, memo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

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
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', backgroundColor: '#050508',
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingBottom: 22, paddingTop: 6, position: 'relative',
  },
  indicator: {
    position: 'absolute', top: 0, width: 40, height: 2.5,
    backgroundColor: COLORS.accent, borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  iconWrapper: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iconWrapperActive: { backgroundColor: 'rgba(0,102,255,0.12)' },
  label: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted, marginTop: 2 },
  labelActive: { color: COLORS.accent, fontWeight: '700' },
});

export default memo(TabBar);
