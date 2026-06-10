import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn, useSharedValue, useAnimatedStyle, withTiming, withSpring,
  interpolate, runOnJS, Easing,
} from 'react-native-reanimated';
import { M, GRAD, RADIUS, SPACE, SHADOW, TYPE, gradVariantFor } from '../theme';
import { useMuzz } from '../store';
import { rankMatches } from '../butterfly';
import { PhotoTile, Verified } from '../components/ui';
import Butterfly from '../components/Butterfly';
import * as H from '../haptics';

const { width, height } = Dimensions.get('window');
const CARD_W = width - SPACE.lg * 2;

// Muzz-style discovery: a full-screen card stack with circular action
// buttons. The AI butterfly pre-sorts the deck by compatibility, so the
// best match is always on top — swiping is optional, not required.
export default function DiscoverScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const muzz = useMuzz();
  const {
    me, feedback, matches, butterflyAuto,
    likePerson, passPerson, undoSwipe, likesRemaining, useInstantChat,
  } = muzz;
  const [photoIdx, setPhotoIdx] = React.useState(0);
  const [lastSwiped, setLastSwiped] = React.useState(null);

  const stack = useMemo(
    () => rankMatches(me, feedback).filter(
      (m) => feedback[m.person.id] !== 'liked' && !matches.includes(m.person.id)
    ),
    [me, feedback, matches]
  );
  const top = stack[0];
  const next = stack[1];

  const tx = useSharedValue(0);

  const commit = useCallback((dir, personId, score) => {
    setLastSwiped(personId);
    setPhotoIdx(0);
    if (dir > 0) {
      likePerson(personId, { mutual: true });
      navigation.navigate('MuzzMatchReveal', { personId, score });
    } else {
      passPerson(personId);
    }
    tx.value = 0;
  }, [likePerson, passPerson, navigation]);

  const rewind = () => {
    if (!lastSwiped) return;
    if (!me.gold) {
      H.warn();
      navigation.navigate('MuzzGold');
      return;
    }
    H.press();
    undoSwipe(lastSwiped);
    setLastSwiped(null);
  };

  const swipe = (dir) => {
    if (!top) return;
    if (dir > 0 && likesRemaining() <= 0) {
      H.warn();
      navigation.navigate('MuzzGold');
      return;
    }
    H.press();
    const { id } = top.person;
    const score = top.score;
    tx.value = withTiming(dir * width * 1.3, { duration: 280, easing: Easing.in(Easing.quad) }, () => {
      runOnJS(commit)(dir, id, score);
    });
  };

  const instant = () => {
    if (!top) return;
    if (useInstantChat(top.person.id)) {
      H.success();
      navigation.navigate('MuzzChat', { personId: top.person.id });
    } else {
      H.warn();
      navigation.navigate('MuzzGold');
    }
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { rotate: `${interpolate(tx.value, [-width, 0, width], [-11, 0, 11])}deg` },
    ],
  }));
  const nextStyle = useAnimatedStyle(() => {
    const p = Math.min(1, Math.abs(tx.value) / width);
    return { transform: [{ scale: 0.94 + p * 0.06 }, { translateY: 14 - p * 14 }] };
  });

  const remaining = likesRemaining();

  return (
    <View style={styles.container}>
      {/* Muzz-style header: lowercase serif wordmark + actions */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Text style={styles.wordmark}>butterfly</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={() => { H.tap(); navigation.navigate('MuzzButterflyPicks'); }} style={styles.aiBtn}>
            <Ionicons name="sparkles" size={15} color={M.butterfly} />
            <Text style={styles.aiBtnText}>AI picks</Text>
          </Pressable>
          <Pressable onPress={() => { H.tap(); navigation.navigate('MuzzSettings'); }} style={styles.iconBtn}>
            <Ionicons name="options-outline" size={24} color={M.text} />
          </Pressable>
        </View>
      </View>

      {butterflyAuto && top && (
        <View style={styles.autoChip}>
          <Ionicons name="sparkles" size={12} color={M.butterfly} />
          <Text style={styles.autoChipText}>Sorted by your butterfly — top pick {top.score}% compatible</Text>
        </View>
      )}

      {/* Card stack */}
      <View style={styles.deck}>
        {!top ? (
          <Animated.View entering={FadeIn} style={styles.empty}>
            <Butterfly size={120} />
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptySub}>New people join every day. Your butterfly will keep searching for you.</Text>
          </Animated.View>
        ) : (
          <>
            {next && (
              <Animated.View style={[styles.cardWrap, nextStyle]} pointerEvents="none">
                <Card m={next} />
              </Animated.View>
            )}
            <Animated.View key={top.person.id} style={[styles.cardWrap, cardStyle]}>
              <Card m={top} photoIdx={photoIdx} />
              {/* photo pager tap zones: left = prev photo, right = next, centre = profile */}
              <View style={StyleSheet.absoluteFill}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <Pressable style={{ flex: 1 }} onPress={() => { H.select(); setPhotoIdx((i) => Math.max(0, i - 1)); }} />
                  <Pressable style={{ flex: 1.2 }} onPress={() => { H.tap(); navigation.navigate('MuzzProfileDetail', { personId: top.person.id }); }} />
                  <Pressable style={{ flex: 1 }} onPress={() => { H.select(); setPhotoIdx((i) => Math.min(2, i + 1)); }} />
                </View>
              </View>
            </Animated.View>
          </>
        )}
      </View>

      {/* Muzz-style circular action buttons: rewind · pass · instant · like */}
      {top && (
        <View style={styles.actions}>
          <Pressable onPress={rewind} style={[styles.actBtn, styles.rewindBtn, !lastSwiped && { opacity: 0.4 }]}>
            <Ionicons name="arrow-undo" size={22} color={M.gold} />
          </Pressable>
          <Pressable onPress={() => swipe(-1)} style={[styles.actBtn, styles.passBtn]}>
            <Ionicons name="close" size={32} color="#B9B6C3" />
          </Pressable>
          <Pressable onPress={instant} style={[styles.actBtn, styles.instantBtn]}>
            <Ionicons name="flash" size={24} color="#fff" />
          </Pressable>
          <Pressable onPress={() => swipe(1)} style={[styles.actBtn, styles.likeBtn]}>
            <Ionicons name="heart" size={32} color="#fff" />
          </Pressable>
        </View>
      )}
      {top && !me.gold && (
        <Text style={styles.likesLeft}>
          {remaining === Infinity ? '' : `${remaining} likes left · resets every 12h`}
        </Text>
      )}
    </View>
  );
}

