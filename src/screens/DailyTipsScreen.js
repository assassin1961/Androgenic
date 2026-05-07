import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../utils/theme';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedPressable from '../components/AnimatedPressable';

const STORAGE_KEY_READ = '@daily_tips_read';
const STORAGE_KEY_STREAK = '@daily_tips_streak';
const STORAGE_KEY_LAST_VISIT = '@daily_tips_last_visit';

const TIPS = [
  { id: 1, category: 'Skin', title: 'Double Cleanse at Night', content: 'Use an oil-based cleanser first to dissolve sunscreen and sebum, followed by a water-based cleanser. This two-step method ensures pores stay clear and prevents overnight breakouts. Skip the oil cleanser in the morning — a gentle water wash is enough.', icon: 'sparkles-outline', color: '#00e676' },
  { id: 2, category: 'Jawline', title: 'Mew While You Work', content: 'Keep your tongue pressed flat against the roof of your mouth throughout the day. This proper oral posture (mewing) supports forward facial growth and defines the jawline over time. Set hourly reminders until it becomes a habit.', icon: 'fitness-outline', color: '#ff6b35' },
  { id: 3, category: 'Eyes', title: 'Cold Compress for Puffiness', content: 'Apply a cold spoon or ice roller under your eyes for 2-3 minutes each morning. Cold constricts blood vessels and reduces fluid retention, instantly making under-eye bags less noticeable. Store your tools in the fridge overnight.', icon: 'eye-outline', color: '#4d94ff' },
  { id: 4, category: 'Hair', title: 'Cold Rinse Finish', content: 'End every shower with 30 seconds of cold water on your hair. Cold water seals the cuticle layer, adding shine and reducing frizz. It also stimulates scalp circulation which supports healthier hair growth over time.', icon: 'brush-outline', color: '#ffab40' },
  { id: 5, category: 'Nutrition', title: 'Collagen with Vitamin C', content: 'Take your collagen peptides alongside vitamin C for maximum absorption. Vitamin C is a required cofactor for collagen synthesis — without it, your body cannot properly utilize collagen supplements. A glass of orange juice works.', icon: 'nutrition-outline', color: '#1de9b6' },
  { id: 6, category: 'Posture', title: 'Wall Angel Exercise', content: 'Stand with your back flat against a wall, arms at 90 degrees. Slowly slide arms up and down for 10 reps. This exercise corrects rounded shoulders and forward head posture, which dramatically improves how your face is framed.', icon: 'body-outline', color: '#00e5ff' },
  { id: 7, category: 'Sleep', title: 'Sleep on Your Back', content: 'Side and stomach sleeping compresses your face against the pillow, accelerating wrinkles and causing asymmetry. Train yourself to sleep on your back using a contoured pillow. It also prevents neck strain and morning puffiness.', icon: 'moon-outline', color: '#ff6090' },
  { id: 8, category: 'Grooming', title: 'Trim Brows Weekly', content: 'Brush eyebrow hairs upward with a spoolie and trim any strands extending past your natural brow line. Well-groomed brows frame the eyes and create a cleaner, more intentional appearance without looking over-done.', icon: 'cut-outline', color: '#ffab40' },
  { id: 9, category: 'Skin', title: 'Sunscreen Is Non-Negotiable', content: 'UV damage is the number one cause of premature skin aging. Apply SPF 50+ PA++++ every single morning, even on cloudy days. Reapply every 2 hours when outdoors. This single habit prevents wrinkles, dark spots, and collagen breakdown.', icon: 'sunny-outline', color: '#00e676' },
  { id: 10, category: 'Jawline', title: 'Chew Mastic Gum', content: 'Chew mastic gum for 15-20 minutes daily to strengthen masseter muscles. Start with softer pieces and work up gradually. This natural approach adds definition to the jawline, but avoid overdoing it to prevent TMJ issues.', icon: 'fitness-outline', color: '#ff6b35' },
  { id: 11, category: 'Eyes', title: 'Caffeine Eye Serum', content: 'Apply a caffeine-based eye serum each morning. Caffeine constricts blood vessels and reduces dark circles caused by poor circulation. Look for products with at least 3% caffeine concentration. Gently pat — never rub — around the orbital bone.', icon: 'eye-outline', color: '#4d94ff' },
  { id: 12, category: 'Hair', title: 'Scalp Massage Daily', content: 'Spend 5 minutes massaging your scalp with fingertips using circular motions. Studies show this increases hair thickness by stretching dermal papilla cells. Do it while shampooing or before bed. Consistency over months yields visible results.', icon: 'brush-outline', color: '#ffab40' },
  { id: 13, category: 'Nutrition', title: 'Cut Sugar for Clear Skin', content: 'Glycation from excess sugar breaks down collagen and elastin. Reducing processed sugar intake visibly improves skin texture within 2-4 weeks. Replace candy and soda with berries and sparkling water for a sweet fix.', icon: 'nutrition-outline', color: '#1de9b6' },
  { id: 14, category: 'Posture', title: 'Chin Tuck Exercise', content: 'Sit tall and gently pull your chin straight back, creating a double chin. Hold for 5 seconds, release, repeat 15 times. This strengthens deep neck flexors and corrects forward head posture that makes your jawline appear weaker.', icon: 'body-outline', color: '#00e5ff' },
  { id: 15, category: 'Sleep', title: 'Blue Light Curfew', content: 'Stop all screen use 60 minutes before bed or use blue-light blocking glasses. Blue light suppresses melatonin production, delays REM sleep, and leads to puffy eyes and dark circles. Read a physical book instead.', icon: 'moon-outline', color: '#ff6090' },
  { id: 16, category: 'Grooming', title: 'Define Your Neckline', content: 'Place two fingers above your Adam\'s apple — that is where your beard neckline should be. Everything below gets shaved clean. A well-defined neckline is the difference between looking groomed and looking unkempt.', icon: 'cut-outline', color: '#ffab40' },
  { id: 17, category: 'Skin', title: 'Retinol at Night Only', content: 'Retinol (or tretinoin) increases cell turnover and boosts collagen, but it makes skin photosensitive. Always apply at night and follow with moisturizer. Start with 0.025% two nights per week and increase gradually.', icon: 'sparkles-outline', color: '#00e676' },
  { id: 18, category: 'Jawline', title: 'Reduce Facial Bloating', content: 'Limit sodium intake to under 2300mg and drink 3+ liters of water daily. Paradoxically, drinking more water reduces water retention. Avoid alcohol which causes facial puffiness. A lean face reveals bone structure.', icon: 'fitness-outline', color: '#ff6b35' },
  { id: 19, category: 'Eyes', title: 'Sleep 7-9 Hours Minimum', content: 'Nothing replaces quality sleep for eye appearance. During deep sleep, your body drains excess fluid from under the eyes and repairs collagen. Chronic sleep deprivation causes permanent dark circles and hollowing.', icon: 'eye-outline', color: '#4d94ff' },
  { id: 20, category: 'Hair', title: 'Wash Hair 2-3x Per Week', content: 'Over-washing strips natural oils and triggers rebound oil production. Use dry shampoo between washes if needed. When you do wash, focus shampoo on the scalp and conditioner on the ends only.', icon: 'brush-outline', color: '#ffab40' },
  { id: 21, category: 'Nutrition', title: 'Eat Omega-3 Rich Foods', content: 'Wild salmon, sardines, walnuts, and flaxseed provide omega-3 fatty acids that reduce skin inflammation, improve hydration, and support brain function. Aim for fatty fish at least twice per week.', icon: 'nutrition-outline', color: '#1de9b6' },
  { id: 22, category: 'Posture', title: 'Stretch Your Hip Flexors', content: 'Tight hip flexors from sitting cause anterior pelvic tilt which cascades into poor upper body posture. Do lunging hip flexor stretches for 60 seconds per side, twice daily. Your standing posture will visibly improve.', icon: 'body-outline', color: '#00e5ff' },
  { id: 23, category: 'Sleep', title: 'Keep Bedroom at 65-68F', content: 'Cool room temperature is critical for deep sleep. Your core body temperature needs to drop to initiate sleep cycles. Use breathable bedding and keep the room dark. Better sleep means better skin recovery.', icon: 'moon-outline', color: '#ff6090' },
  { id: 24, category: 'Grooming', title: 'Whiten Your Teeth', content: 'Yellow teeth can undermine an otherwise great appearance. Use whitening strips for 30 minutes every other day for two weeks. Maintain with whitening toothpaste. Avoid excessive coffee and red wine staining.', icon: 'happy-outline', color: '#ffab40' },
  { id: 25, category: 'Skin', title: 'Hydrate From Inside Out', content: 'Drink at least 3 liters of water daily. Add electrolytes for better cellular absorption. Dehydrated skin looks dull, shows more wrinkles, and heals slower. Track your intake with a marked water bottle.', icon: 'water-outline', color: '#00e676' },
  { id: 26, category: 'Jawline', title: 'Lower Body Fat Percentage', content: 'Facial fat obscures bone structure. Getting to 12-15% body fat reveals your natural jawline, cheekbones, and facial hollows. Focus on caloric deficit through clean eating combined with resistance training.', icon: 'fitness-outline', color: '#ff6b35' },
  { id: 27, category: 'Eyes', title: 'Use Eye Cream with Retinol', content: 'The skin around your eyes is the thinnest on your body and shows aging first. Use a dedicated eye cream with retinol and peptides nightly. Apply with your ring finger using gentle tapping motions.', icon: 'eye-outline', color: '#4d94ff' },
  { id: 28, category: 'Hair', title: 'Protect Hair from Heat', content: 'Always use heat protectant spray before blow drying or styling. Heat above 300F damages the hair cuticle permanently. Air dry when possible and use the lowest effective heat setting on styling tools.', icon: 'brush-outline', color: '#ffab40' },
  { id: 29, category: 'Nutrition', title: 'Bone Broth for Collagen', content: 'Simmered bone broth is rich in natural collagen, glycine, and minerals. Drink a cup daily for skin elasticity and gut health. The amino acids support joint, bone, and skin repair from the inside.', icon: 'nutrition-outline', color: '#1de9b6' },
  { id: 30, category: 'Posture', title: 'Strengthen Your Upper Back', content: 'Face pulls and band pull-aparts strengthen the rear delts and rhomboids that pull your shoulders back. Do 3 sets of 15 daily. Strong upper back muscles are the foundation of confident, upright posture.', icon: 'body-outline', color: '#00e5ff' },
  { id: 31, category: 'Grooming', title: 'Moisturize Your Hands', content: 'Dry, cracked hands with unkempt nails are noticed more than you think. Apply hand cream after every wash and keep nails trimmed short with clean edges. First impressions often start with a handshake.', icon: 'hand-left-outline', color: '#ffab40' },
  { id: 32, category: 'Sleep', title: 'Use a Silk Pillowcase', content: 'Silk creates less friction than cotton, reducing sleep wrinkles and preventing hair breakage. It also absorbs less moisture, keeping your skincare products on your face rather than your pillow.', icon: 'moon-outline', color: '#ff6090' },
  { id: 33, category: 'Skin', title: 'Niacinamide for Pores', content: 'Apply a 5% niacinamide serum daily to minimize pore appearance, control oil, and strengthen your skin barrier. It plays well with most other actives and rarely causes irritation. Results show within 4 weeks.', icon: 'sparkles-outline', color: '#00e676' },
];

