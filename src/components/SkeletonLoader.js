import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { COLORS } from '../utils/theme';

const { width } = Dimensions.get('window');

// Shimmer effect skeleton loader using Reanimated 3 worklets
const SkeletonLoader = ({ w = '100%', h = 14, borderRadius = 7, style }) => {
  const shimmer = useSharedValue(0.3);

  React.useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: w,
          height: h,
          borderRadius,
          backgroundColor: COLORS.bgCard,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

// Full card skeleton - for places like HomeScreen loading
export const CardSkeleton = ({ style }) => (
  <View style={[styles.card, style]}>
    <View style={styles.cardRow}>
      <SkeletonLoader w={40} h={40} borderRadius={12} />
      <View style={styles.cardText}>
        <SkeletonLoader w="60%" h={12} />
        <SkeletonLoader w="40%" h={10} style={{ marginTop: 6 }} />
      </View>
    </View>
    <SkeletonLoader w="100%" h={8} style={{ marginTop: 12 }} />
    <SkeletonLoader w="75%" h={8} style={{ marginTop: 6 }} />
  </View>
);

// Row of small skeleton boxes - for quick actions
export const RowSkeleton = ({ count = 4, style }) => (
  <View style={[styles.row, style]}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={styles.rowItem}>
        <SkeletonLoader w={30} h={30} borderRadius={9} />
        <SkeletonLoader w={36} h={8} style={{ marginTop: 6 }} />
      </View>
    ))}
  </View>
);

// Grid skeleton - for tools grid
export const GridSkeleton = ({ count = 12, style }) => (
  <View style={[styles.grid, style]}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={styles.gridItem}>
        <SkeletonLoader w={32} h={32} borderRadius={10} />
        <SkeletonLoader w={40} h={8} style={{ marginTop: 6 }} />
      </View>
    ))}
  </View>
);

// Post skeleton for forum
export const PostSkeleton = ({ style }) => (
  <View style={[styles.postCard, style]}>
    <View style={styles.postHeader}>
      <SkeletonLoader w={36} h={36} borderRadius={18} />
      <View style={styles.postHeaderText}>
        <SkeletonLoader w={80} h={12} />
        <SkeletonLoader w={50} h={8} style={{ marginTop: 4 }} />
      </View>
      <SkeletonLoader w={60} h={20} borderRadius={10} />
    </View>
    <SkeletonLoader w="85%" h={14} style={{ marginTop: 12 }} />
    <SkeletonLoader w="100%" h={10} style={{ marginTop: 8 }} />
    <SkeletonLoader w="60%" h={10} style={{ marginTop: 4 }} />
    <View style={styles.postActions}>
      <SkeletonLoader w={50} h={20} borderRadius={10} />
      <SkeletonLoader w={50} h={20} borderRadius={10} />
      <SkeletonLoader w={40} h={20} borderRadius={10} />
    </View>
  </View>
);

// Chat bubble skeleton
export const ChatSkeleton = ({ isUser = false, style }) => (
  <View style={[styles.chatRow, isUser && styles.chatRowUser, style]}>
    {!isUser && <SkeletonLoader w={28} h={28} borderRadius={14} />}
    <View style={[styles.chatBubble, isUser && styles.chatBubbleUser]}>
      <SkeletonLoader w={isUser ? 120 : 180} h={10} />
      <SkeletonLoader w={isUser ? 80 : 140} h={10} style={{ marginTop: 6 }} />
    </View>
  </View>
);

const COL3 = (width - 56) / 3;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardText: { flex: 1 },
  row: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  rowItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  gridItem: {
    width: COL3,
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  postCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postHeaderText: { flex: 1 },
  postActions: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  chatRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12, paddingHorizontal: 16 },
  chatRowUser: { justifyContent: 'flex-end' },
  chatBubble: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 12 },
  chatBubbleUser: { backgroundColor: '#0066ff20' },
});

export default SkeletonLoader;
