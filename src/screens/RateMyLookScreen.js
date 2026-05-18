import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, getScoreColor, getScoreLabel } from '../utils/theme';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

// ─── Storage Keys ────────────────────────────────────────────────────
const STORAGE_KEYS = {
  ratingsGiven: '@rml_ratings_given',
  ratingsReceived: '@rml_ratings_received',
  userPhoto: '@rml_user_photo',
  totalRated: '@rml_total_rated',
  currentIndex: '@rml_current_index',
};

// ─── Mock Profiles ───────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6',
  '#1ABC9C', '#E67E22', '#2980B9', '#C0392B', '#27AE60',
];

const MOCK_PROFILES = [
  { id: '1', initials: 'JM', color: AVATAR_COLORS[0], age: 24, gender: 'M' },
  { id: '2', initials: 'SK', color: AVATAR_COLORS[1], age: 22, gender: 'F' },
  { id: '3', initials: 'RP', color: AVATAR_COLORS[2], age: 27, gender: 'M' },
  { id: '4', initials: 'AT', color: AVATAR_COLORS[3], age: 21, gender: 'F' },
  { id: '5', initials: 'DW', color: AVATAR_COLORS[4], age: 26, gender: 'M' },
  { id: '6', initials: 'LN', color: AVATAR_COLORS[5], age: 23, gender: 'F' },
  { id: '7', initials: 'BC', color: AVATAR_COLORS[6], age: 29, gender: 'M' },
  { id: '8', initials: 'KE', color: AVATAR_COLORS[7], age: 20, gender: 'F' },
  { id: '9', initials: 'VH', color: AVATAR_COLORS[8], age: 25, gender: 'M' },
  { id: '10', initials: 'MR', color: AVATAR_COLORS[9], age: 28, gender: 'F' },
];

// ─── Rating Tiers ────────────────────────────────────────────────────
const RATING_BUTTONS = [
  { emoji: '❌', label: '1-2', range: [1, 2], color: '#FF3B30', bgColor: 'rgba(255,59,48,0.15)' },
  { emoji: '\u{1F44E}', label: '3-4', range: [3, 4], color: '#FF9500', bgColor: 'rgba(255,149,0,0.15)' },
  { emoji: '\u{1F610}', label: '5-6', range: [5, 6], color: '#FFD60A', bgColor: 'rgba(255,214,10,0.15)' },
  { emoji: '\u{1F44D}', label: '7-8', range: [7, 8], color: '#4A90D9', bgColor: 'rgba(74,144,217,0.15)' },
  { emoji: '\u{1F525}', label: '9-10', range: [9, 10], color: '#34C759', bgColor: 'rgba(52,199,89,0.15)' },
];

// ─── Top Leaderboard (mock weekly) ───────────────────────────────────
const WEEKLY_TOP = [
  { rank: 1, initials: '??', score: 9.2, color: '#2C2C2E' },
  { rank: 2, initials: '??', score: 8.8, color: '#2C2C2E' },
  { rank: 3, initials: '??', score: 8.5, color: '#2C2C2E' },
];

// ─── Helper: generate simulated community rating ─────────────────────
const generateCommunityRating = () => {
  const count = Math.floor(Math.random() * 80) + 20;
  const rating = (Math.random() * 4 + 4.5).toFixed(1); // 4.5 - 8.5 range
  return { rating: parseFloat(rating), count };
};

// ─── Photo Card Component ────────────────────────────────────────────
const PhotoCard = ({ profile, animStyle }) => (
  <Animated.View style={[styles.card, animStyle]}>
    <View style={styles.cardInner}>
      {/* Avatar */}
      <View style={[styles.avatarContainer, { backgroundColor: profile.color }]}>
        <Text style={styles.avatarInitials}>{profile.initials}</Text>
      </View>
      {/* Info Below Avatar */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardGenderAge}>
          {profile.gender}, {profile.age}
        </Text>
        <Text style={styles.cardAnonymous}>Anonymous User</Text>
      </View>
    </View>
  </Animated.View>
);

