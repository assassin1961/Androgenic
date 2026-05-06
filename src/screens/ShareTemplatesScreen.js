import React, { useState, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';
import { COLORS, GRADIENTS, SHADOWS, RADIUS } from '../utils/theme';
import { getHistory } from '../utils/history';
import { getStreakState, getCurrentLevel } from '../utils/streaks';
import { getScoreColor } from '../utils/theme';

const { width } = Dimensions.get('window');
const CARD_W = width - 80;

const TEMPLATES = [
  {
    id: 'score',
    name: 'Score Card',
    gradient: ['#0044cc', '#0088ff'],
    icon: 'analytics',
    desc: 'Share your latest face score',
  },
  {
    id: 'progress',
    name: 'Progress Card',
    gradient: ['#006b3c', '#00e676'],
    icon: 'trending-up',
    desc: 'Show your improvement journey',
  },
  {
    id: 'streak',
    name: 'Streak Card',
    gradient: ['#cc4400', '#ff6b35'],
    icon: 'flame',
    desc: 'Flex your consistency',
  },
  {
    id: 'level',
    name: 'Level Card',
    gradient: ['#8b1a4a', '#ff6090'],
    icon: 'shield',
    desc: 'Show your rank and XP',
  },
  {
    id: 'dark',
    name: 'Dark Elite',
    gradient: ['#000000', '#1a1a2e'],
    icon: 'moon',
    desc: 'Minimal dark aesthetic',
  },
  {
    id: 'gold',
    name: 'Gold Premium',
    gradient: ['#b8860b', '#FFD700'],
    icon: 'diamond',
    desc: 'Premium gold design',
  },
];

const SharePreview = memo(({ template, score, streak, level }) => (
  <View style={styles.previewWrap}>
    <LinearGradient
      colors={template.gradient}
      style={styles.previewCard}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    >
      <View style={styles.previewHeader}>
        <Text style={styles.previewLogo}>ANDROGENIC</Text>
        <View style={styles.previewBadge}>
          <Ionicons name={template.icon} size={12} color="#fff" />
        </View>
      </View>

      <View style={styles.previewBody}>
        {template.id === 'score' && (
          <>
            <Text style={styles.previewScoreNum}>{score || '--'}</Text>
            <Text style={styles.previewScoreLabel}>Face Analysis Score</Text>
            <View style={styles.previewDivider} />
            <Text style={styles.previewTagline}>AI-Powered Face Analysis</Text>
          </>
        )}
        {template.id === 'progress' && (
          <>
            <Ionicons name="trending-up" size={32} color="#fff" />
            <Text style={styles.previewProgressText}>+{Math.floor(Math.random() * 12) + 3} points</Text>
            <Text style={styles.previewScoreLabel}>Score Improvement</Text>
            <View style={styles.previewDivider} />
            <Text style={styles.previewTagline}>Glow-up in progress</Text>
          </>
        )}
        {template.id === 'streak' && (
          <>
            <Ionicons name="flame" size={36} color="#FFD700" />
            <Text style={styles.previewStreakNum}>{streak || 0}</Text>
            <Text style={styles.previewScoreLabel}>Day Streak</Text>
            <View style={styles.previewDivider} />
            <Text style={styles.previewTagline}>Consistency is king</Text>
          </>
        )}
        {template.id === 'level' && (
          <>
            <Ionicons name="shield" size={32} color={level?.color || '#fff'} />
            <Text style={styles.previewLevelText}>{level?.name || 'Newbie'}</Text>
            <Text style={styles.previewScoreLabel}>Level {level?.level || 1}</Text>
            <View style={styles.previewDivider} />
            <Text style={styles.previewTagline}>Leveling up daily</Text>
          </>
        )}
        {template.id === 'dark' && (
          <>
            <View style={styles.previewDarkScore}>
              <Text style={styles.previewDarkNum}>{score || '--'}</Text>
              <Text style={styles.previewDarkSlash}>/100</Text>
            </View>
            <Text style={styles.previewScoreLabel}>Androgenic Score</Text>
          </>
        )}
        {template.id === 'gold' && (
          <>
            <Ionicons name="diamond" size={28} color="#000" />
            <Text style={[styles.previewScoreNum, { color: '#000' }]}>{score || '--'}</Text>
            <Text style={[styles.previewScoreLabel, { color: 'rgba(0,0,0,0.7)' }]}>Elite Face Score</Text>
          </>
        )}
      </View>

      <View style={styles.previewFooter}>
        <Text style={[styles.previewFooterText, template.id === 'gold' && { color: 'rgba(0,0,0,0.5)' }]}>
          androgenic.app
        </Text>
      </View>
    </LinearGradient>
  </View>
));

const ShareTemplatesScreen = ({ navigation }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [score, setScore] = useState(null);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(null);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const h = await getHistory();
    if (h && h.length > 0) setScore(h[0].scores?.overall);
    const s = getStreakState();
    setStreak(s?.currentStreak || 0);
    setLevel(getCurrentLevel());
  };

  const handleShare = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('ShareCard');
  }, [navigation]);

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Share Cards</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Preview */}
          <Animated.View entering={ZoomIn.duration(400)}>
            <SharePreview
              template={TEMPLATES[selectedTemplate]}
              score={score}
              streak={streak}
              level={level}
            />
          </Animated.View>

          {/* Template Selector */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <Text style={styles.sectionTitle}>Choose Template</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
              {TEMPLATES.map((t, i) => (
                <AnimatedPressable
                  key={t.id}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedTemplate(i); }}
                >
                  <GlassCard
                    variant={selectedTemplate === i ? 'accent' : 'default'}
                    glow={selectedTemplate === i}
                    style={styles.templateChip}
                  >
                    <LinearGradient colors={t.gradient} style={styles.templateThumb} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Ionicons name={t.icon} size={14} color="#fff" />
                    </LinearGradient>
                    <Text style={[styles.templateName, selectedTemplate === i && { color: COLORS.accent }]}>{t.name}</Text>
                    <Text style={styles.templateDesc}>{t.desc}</Text>
                  </GlassCard>
                </AnimatedPressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Share Actions */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <GlassButton
              title="Share to Stories"
              icon="share-social"
              onPress={handleShare}
              variant="primary"
              size="lg"
              style={{ marginTop: 16 }}
            />
            <View style={styles.shareRow}>
              <GlassButton
                title="Save Image"
                icon="download"
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <GlassButton
                title="Copy Link"
                icon="link"
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                variant="ghost"
                style={{ flex: 1 }}
              />
            </View>
          </Animated.View>

          {/* Social Platforms */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <Text style={styles.sectionTitle}>Share To</Text>
            <View style={styles.platformRow}>
              {[
                { name: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
                { name: 'TikTok', icon: 'logo-tiktok', color: '#fff' },
                { name: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
                { name: 'Snapchat', icon: 'chatbubble', color: '#FFFC00' },
                { name: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
              ].map((p, i) => (
                <AnimatedPressable key={i} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <View style={styles.platformItem}>
                    <View style={[styles.platformIcon, { backgroundColor: p.color + '20' }]}>
                      <Ionicons name={p.icon} size={20} color={p.color} />
                    </View>
                    <Text style={styles.platformName}>{p.name}</Text>
                  </View>
                </AnimatedPressable>
              ))}
            </View>
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

  previewWrap: { alignItems: 'center', marginBottom: 20 },
  previewCard: { width: CARD_W, borderRadius: RADIUS.xl, padding: 24, minHeight: 280, ...SHADOWS.glass },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  previewLogo: { fontSize: 12, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 2 },
  previewBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  previewBody: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  previewScoreNum: { fontSize: 64, fontWeight: '900', color: '#fff' },
  previewScoreLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 4 },
  previewDivider: { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1, marginVertical: 12 },
  previewTagline: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  previewProgressText: { fontSize: 36, fontWeight: '900', color: '#fff', marginTop: 8 },
  previewStreakNum: { fontSize: 48, fontWeight: '900', color: '#fff', marginTop: 4 },
  previewLevelText: { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 4 },
  previewDarkScore: { flexDirection: 'row', alignItems: 'baseline' },
  previewDarkNum: { fontSize: 56, fontWeight: '900', color: '#fff' },
  previewDarkSlash: { fontSize: 20, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  previewFooter: { alignItems: 'center', marginTop: 16 },
  previewFooterText: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: 1 },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 12, marginTop: 8, letterSpacing: 0.3 },

  templateScroll: { marginBottom: 8 },
  templateChip: { padding: 12, marginRight: 10, width: 130 },
  templateThumb: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  templateName: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  templateDesc: { fontSize: 9, color: COLORS.textMuted },

  shareRow: { flexDirection: 'row', gap: 10, marginTop: 10 },

  platformRow: { flexDirection: 'row', justifyContent: 'space-between' },
  platformItem: { alignItems: 'center', width: (width - 60) / 5 },
  platformIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  platformName: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600' },
});

export default ShareTemplatesScreen;