const CATEGORY_COLORS = {
  Skin: '#00e676', Jawline: '#ff6b35', Eyes: '#4d94ff', Hair: '#ffab40',
  Nutrition: '#1de9b6', Posture: '#00e5ff', Sleep: '#ff6090', Grooming: '#ffab40',
};

const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
};

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const getTodaysTips = () => {
  const day = getDayOfYear();
  const indices = [];
  for (let i = 0; i < 3; i++) {
    indices.push((day * 3 + i) % TIPS.length);
  }
  return indices.map((idx) => TIPS[idx]);
};

const TipCard = memo(({ tip, expanded, read, onToggle, onMarkRead, index }) => (
  <Animated.View entering={FadeInRight.duration(300).delay(200 + index * 80)}>
    <AnimatedPressable onPress={onToggle}>
      <GlassCard style={[styles.tipCard, read && styles.tipCardRead]}>
        <View style={styles.tipHeader}>
          <View style={[styles.tipIcon, { backgroundColor: tip.color + '15' }]}>
            <Ionicons name={tip.icon} size={18} color={tip.color} />
          </View>
          <View style={styles.tipMeta}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <View style={[styles.categoryPill, { backgroundColor: CATEGORY_COLORS[tip.category] + '15' }]}>
              <Text style={[styles.categoryText, { color: CATEGORY_COLORS[tip.category] }]}>{tip.category}</Text>
            </View>
          </View>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} />
        </View>
        {expanded && (
          <View style={styles.tipBody}>
            <Text style={styles.tipContent}>{tip.content}</Text>
            {!read ? (
              <AnimatedPressable onPress={onMarkRead}>
                <LinearGradient colors={GRADIENTS.accent} style={styles.markReadGradient}>
                  <Ionicons name="checkmark-circle-outline" size={14} color="#fff" />
                  <Text style={styles.markReadText}>Mark as Read</Text>
                </LinearGradient>
              </AnimatedPressable>
            ) : (
              <View style={styles.readBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#00e676" />
                <Text style={styles.readBadgeText}>Read</Text>
              </View>
            )}
          </View>
        )}
      </GlassCard>
    </AnimatedPressable>
  </Animated.View>
));