function Card({ m, photoIdx = 0 }) {
  const p = m.person;
  return (
    <PhotoTile
      seed={p.id} name={p.name} rounded={RADIUS.xl} style={styles.card}
      gradient={gradVariantFor(p.id, photoIdx)} silhouette={300}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.12)', 'transparent', 'transparent', 'rgba(13,10,18,0.88)']}
        style={StyleSheet.absoluteFill}
      />
      {/* photo pager dots */}
      <View style={styles.pager}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.pagerSeg, i === photoIdx && styles.pagerSegOn]} />
        ))}
      </View>
      {p.online && (
        <View style={styles.onlinePill}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Online now</Text>
        </View>
      )}
      <View style={styles.aiBadge}>
        <Ionicons name="sparkles" size={11} color="#fff" />
        <Text style={styles.aiBadgeText}>{m.score}%</Text>
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.cardName}>{p.name}, {p.age}</Text>
          {p.verified && <View style={{ marginLeft: 8 }}><Verified size={18} /></View>}
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="briefcase" size={13} color="rgba(255,255,255,0.92)" />
          <Text style={styles.metaText}>{p.job}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location" size={13} color="rgba(255,255,255,0.92)" />
          <Text style={styles.metaText}>{p.distance} miles away · {p.city}</Text>
        </View>
        <View style={styles.tagRow}>
          {[p.sect, p.prayerLevel, p.intention].filter(Boolean).map((t) => (
            <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
          ))}
        </View>
      </View>
    </PhotoTile>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: M.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACE.lg, paddingBottom: 4,
  },
  wordmark: {
    fontSize: 30, fontWeight: '800', color: M.primary, letterSpacing: -0.5,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: M.butterflySoft, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: RADIUS.pill,
  },
  aiBtnText: { color: M.butterfly, fontWeight: '800', fontSize: 13 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  autoChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: RADIUS.pill, backgroundColor: M.butterflySoft, marginBottom: 6,
  },
  autoChipText: { color: M.butterfly, fontWeight: '700', fontSize: 11.5 },
  deck: { flex: 1, marginHorizontal: SPACE.lg, marginBottom: 6 },
  cardWrap: { ...StyleSheet.absoluteFillObject },
  card: { flex: 1, ...SHADOW.card },
  pager: {
    position: 'absolute', top: 8, left: 14, right: 14,
    flexDirection: 'row', gap: 5,
  },
  pagerSeg: { flex: 1, height: 3.5, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' },
  pagerSegOn: { backgroundColor: '#fff' },
  onlinePill: {
    position: 'absolute', top: 20, left: 14, flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(13,10,18,0.45)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill,
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: M.online },
  onlineText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  aiBadge: {
    position: 'absolute', top: 20, right: 14, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(139,92,246,0.92)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.pill,
  },
  aiBadgeText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  cardInfo: { position: 'absolute', left: 18, right: 18, bottom: 18 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  cardName: { color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  metaText: { color: 'rgba(255,255,255,0.92)', fontWeight: '600', fontSize: 14 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 11, paddingVertical: 5,
    borderRadius: RADIUS.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
  },
  tagText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  actions: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22,
    paddingTop: 12, paddingBottom: 4,
  },
  actBtn: { alignItems: 'center', justifyContent: 'center', ...SHADOW.soft },
  rewindBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', borderWidth: 1, borderColor: M.border },
  passBtn: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#fff', borderWidth: 1, borderColor: M.border },
  instantBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: M.gold, ...SHADOW.card },
  likeBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: M.primary, ...SHADOW.primary },
  likesLeft: { ...TYPE.caption, color: M.textMuted, textAlign: 'center', marginBottom: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACE.xxl },
  emptyTitle: { ...TYPE.h1, marginTop: 14 },
  emptySub: { ...TYPE.soft, textAlign: 'center', marginTop: 8, fontSize: 15, lineHeight: 21 },
});
