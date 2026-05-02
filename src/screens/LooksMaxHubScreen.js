import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Linking,
} from 'react-native';
import Animated, { FadeInDown, FadeIn, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';
import { getHistory } from '../utils/history';
import { getStreakState } from '../utils/streaks';
import AnimatedPressable from '../components/AnimatedPressable';
import GlassBackground from '../components/GlassBackground';

const { width } = Dimensions.get('window');
const STORE_URL = 'https://androgenicpeptides.lovable.app';

const TRENDING_TOPICS = [
  { title: 'Mewing Before/After', posts: '12.4K', icon: 'trending-up', color: '#0066ff' },
  { title: 'Jaw Surgery Results', posts: '8.7K', icon: 'fitness', color: '#ff6b35' },
  { title: 'Skincare Routines', posts: '15.2K', icon: 'water', color: '#00e676' },
  { title: 'Minoxidil Journeys', posts: '6.3K', icon: 'leaf', color: '#4d94ff' },
  { title: 'Body Recomp Faces', posts: '9.1K', icon: 'body', color: '#ff5252' },
  { title: 'Rate My Progress', posts: '20.5K', icon: 'star', color: '#FFD700' },
];

const SUCCESS_STORIES = [
  { user: 'MewingPro', before: 62, after: 81, months: 8, method: 'Mewing + jaw exercises', streak: 243 },
  { user: 'SkinAscend', before: 55, after: 78, months: 5, method: 'Tretinoin + routine', streak: 152 },
  { user: 'JawKing', before: 48, after: 73, months: 12, method: 'Full looksmax protocol', streak: 365 },
  { user: 'GlowUpSZN', before: 58, after: 85, months: 6, method: 'Fat loss + skincare + mewing', streak: 180 },
];

const COMMUNITY_STATS = { members: '47.2K', posts: '128K', activeNow: '1.2K', avgImprovement: '+18' };

const LooksMaxHubScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    getHistory().then(setHistory);
    setStreak(getStreakState());
  }, []);

  return (
    <GlassBackground variant="purple">
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>LooksMax Hub</Text>
        <AnimatedPressable onPress={() => navigation.navigate('Forum')} style={styles.forumBtn}>
          <Ionicons name="people" size={18} color="#fff" />
        </AnimatedPressable>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Community Stats Bar */}
        <Animated.View entering={FadeInDown.duration(350).delay(0)} style={styles.statsBar}>
          {[
            { num: COMMUNITY_STATS.members, label: 'Members' },
            { num: COMMUNITY_STATS.posts, label: 'Posts' },
            { num: COMMUNITY_STATS.activeNow, label: 'Online' },
            { num: COMMUNITY_STATS.avgImprovement, label: 'Avg Gain' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.duration(350).delay(80)} style={styles.quickRow}>
          <AnimatedPressable style={styles.quickCard} onPress={() => navigation.navigate('Forum')} scaleDown={0.95}>
            <LinearGradient colors={['#0055dd', '#0077ff']} style={styles.quickGradient}>
              <Ionicons name="chatbubbles" size={22} color="#fff" />
              <Text style={styles.quickText}>Community</Text>
            </LinearGradient>
          </AnimatedPressable>
          <AnimatedPressable style={styles.quickCard} onPress={() => navigation.navigate('Chat')} scaleDown={0.95}>
            <LinearGradient colors={['#00897b', '#00bfa5']} style={styles.quickGradient}>
              <Ionicons name="sparkles" size={22} color="#fff" />
              <Text style={styles.quickText}>AI Chat</Text>
            </LinearGradient>
          </AnimatedPressable>
          <AnimatedPressable style={styles.quickCard} onPress={() => navigation.navigate('AndrogenicIQ')} scaleDown={0.95}>
            <LinearGradient colors={['#ff8f00', '#ffc107']} style={styles.quickGradient}>
              <Ionicons name="bulb" size={22} color="#fff" />
              <Text style={styles.quickText}>IQ Test</Text>
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>

        {/* Trending Topics */}
        <Animated.View entering={FadeInDown.duration(350).delay(160)}>
          <Text style={styles.sectionTitle}>Trending Topics</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingRow}>
            {TRENDING_TOPICS.map((t, i) => (
              <Animated.View key={i} entering={FadeInRight.duration(300).delay(200 + i * 60)}>
                <AnimatedPressable
                  style={styles.trendingCard}
                  onPress={() => navigation.navigate('Forum')}
                  scaleDown={0.95}
                >
                  <View style={[styles.trendingIcon, { backgroundColor: t.color + '18' }]}>
                    <Ionicons name={t.icon} size={18} color={t.color} />
                  </View>
                  <Text style={styles.trendingTitle} numberOfLines={1}>{t.title}</Text>
                  <Text style={styles.trendingPosts}>{t.posts} posts</Text>
                </AnimatedPressable>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Success Stories */}
        <Animated.View entering={FadeInDown.duration(350).delay(320)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Success Stories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Forum')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {SUCCESS_STORIES.map((s, i) => (
            <Animated.View key={i} entering={FadeInDown.duration(300).delay(400 + i * 80)} style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <View style={[styles.storyAvatar, { backgroundColor: ['#e53935', '#8e24aa', '#3949ab', '#00897b'][i] + '25' }]}>
                  <Text style={[styles.storyAvatarText, { color: ['#e53935', '#8e24aa', '#3949ab', '#00897b'][i] }]}>
                    {s.user.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.storyUser}>{s.user}</Text>
                  <Text style={styles.storyMethod}>{s.method}</Text>
                </View>
                <View style={styles.storyStreakBadge}>
                  <Ionicons name="flame" size={12} color="#ff6b35" />
                  <Text style={styles.storyStreakText}>{s.streak}d</Text>
                </View>
              </View>
              <View style={styles.storyScores}>
                <View style={styles.storyScoreCol}>
                  <Text style={styles.storyScoreLabel}>Before</Text>
                  <Text style={[styles.storyScore, { color: '#ff5252' }]}>{s.before}</Text>
                </View>
                <View style={styles.storyArrow}>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.accent} />
                </View>
                <View style={styles.storyScoreCol}>
                  <Text style={styles.storyScoreLabel}>After</Text>
                  <Text style={[styles.storyScore, { color: '#00e676' }]}>{s.after}</Text>
                </View>
                <View style={styles.storyImprovement}>
                  <Text style={styles.storyImpText}>+{s.after - s.before}</Text>
                  <Text style={styles.storyImpLabel}>{s.months}mo</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Your Progress Share */}
        {history.length > 0 && (
          <Animated.View entering={FadeInDown.duration(350).delay(700)} style={styles.shareCard}>
            <Text style={styles.shareTitle}>Share Your Progress</Text>
            <Text style={styles.shareSub}>
              {history.length} scan{history.length !== 1 ? 's' : ''} recorded
              {streak?.currentStreak > 0 ? ` | ${streak.currentStreak} day streak` : ''}
            </Text>
            <View style={styles.shareActions}>
              <AnimatedPressable style={styles.shareBtn} onPress={() => navigation.navigate('Forum')}>
                <Ionicons name="create" size={16} color="#fff" />
                <Text style={styles.shareBtnText}>Post to Community</Text>
              </AnimatedPressable>
              <AnimatedPressable style={styles.shareBtn2} onPress={() => navigation.navigate('ShareCard', { scores: history[0]?.scores })}>
                <Ionicons name="share-social" size={16} color={COLORS.accent} />
                <Text style={styles.shareBtn2Text}>Share Card</Text>
              </AnimatedPressable>
            </View>
          </Animated.View>
        )}

        {/* Peptides Store Banner */}
        <Animated.View entering={FadeInDown.duration(350).delay(800)}>
          <AnimatedPressable onPress={() => Linking.openURL(STORE_URL)} scaleDown={0.97}>
            <LinearGradient colors={['#0044cc', '#0066ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.storeBanner}>
              <View style={styles.storeIconWrap}>
                <Ionicons name="flask" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.storeBannerTitle}>Androgenic Peptides</Text>
                <Text style={styles.storeBannerSub}>Premium peptides for peak aesthetics</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>

        {/* Looksmax Guides Quick Links */}
        <Animated.View entering={FadeInDown.duration(350).delay(900)}>
          <Text style={styles.sectionTitle}>Popular Guides</Text>
          {[
            { title: 'The Complete Mewing Guide', icon: 'fitness', color: '#0066ff', screen: 'MewingGuide' },
            { title: 'Skincare for Men', icon: 'water', color: '#00e676', screen: 'SkinCareGuide' },
            { title: 'Jawline Exercises Bible', icon: 'square-outline', color: '#ff6b35', screen: 'JawlineGuide' },
            { title: 'Supplements Stack', icon: 'flask', color: '#4d94ff', screen: 'SupplementsGuide' },
          ].map((g, i) => (
            <AnimatedPressable key={i} style={styles.guideRow} onPress={() => navigation.navigate(g.screen)} scaleDown={0.98}>
              <View style={[styles.guideIcon, { backgroundColor: g.color + '18' }]}>
                <Ionicons name={g.icon} size={18} color={g.color} />
              </View>
              <Text style={styles.guideTitle}>{g.title}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </AnimatedPressable>
          ))}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  forumBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0066ff', justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 20 },

  statsBar: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.borderLight },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 10, marginTop: 2 },

  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  quickCard: { flex: 1 },
  quickGradient: { borderRadius: 14, paddingVertical: 18, alignItems: 'center', gap: 6 },
  quickText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  seeAll: { color: '#0066ff', fontSize: 12, fontWeight: '600' },
  trendingRow: { gap: 10, paddingBottom: 4, marginBottom: 16 },
  trendingCard: { width: 130, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.borderLight },
  trendingIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  trendingTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 3 },
  trendingPosts: { color: COLORS.textMuted, fontSize: 11 },

  storyCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.borderLight },
  storyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  storyAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  storyAvatarText: { fontSize: 13, fontWeight: '800' },
  storyUser: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  storyMethod: { color: COLORS.textMuted, fontSize: 11, marginTop: 1 },
  storyStreakBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,107,53,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  storyStreakText: { color: '#ff6b35', fontSize: 11, fontWeight: '700' },
  storyScores: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  storyScoreCol: { alignItems: 'center' },
  storyScoreLabel: { color: COLORS.textMuted, fontSize: 10, marginBottom: 2 },
  storyScore: { fontSize: 22, fontWeight: '900' },
  storyArrow: { marginHorizontal: 4 },
  storyImprovement: { alignItems: 'center', backgroundColor: 'rgba(0,230,118,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  storyImpText: { color: '#00e676', fontSize: 16, fontWeight: '800' },
  storyImpLabel: { color: COLORS.textMuted, fontSize: 10 },

  shareCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.borderLight },
  shareTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  shareSub: { color: COLORS.textMuted, fontSize: 12, marginBottom: 12 },
  shareActions: { flexDirection: 'row', gap: 10 },
  shareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#0066ff', paddingVertical: 10, borderRadius: 10 },
  shareBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  shareBtn2: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.bgSecondary, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.borderLight },
  shareBtn2Text: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },

  storeBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, marginBottom: 16, gap: 12 },
  storeIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  storeBannerTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  storeBannerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },

  guideRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, marginBottom: 6, gap: 10, borderWidth: 1, borderColor: COLORS.borderLight },
  guideIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  guideTitle: { flex: 1, color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
});

export default LooksMaxHubScreen;