// ─── Main Screen ─────────────────────────────────────────────────────
const RateMyLookScreen = ({ navigation }) => {
  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratingsGiven, setRatingsGiven] = useState([]);
  const [communityRating, setCommunityRating] = useState(null);
  const [totalRatedByOthers, setTotalRatedByOthers] = useState(0);
  const [userPhoto, setUserPhoto] = useState(null);
  const [allRated, setAllRated] = useState(false);

  // Animation values
  const cardTranslateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const nextCardScale = useSharedValue(0.92);
  const nextCardOpacity = useSharedValue(0.5);

  // Load persisted data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedRatings, storedPhoto, storedIndex, storedReceived] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ratingsGiven),
        AsyncStorage.getItem(STORAGE_KEYS.userPhoto),
        AsyncStorage.getItem(STORAGE_KEYS.currentIndex),
        AsyncStorage.getItem(STORAGE_KEYS.ratingsReceived),
      ]);

      if (storedRatings) {
        const parsed = JSON.parse(storedRatings);
        setRatingsGiven(parsed);
      }
      if (storedPhoto) {
        setUserPhoto(storedPhoto);
        // Generate community rating if user has uploaded
        const community = generateCommunityRating();
        setCommunityRating(community);
        setTotalRatedByOthers(community.count);
      }
      if (storedIndex) {
        const idx = parseInt(storedIndex, 10);
        if (idx >= MOCK_PROFILES.length) {
          setAllRated(true);
          setCurrentIndex(MOCK_PROFILES.length - 1);
        } else {
          setCurrentIndex(idx);
        }
      }
      if (storedReceived) {
        const parsed = JSON.parse(storedReceived);
        setTotalRatedByOthers(parsed.count || 0);
        if (parsed.rating) {
          setCommunityRating(parsed);
        }
      }
    } catch (e) {
      // Silently fail
    }
  };

  const saveRating = async (profileId, score) => {
    try {
      const newRating = { profileId, score, timestamp: Date.now() };
      const updated = [...ratingsGiven, newRating];
      setRatingsGiven(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.ratingsGiven, JSON.stringify(updated));

      const nextIdx = currentIndex + 1;
      await AsyncStorage.setItem(STORAGE_KEYS.currentIndex, nextIdx.toString());

      // Simulate receiving a rating back (50% chance each time)
      if (userPhoto && Math.random() > 0.5) {
        const newCount = totalRatedByOthers + 1;
        const newRating2 = communityRating
          ? ((communityRating.rating * communityRating.count + (Math.random() * 3 + 5)) / (communityRating.count + 1))
          : (Math.random() * 3 + 5);
        const newCommunity = {
          rating: parseFloat(newRating2.toFixed(1)),
          count: newCount,
        };
        setCommunityRating(newCommunity);
        setTotalRatedByOthers(newCount);
        await AsyncStorage.setItem(STORAGE_KEYS.ratingsReceived, JSON.stringify(newCommunity));
      }
    } catch (e) {
      // Silently fail
    }
  };

  // Animate card out, then move to next
  const handleRate = useCallback((ratingRange) => {
    if (allRated) return;

    const score = ratingRange[0] + Math.round(Math.random()); // Pick one of the two values
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const currentProfile = MOCK_PROFILES[currentIndex];

    // Animate current card out to left
    cardTranslateX.value = withTiming(-width * 1.2, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    cardOpacity.value = withTiming(0, { duration: 250 });

    // Scale up next card
    nextCardScale.value = withSpring(1, { damping: 15 });
    nextCardOpacity.value = withTiming(1, { duration: 200 });

    // After animation, advance to next
    setTimeout(() => {
      saveRating(currentProfile.id, score);

      const nextIdx = currentIndex + 1;
      if (nextIdx >= MOCK_PROFILES.length) {
        setAllRated(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setCurrentIndex(nextIdx);
      }

      // Reset animation values for next card
      cardTranslateX.value = width;
      cardOpacity.value = 0;

      // Slide new card in from right
      setTimeout(() => {
        cardTranslateX.value = withSpring(0, { damping: 18, stiffness: 120 });
        cardOpacity.value = withTiming(1, { duration: 250 });
        nextCardScale.value = 0.92;
        nextCardOpacity.value = 0.5;
      }, 50);
    }, 320);
  }, [currentIndex, allRated, communityRating, totalRatedByOthers, userPhoto, ratingsGiven]);

  // Animated styles for the current card
  const currentCardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cardTranslateX.value }],
    opacity: cardOpacity.value,
  }));

  // Animated style for the "next" card peeking behind
  const nextCardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextCardScale.value }],
    opacity: nextCardOpacity.value,
  }));

  // Upload photo handler
  const handleUploadPhoto = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const uri = result.assets[0].uri;
        setUserPhoto(uri);
        await AsyncStorage.setItem(STORAGE_KEYS.userPhoto, uri);

        // Generate initial community rating
        const community = generateCommunityRating();
        setCommunityRating(community);
        setTotalRatedByOthers(community.count);
        await AsyncStorage.setItem(STORAGE_KEYS.ratingsReceived, JSON.stringify(community));
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open photo library. Please try again.');
    }
  }, []);

  // Reset all ratings
  const handleResetRatings = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentIndex(0);
    setRatingsGiven([]);
    setAllRated(false);
    cardTranslateX.value = 0;
    cardOpacity.value = 1;
    await AsyncStorage.multiRemove([STORAGE_KEYS.ratingsGiven, STORAGE_KEYS.currentIndex]);
  }, []);

  // Computed stats
  const averageGiven = ratingsGiven.length > 0
    ? (ratingsGiven.reduce((sum, r) => sum + r.score, 0) / ratingsGiven.length).toFixed(1)
    : '0.0';

  const currentProfile = MOCK_PROFILES[currentIndex] || MOCK_PROFILES[MOCK_PROFILES.length - 1];
  const nextProfile = currentIndex + 1 < MOCK_PROFILES.length
    ? MOCK_PROFILES[currentIndex + 1]
    : null;

  return (
    <GlassBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* ─── Header ──────────────────────────────────────────────── */}
        <View style={styles.header}>
          <AnimatedPressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <GlassCard style={styles.backBtnCard} borderRadius={20}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </GlassCard>
          </AnimatedPressable>

          <Text style={styles.headerTitle}>Rate My Look</Text>

          {/* Your rating badge */}
          <View style={styles.headerBadge}>
            {communityRating ? (
              <LinearGradient
                colors={getScoreColor(communityRating.rating) === COLORS.scoreExcellent
                  ? GRADIENTS.scoreExcellent
                  : getScoreColor(communityRating.rating) === COLORS.scoreGood
                    ? GRADIENTS.scoreGood
                    : getScoreColor(communityRating.rating) === COLORS.scoreAverage
                      ? GRADIENTS.scoreAverage
                      : GRADIENTS.scoreBelow}
                style={styles.headerBadgeGrad}
              >
                <Ionicons name="star" size={12} color="#000" />
                <Text style={styles.headerBadgeText}>{communityRating.rating}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.headerBadgePlaceholder}>
                <Ionicons name="star-outline" size={16} color={COLORS.textMuted} />
              </View>
            )}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Photo Card Stack ──────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <View style={styles.cardStack}>
              {/* Next card (behind, peeking) */}
              {!allRated && nextProfile && (
                <Animated.View style={[styles.nextCardWrapper, nextCardAnimStyle]}>
                  <View style={styles.card}>
                    <View style={styles.cardInner}>
                      <View style={[styles.avatarContainer, { backgroundColor: nextProfile.color }]}>
                        <Text style={styles.avatarInitials}>{nextProfile.initials}</Text>
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardGenderAge}>
                          {nextProfile.gender}, {nextProfile.age}
                        </Text>
                        <Text style={styles.cardAnonymous}>Anonymous User</Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Current card (top) */}
              {!allRated ? (
                <PhotoCard
                  profile={currentProfile}
                  animStyle={currentCardAnimStyle}
                />
              ) : (
                <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
                  <View style={styles.allRatedContent}>
                    <Ionicons name="checkmark-circle" size={64} color={COLORS.scoreExcellent} />
                    <Text style={styles.allRatedTitle}>All Caught Up!</Text>
                    <Text style={styles.allRatedSubtitle}>
                      You have rated all available profiles. Check back later for new ones.
                    </Text>
                    <AnimatedPressable onPress={handleResetRatings}>
                      <LinearGradient
                        colors={GRADIENTS.accent}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.resetButton}
                      >
                        <Ionicons name="refresh" size={18} color="#fff" />
                        <Text style={styles.resetButtonText}>Start Over</Text>
                      </LinearGradient>
                    </AnimatedPressable>
                  </View>
                </Animated.View>
              )}
            </View>

            {/* Card Counter */}
            {!allRated && (
              <Text style={styles.cardCounter}>
                {currentIndex + 1} / {MOCK_PROFILES.length}
              </Text>
            )}
          </Animated.View>

          {/* ─── Rating Buttons ────────────────────────────────────── */}
          {!allRated && (
            <Animated.View entering={FadeInDown.duration(500).delay(250)}>
              <View style={styles.ratingRow}>
                {RATING_BUTTONS.map((btn, index) => (
                  <Animated.View
                    key={btn.label}
                    entering={FadeInDown.duration(300).delay(300 + index * 60)}
                  >
                    <AnimatedPressable
                      onPress={() => handleRate(btn.range)}
                      style={styles.ratingBtnPressable}
                    >
                      <View style={[styles.ratingBtn, { backgroundColor: btn.bgColor, borderColor: btn.color }]}>
                        <Text style={styles.ratingEmoji}>{btn.emoji}</Text>
                        <Text style={[styles.ratingLabel, { color: btn.color }]}>{btn.label}</Text>
                      </View>
                    </AnimatedPressable>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* ─── Your Profile Section ─────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(500).delay(400)}>
            <Text style={styles.sectionTitle}>Your Rating</Text>
            <GlassCard variant={communityRating ? 'gold' : 'default'} style={styles.yourRatingCard}>
              {communityRating ? (
                <View style={styles.yourRatingContent}>
                  {/* Star + Score Display */}
                  <View style={styles.yourRatingScoreRow}>
                    <LinearGradient
                      colors={GRADIENTS.gold}
                      style={styles.starIcon}
                    >
                      <Ionicons name="star" size={24} color="#000" />
                    </LinearGradient>
                    <View style={styles.yourRatingTextCol}>
                      <View style={styles.ratingValueRow}>
                        <Text style={styles.yourRatingNumber}>{communityRating.rating}</Text>
                        <Text style={styles.yourRatingMax}> / 10</Text>
                      </View>
                      <Text style={[styles.yourRatingLabel, { color: getScoreColor(communityRating.rating) }]}>
                        {getScoreLabel(communityRating.rating)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.basedOnText}>
                    Based on {communityRating.count} rating{communityRating.count !== 1 ? 's' : ''}
                  </Text>
                  {/* Rating bar visualization */}
                  <View style={styles.ratingBarContainer}>
                    <View style={styles.ratingBarBg}>
                      <LinearGradient
                        colors={
                          communityRating.rating >= 8 ? GRADIENTS.scoreExcellent
                            : communityRating.rating >= 6 ? GRADIENTS.scoreGood
                              : communityRating.rating >= 4 ? GRADIENTS.scoreAverage
                                : GRADIENTS.scoreBelow
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.ratingBarFill, { width: `${communityRating.rating * 10}%` }]}
                      />
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.noRatingContent}>
                  <Ionicons name="star-outline" size={40} color={COLORS.textMuted} />
                  <Text style={styles.noRatingTitle}>No Rating Yet</Text>
                  <Text style={styles.noRatingSubtitle}>
                    Upload your photo to get rated by the community
                  </Text>
                </View>
              )}

              {/* Upload Button */}
              <AnimatedPressable onPress={handleUploadPhoto} style={styles.uploadBtnWrapper}>
                <LinearGradient
                  colors={GRADIENTS.gold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.uploadBtn}
                >
                  <Ionicons name={userPhoto ? 'camera' : 'cloud-upload'} size={18} color="#000" />
                  <Text style={styles.uploadBtnText}>
                    {userPhoto ? 'Change Your Photo' : 'Upload Your Photo'}
                  </Text>
                </LinearGradient>
              </AnimatedPressable>

              {/* Privacy Note */}
              <View style={styles.privacyNote}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.textTertiary} />
                <Text style={styles.privacyText}>
                  Photos are anonymous. No names shown.
                </Text>
              </View>
            </GlassCard>
          </Animated.View>

          {/* ─── Leaderboard Preview ──────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(500).delay(550)}>
            <Text style={styles.sectionTitle}>Top Rated This Week</Text>
            <GlassCard style={styles.leaderboardCard}>
              {WEEKLY_TOP.map((entry, index) => (
                <Animated.View
                  key={entry.rank}
                  entering={FadeInRight.duration(300).delay(600 + index * 80)}
                >
                  <View style={styles.leaderRow}>
                    {/* Rank Badge */}
                    <LinearGradient
                      colors={
                        entry.rank === 1 ? ['#FFD700', '#FFA500']
                          : entry.rank === 2 ? ['#C0C0C0', '#A0A0A0']
                            : ['#CD7F32', '#A0522D']
                      }
                      style={styles.leaderRankBadge}
                    >
                      <Text style={styles.leaderRankText}>
                        {entry.rank === 1 ? '\u{1F947}' : entry.rank === 2 ? '\u{1F948}' : '\u{1F949}'}
                      </Text>
                    </LinearGradient>

                    {/* Silhouette Avatar */}
                    <View style={[styles.leaderAvatar, { backgroundColor: entry.color }]}>
                      <Ionicons name="person" size={20} color={COLORS.textMuted} />
                    </View>

                    {/* Score */}
                    <View style={styles.leaderInfo}>
                      <Text style={styles.leaderAnonymous}>Anonymous</Text>
                      <View style={styles.leaderScoreRow}>
                        <Ionicons name="star" size={12} color={COLORS.gold} />
                        <Text style={styles.leaderScore}>{entry.score}</Text>
                      </View>
                    </View>
                  </View>
                  {index < WEEKLY_TOP.length - 1 && <View style={styles.leaderDivider} />}
                </Animated.View>
              ))}

              {/* View Full Rankings Link */}
              <AnimatedPressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('Leaderboard');
                }}
                style={styles.viewRankingsBtn}
              >
                <Text style={styles.viewRankingsText}>View Full Rankings</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.accent} />
              </AnimatedPressable>
            </GlassCard>
          </Animated.View>

          {/* ─── Stats Cards ──────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(500).delay(700)}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsGrid}>
              {/* Rated by you */}
              <Animated.View entering={FadeInDown.duration(400).delay(750)} style={styles.statCardWrapper}>
                <GlassCard style={styles.statCard}>
                  <LinearGradient colors={['rgba(74,144,217,0.15)', 'rgba(74,144,217,0.03)']} style={styles.statIconBg}>
                    <Ionicons name="eye" size={20} color={COLORS.blue} />
                  </LinearGradient>
                  <Text style={styles.statNumber}>{ratingsGiven.length}</Text>
                  <Text style={styles.statLabel}>People Rated</Text>
                </GlassCard>
              </Animated.View>

              {/* Rated you */}
              <Animated.View entering={FadeInDown.duration(400).delay(830)} style={styles.statCardWrapper}>
                <GlassCard style={styles.statCard}>
                  <LinearGradient colors={['rgba(52,199,89,0.15)', 'rgba(52,199,89,0.03)']} style={styles.statIconBg}>
                    <Ionicons name="people" size={20} color={COLORS.green} />
                  </LinearGradient>
                  <Text style={styles.statNumber}>{totalRatedByOthers}</Text>
                  <Text style={styles.statLabel}>Rated You</Text>
                </GlassCard>
              </Animated.View>

              {/* Average given */}
              <Animated.View entering={FadeInDown.duration(400).delay(910)} style={styles.statCardWrapper}>
                <GlassCard style={styles.statCard}>
                  <LinearGradient colors={['rgba(255,149,0,0.15)', 'rgba(255,149,0,0.03)']} style={styles.statIconBg}>
                    <Ionicons name="analytics" size={20} color={COLORS.orange} />
                  </LinearGradient>
                  <Text style={styles.statNumber}>{averageGiven}</Text>
                  <Text style={styles.statLabel}>Avg. Given</Text>
                </GlassCard>
              </Animated.View>
            </View>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {},
  backBtnCard: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerBadge: {},
  headerBadgeGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
  },
  headerBadgePlaceholder: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card Stack
  cardStack: {
    height: 390,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  nextCardWrapper: {
    position: 'absolute',
    top: 10,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  cardInner: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    width: CARD_WIDTH - 40,
    height: 300,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  avatarInitials: {
    fontSize: 72,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
  cardInfo: {
    alignItems: 'center',
    marginTop: 14,
    paddingBottom: 4,
  },
  cardGenderAge: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  cardAnonymous: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  cardCounter: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 16,
  },

  // All rated state
  allRatedContent: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  allRatedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  allRatedSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  // Rating Buttons
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 28,
  },
  ratingBtnPressable: {},
  ratingBtn: {
    width: (CARD_WIDTH - 40) / 5,
    height: 72,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  ratingEmoji: {
    fontSize: 24,
  },
  ratingLabel: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
    marginTop: 4,
  },

  // Your Rating Card
  yourRatingCard: {
    padding: 20,
    marginBottom: 24,
  },
  yourRatingContent: {
    marginBottom: 16,
  },
  yourRatingScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  },
  starIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yourRatingTextCol: {
    flex: 1,
  },
  ratingValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  yourRatingNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  yourRatingMax: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  yourRatingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  basedOnText: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginBottom: 12,
  },
  ratingBarContainer: {
    marginTop: 4,
  },
  ratingBarBg: {
    height: 6,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // No rating
  noRatingContent: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 12,
  },
  noRatingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 10,
    marginBottom: 4,
  },
  noRatingSubtitle: {
    fontSize: 13,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },

  // Upload Button
  uploadBtnWrapper: {
    marginBottom: 12,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  uploadBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
  },

  // Privacy Note
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  privacyText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },

  // Leaderboard Preview
  leaderboardCard: {
    padding: 16,
    marginBottom: 24,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  leaderRankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderRankText: {
    fontSize: 16,
  },
  leaderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderAnonymous: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  leaderScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  leaderScore: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.gold,
  },
  leaderDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 44,
  },
  viewRankingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 14,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  viewRankingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  statCardWrapper: {
    flex: 1,
  },
  statCard: {
    padding: 14,
    alignItems: 'center',
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});

export default RateMyLookScreen;