const DailyTipsScreen = ({ navigation }) => {
  const [expandedTip, setExpandedTip] = useState(-1);
  const [readTips, setReadTips] = useState([]);
  const [streak, setStreak] = useState(0);
  const todaysTips = getTodaysTips();

  const loadData = useCallback(async () => {
    try {
      const [readData, streakData, lastVisit] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_READ),
        AsyncStorage.getItem(STORAGE_KEY_STREAK),
        AsyncStorage.getItem(STORAGE_KEY_LAST_VISIT),
      ]);
      if (readData) setReadTips(JSON.parse(readData));
      const todayKey = getTodayKey();
      const currentStreak = streakData ? parseInt(streakData, 10) : 0;
      if (lastVisit) {
        const lastDate = new Date(lastVisit);
        const today = new Date();
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          const newStreak = currentStreak + 1;
          setStreak(newStreak);
          await AsyncStorage.setItem(STORAGE_KEY_STREAK, String(newStreak));
        } else if (diffDays === 0) {
          setStreak(currentStreak);
        } else {
          setStreak(1);
          await AsyncStorage.setItem(STORAGE_KEY_STREAK, '1');
        }
      } else {
        setStreak(1);
        await AsyncStorage.setItem(STORAGE_KEY_STREAK, '1');
      }
      await AsyncStorage.setItem(STORAGE_KEY_LAST_VISIT, todayKey);
    } catch {}
  }, []);

  useEffect(() => { loadData(); }, []);

  const markAsRead = async (tipId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const updated = readTips.includes(tipId) ? readTips : [...readTips, tipId];
      setReadTips(updated);
      await AsyncStorage.setItem(STORAGE_KEY_READ, JSON.stringify(updated));
    } catch {}
  };

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </AnimatedPressable>
            <Text style={styles.headerTitle}>Daily Tips</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Streak Banner */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <GlassCard variant="gold" style={styles.streakBanner}>
              <View style={styles.streakRow}>
                <View style={styles.streakIconBg}>
                  <Ionicons name="flame-outline" size={24} color="#ffab40" />
                </View>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakCount}>{streak} Day{streak !== 1 ? 's' : ''}</Text>
                  <Text style={styles.streakLabel}>Tip Streak</Text>
                </View>
              </View>
              <Text style={styles.streakSubtext}>
                {streak >= 7 ? 'Incredible consistency! Keep the streak alive.' : 'Check tips daily to build your streak!'}
              </Text>
            </GlassCard>
          </Animated.View>

          {/* Hero */}
          <Animated.View entering={FadeInDown.duration(400).delay(80)}>
            <GlassCard variant="accent" style={styles.hero}>
              <View style={styles.heroIconBg}>
                <Ionicons name="bulb-outline" size={28} color={COLORS.accent} />
              </View>
              <Text style={styles.heroTitle}>Today's Tips</Text>
              <Text style={styles.heroSubtitle}>
                3 curated tips refreshed daily covering skin, jawline, eyes, hair, nutrition, posture, sleep, and grooming
              </Text>
            </GlassCard>
          </Animated.View>

          {/* Today's Tips */}
          {todaysTips.map((tip, idx) => (
            <TipCard
              key={tip.id}
              tip={tip}
              expanded={expandedTip === idx}
              read={readTips.includes(tip.id)}
              onToggle={() => { Haptics.selectionAsync(); setExpandedTip(expandedTip === idx ? -1 : idx); }}
              onMarkRead={() => markAsRead(tip.id)}
              index={idx}
            />
          ))}

          {/* All Categories */}
          <Animated.View entering={FadeInDown.duration(300).delay(500)}>
            <Text style={styles.allCategoriesTitle}>All Categories</Text>
            <View style={styles.categoriesGrid}>
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
                const count = TIPS.filter((t) => t.category === cat).length;
                return (
                  <GlassCard key={cat} style={styles.categoryCard}>
                    <View style={[styles.catDot, { backgroundColor: color }]} />
                    <Text style={styles.catName}>{cat}</Text>
                    <Text style={styles.catCount}>{count}</Text>
                  </GlassCard>
                );
              })}
            </View>
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeInDown.duration(300).delay(600)}>
            <View style={styles.statsRow}>
              <GlassCard style={styles.statCard}>
                <Text style={[styles.statValue, { color: COLORS.accent }]}>{readTips.length}</Text>
                <Text style={styles.statLabel}>Tips Read</Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Text style={[styles.statValue, { color: COLORS.purple }]}>{TIPS.length}</Text>
                <Text style={styles.statLabel}>Total Tips</Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Text style={[styles.statValue, { color: COLORS.scoreHigh }]}>{TIPS.length - readTips.length}</Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </GlassCard>
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
  scroll: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  streakBanner: { padding: 16, marginBottom: 14 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  streakIconBg: {
    width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,171,64,0.15)',
  },
  streakInfo: { flex: 1 },
  streakCount: { fontSize: 22, fontWeight: '800', color: '#ffab40' },
  streakLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  streakSubtext: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  hero: { padding: 20, marginBottom: 16, alignItems: 'center' },
  heroIconBg: {
    width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,102,255,0.15)', marginBottom: 10,
  },
  heroTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  heroSubtitle: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18 },
  tipCard: { padding: 14, marginBottom: 8 },
  tipCardRead: { borderColor: 'rgba(0,230,118,0.12)' },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tipMeta: { flex: 1 },
  tipTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  categoryPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryText: { fontSize: 9, fontWeight: '700' },
  tipBody: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  tipContent: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 12 },
  markReadGradient: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start' },
  markReadText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  readBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  readBadgeText: { fontSize: 11, color: '#00e676', fontWeight: '600' },
  allCategoriesTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16, marginBottom: 12 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { fontSize: 11, fontWeight: '600', color: COLORS.textPrimary },
  catCount: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, alignItems: 'center', padding: 14 },
  statValue: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '500' },
});

export default DailyTipsScreen;
