import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  Dimensions, Share,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';
import { COLORS, GRADIENTS, SHADOWS, RADIUS } from '../utils/theme';

const { width } = Dimensions.get('window');
const REFERRAL_KEY = 'androgenic_referrals';

const REWARDS = [
  { friends: 1, reward: '3 Extra Scans', icon: 'camera', color: '#00b4d8', unlocked: false },
  { friends: 3, reward: 'Exclusive Badge', icon: 'ribbon', color: '#a855f7', unlocked: false },
  { friends: 5, reward: '1 Week PRO Free', icon: 'star', color: '#FFD700', unlocked: false },
  { friends: 10, reward: '1 Month PRO Free', icon: 'diamond', color: '#00e5ff', unlocked: false },
  { friends: 25, reward: 'Lifetime PRO', icon: 'trophy', color: '#ff6090', unlocked: false },
];

const LEADERBOARD = [
  { name: 'Alex M.', referrals: 47, avatar: 'A' },
  { name: 'Jordan K.', referrals: 38, avatar: 'J' },
  { name: 'Sam P.', referrals: 31, avatar: 'S' },
  { name: 'Tyler R.', referrals: 24, avatar: 'T' },
  { name: 'Chris B.', referrals: 19, avatar: 'C' },
];

const ReferralScreen = ({ navigation }) => {
  const [referralCount, setReferralCount] = useState(0);
  const [referralCode, setReferralCode] = useState('ANDRO-XXXX');

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const data = await AsyncStorage.getItem(REFERRAL_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setReferralCount(parsed.count || 0);
        setReferralCode(parsed.code || generateCode());
      } else {
        const code = generateCode();
        setReferralCode(code);
        await AsyncStorage.setItem(REFERRAL_KEY, JSON.stringify({ count: 0, code }));
      }
    } catch {}
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'ANDRO-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `I've been using Androgenic to analyze and improve my face. Use my code ${referralCode} for 3 free scans! Download: https://androgenic.app/invite/${referralCode}`,
        title: 'Androgenic — AI Face Analysis',
      });
    } catch {}
  }, [referralCode]);

  const nextReward = REWARDS.find(r => r.friends > referralCount) || REWARDS[REWARDS.length - 1];
  const progress = nextReward ? Math.min(referralCount / nextReward.friends, 1) : 1;

  return (
    <GlassBackground variant="gold">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Refer Friends</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <Animated.View entering={ZoomIn.duration(500)}>
            <GlassCard variant="gold" style={styles.heroCard} glow>
              <LinearGradient
                colors={['rgba(255,215,0,0.12)', 'rgba(255,165,0,0.08)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              />
              <View style={styles.heroIcon}>
                <Ionicons name="gift" size={32} color={COLORS.gold} />
              </View>
              <Text style={styles.heroTitle}>Earn Free PRO</Text>
              <Text style={styles.heroSub}>Invite friends to Androgenic and unlock premium rewards</Text>

              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>Your Referral Code</Text>
                <Text style={styles.codeText}>{referralCode}</Text>
              </View>

              <GlassButton
                title="Share Invite Link"
                icon="share-social"
                onPress={handleShare}
                variant="gold"
                size="lg"
                style={{ marginTop: 16 }}
              />
            </GlassCard>
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <View style={styles.statsRow}>
              <GlassCard variant="default" style={styles.statCard}>
                <Text style={[styles.statValue, { color: COLORS.gold }]}>{referralCount}</Text>
                <Text style={styles.statLabel}>Friends Invited</Text>
              </GlassCard>
              <GlassCard variant="default" style={styles.statCard}>
                <Text style={[styles.statValue, { color: COLORS.accent }]}>
                  {REWARDS.filter(r => r.friends <= referralCount).length}
                </Text>
                <Text style={styles.statLabel}>Rewards Earned</Text>
              </GlassCard>
            </View>
          </Animated.View>

          {/* Next Reward Progress */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <GlassCard variant="accent" style={styles.nextRewardCard}>
              <View style={styles.nextRewardHeader}>
                <Ionicons name={nextReward.icon} size={20} color={nextReward.color} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.nextRewardTitle}>Next: {nextReward.reward}</Text>
                  <Text style={styles.nextRewardSub}>{nextReward.friends - referralCount} more friends needed</Text>
                </View>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: nextReward.color }]} />
              </View>
              <Text style={styles.progressText}>{referralCount}/{nextReward.friends}</Text>
            </GlassCard>
          </Animated.View>

          {/* Rewards List */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <Text style={styles.sectionTitle}>Reward Tiers</Text>
            {REWARDS.map((reward, i) => {
              const unlocked = referralCount >= reward.friends;
              return (
                <Animated.View key={i} entering={FadeInRight.duration(300).delay(350 + i * 60)}>
                  <GlassCard variant={unlocked ? 'accent' : 'default'} style={styles.rewardCard} glow={unlocked}>
                    <View style={[styles.rewardIcon, { backgroundColor: (unlocked ? reward.color : COLORS.textMuted) + '15' }]}>
                      <Ionicons name={reward.icon} size={18} color={unlocked ? reward.color : COLORS.textMuted} />
                    </View>
                    <View style={styles.rewardInfo}>
                      <Text style={[styles.rewardName, unlocked && { color: reward.color }]}>{reward.reward}</Text>
                      <Text style={styles.rewardFriends}>{reward.friends} friends</Text>
                    </View>
                    {unlocked ? (
                      <View style={[styles.unlockedBadge, { backgroundColor: reward.color + '20' }]}>
                        <Ionicons name="checkmark" size={14} color={reward.color} />
                      </View>
                    ) : (
                      <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
                    )}
                  </GlassCard>
                </Animated.View>
              );
            })}
          </Animated.View>

          {/* Leaderboard */}
          <Animated.View entering={FadeInDown.duration(400).delay(600)}>
            <Text style={styles.sectionTitle}>Top Referrers</Text>
            {LEADERBOARD.map((user, i) => (
              <Animated.View key={i} entering={FadeInRight.duration(300).delay(650 + i * 50)}>
                <GlassCard variant={i === 0 ? 'gold' : 'default'} style={styles.leaderCard}>
                  <Text style={[styles.leaderRank, i === 0 && { color: COLORS.gold }]}>#{i + 1}</Text>
                  <View style={[styles.leaderAvatar, i === 0 && { borderColor: COLORS.gold }]}>
                    <Text style={styles.leaderAvatarText}>{user.avatar}</Text>
                  </View>
                  <View style={styles.leaderInfo}>
                    <Text style={styles.leaderName}>{user.name}</Text>
                    <Text style={styles.leaderReferrals}>{user.referrals} referrals</Text>
                  </View>
                  {i === 0 && <Ionicons name="trophy" size={18} color={COLORS.gold} />}
                </GlassCard>
              </Animated.View>
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  heroCard: { padding: 24, alignItems: 'center', marginBottom: 16 },
  heroIcon: {
    width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(255,215,0,0.12)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  heroTitle: { fontSize: 22, fontWeight: '900', color: COLORS.gold, marginBottom: 4 },
  heroSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 19, marginBottom: 16 },
  codeBox: {
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 14, width: '100%', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.20)',
  },
  codeLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginBottom: 4 },
  codeText: { fontSize: 24, fontWeight: '900', color: COLORS.gold, letterSpacing: 3 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginTop: 4 },

  nextRewardCard: { padding: 16, marginBottom: 16 },
  nextRewardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  nextRewardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  nextRewardSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  progressTrack: { height: 6, backgroundColor: COLORS.bgSecondary, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 10, color: COLORS.textMuted, fontWeight: '700', textAlign: 'right' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 12, marginTop: 8, letterSpacing: 0.3 },

  rewardCard: { padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rewardIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rewardInfo: { flex: 1 },
  rewardName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  rewardFriends: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  unlockedBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  leaderCard: { padding: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 10 },
  leaderRank: { fontSize: 14, fontWeight: '800', color: COLORS.textMuted, width: 24 },
  leaderAvatar: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight,
  },
  leaderAvatarText: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  leaderReferrals: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
});

export default ReferralScreen;
