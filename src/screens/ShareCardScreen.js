import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Animated, Easing, ScrollView, Dimensions, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, getScoreColor } from '../utils/theme';
import { isPro, getCelebrityMatch } from '../utils/pro';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

const CARD_THEMES = [
  { id: 'dark', name: 'Dark', bg: ['#0a0a1a', '#13131e'], text: '#f0f0f5', accent: '#7c6cf0' },
  { id: 'midnight', name: 'Midnight', bg: ['#0d1b2a', '#1b263b'], text: '#e0e1dd', accent: '#00b4d8' },
  { id: 'ember', name: 'Ember', bg: ['#1a0a0a', '#2d1414'], text: '#ffd7d7', accent: '#ff4757' },
  { id: 'royal', name: 'Royal', bg: ['#0a0a20', '#1a1040'], text: '#d4ccff', accent: '#a89afa' },
  { id: 'gold', name: 'Gold', bg: ['#1a1500', '#2d2400'], text: '#ffe4a0', accent: '#FFD700' },
  { id: 'matrix', name: 'Matrix', bg: ['#000a00', '#001a00'], text: '#00ff41', accent: '#00e676' },
];

const ShareCardScreen = ({ route, navigation }) => {
  const { scores, imageUri } = route.params;
  const [theme, setTheme] = useState(CARD_THEMES[0]);
  const [layout, setLayout] = useState('full'); // full, minimal, stats
  const viewShotRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const pro = isPro();
  const celebrity = pro ? getCelebrityMatch(scores) : null;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = await viewShotRef.current.capture();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const uri = await viewShotRef.current.capture();
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Saved!', 'Card saved to your photo library.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  };

  const overallRating = scores.overallRating || Math.round(scores.overall / 10);
  const categories = [
    { key: 'masculinity', label: 'MAS', icon: 'shield' },
    { key: 'jawline', label: 'JAW', icon: 'fitness' },
    { key: 'eyes', label: 'EYE', icon: 'eye' },
    { key: 'cheekbones', label: 'CHK', icon: 'diamond' },
    { key: 'hair', label: 'HAR', icon: 'cut' },
    { key: 'skin', label: 'SKN', icon: 'leaf' },
    { key: 'symmetry', label: 'SYM', icon: 'git-compare' },
  ];

  const getPercentile = (score) => {
    if (score >= 90) return 'Top 5%';
    if (score >= 80) return 'Top 15%';
    if (score >= 70) return 'Top 30%';
    if (score >= 60) return 'Top 50%';
    return 'Top 65%';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Card</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} style={{ opacity: fadeAnim }}>
        {/* Preview */}
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          <LinearGradient colors={theme.bg} style={styles.card}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Text style={[styles.cardBrand, { color: theme.accent }]}>ANDROGENIC</Text>
              <Text style={[styles.cardSubBrand, { color: theme.text + '60' }]}>AI FACE ANALYSIS</Text>
            </View>

            {layout !== 'stats' && (
              <View style={styles.cardHero}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.cardPhoto} />
                ) : (
                  <View style={[styles.cardPhoto, { backgroundColor: theme.accent + '30', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="person" size={30} color={theme.accent} />
                  </View>
                )}
                <View style={styles.cardScoreSection}>
                  <Text style={[styles.cardScoreLabel, { color: theme.text + '80' }]}>OVERALL</Text>
                  <Text style={[styles.cardScore, { color: getScoreColor(scores.overall) }]}>
                    {overallRating}/10
                  </Text>
                  <Text style={[styles.cardPercentile, { color: theme.accent }]}>
                    {getPercentile(scores.overall)}
                  </Text>
                  {celebrity && layout === 'full' && (
                    <View style={[styles.cardCeleb, { backgroundColor: theme.accent + '15' }]}>
                      <Text style={[styles.cardCelebText, { color: theme.accent }]}>
                        {celebrity.image} {celebrity.name}
                      </Text>
                      <Text style={[styles.cardCelebMatch, { color: theme.text + '60' }]}>
                        {celebrity.matchPercent}% match
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Category Grid */}
            {layout !== 'minimal' && (
              <View style={styles.cardGrid}>
                {categories.map((cat) => {
                  const score = scores[cat.key] || 0;
                  return (
                    <View key={cat.key} style={[styles.cardGridItem, { borderColor: theme.text + '10' }]}>
                      <Text style={[styles.cardGridLabel, { color: theme.text + '60' }]}>{cat.label}</Text>
                      <Text style={[styles.cardGridScore, { color: getScoreColor(score) }]}>{score}</Text>
                      <View style={[styles.cardGridBar, { backgroundColor: theme.text + '10' }]}>
                        <View style={[styles.cardGridBarFill, { width: `${score}%`, backgroundColor: getScoreColor(score) }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Watermark */}
            <View style={styles.cardFooter}>
              <Text style={[styles.cardWatermark, { color: theme.text + '30' }]}>androgenic.app</Text>
              <Text style={[styles.cardDate, { color: theme.text + '30' }]}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          </LinearGradient>
        </ViewShot>

        {/* Theme Selector */}
        <Text style={styles.sectionTitle}>Theme</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeScroll} contentContainerStyle={styles.themeRow}>
          {CARD_THEMES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.themeBtn, theme.id === t.id && { borderColor: t.accent }]}
              onPress={() => { Haptics.selectionAsync(); setTheme(t); }}
            >
              <LinearGradient colors={t.bg} style={styles.themePrev}>
                <View style={[styles.themeDot, { backgroundColor: t.accent }]} />
              </LinearGradient>
              <Text style={[styles.themeName, theme.id === t.id && { color: t.accent }]}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Layout Selector */}
        <Text style={styles.sectionTitle}>Layout</Text>
        <View style={styles.layoutRow}>
          {[
            { id: 'full', label: 'Full', icon: 'grid-outline' },
            { id: 'minimal', label: 'Minimal', icon: 'remove-outline' },
            { id: 'stats', label: 'Stats Only', icon: 'stats-chart-outline' },
          ].map((l) => (
            <TouchableOpacity
              key={l.id}
              style={[styles.layoutBtn, layout === l.id && styles.layoutBtnActive]}
              onPress={() => { Haptics.selectionAsync(); setLayout(l.id); }}
            >
              <Ionicons name={l.icon} size={18} color={layout === l.id ? COLORS.accent : COLORS.textMuted} />
              <Text style={[styles.layoutText, layout === l.id && { color: COLORS.accent }]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleShare} activeOpacity={0.85} style={{ flex: 1 }}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.actionBtn}>
              <Ionicons name="share-outline" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Share</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={[styles.actionBtnOutline, { flex: 1 }]}>
            <Ionicons name="download-outline" size={20} color={COLORS.accentLight} />
            <Text style={styles.actionBtnOutlineText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { paddingHorizontal: 24 },
  card: { borderRadius: 20, padding: 20, marginBottom: 20, overflow: 'hidden' },
  cardHeader: { alignItems: 'center', marginBottom: 16 },
  cardBrand: { fontSize: 16, fontWeight: '900', letterSpacing: 4 },
  cardSubBrand: { fontSize: 8, fontWeight: '600', letterSpacing: 3, marginTop: 2 },
  cardHero: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  cardPhoto: { width: 80, height: 80, borderRadius: 40 },
  cardScoreSection: { flex: 1 },
  cardScoreLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  cardScore: { fontSize: 36, fontWeight: '900' },
  cardPercentile: { fontSize: 13, fontWeight: '700', marginTop: -2 },
  cardCeleb: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  cardCelebText: { fontSize: 11, fontWeight: '700' },
  cardCelebMatch: { fontSize: 9 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cardGridItem: { width: (CARD_WIDTH - 52) / 4, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 8, alignItems: 'center', borderWidth: 1 },
  cardGridLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  cardGridScore: { fontSize: 18, fontWeight: '800' },
  cardGridBar: { height: 3, width: '100%', borderRadius: 2, marginTop: 4, overflow: 'hidden' },
  cardGridBarFill: { height: '100%', borderRadius: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  cardWatermark: { fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  cardDate: { fontSize: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },
  themeScroll: { marginBottom: 16, maxHeight: 80 },
  themeRow: { gap: 10 },
  themeBtn: { alignItems: 'center', gap: 6, borderWidth: 2, borderColor: 'transparent', borderRadius: 12, padding: 4 },
  themePrev: { width: 50, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  themeDot: { width: 12, height: 12, borderRadius: 6 },
  themeName: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  layoutRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  layoutBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  layoutBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '10' },
  layoutText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, gap: 8 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  actionBtnOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, gap: 8, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.accent + '40' },
  actionBtnOutlineText: { color: COLORS.accentLight, fontSize: 16, fontWeight: '700' },
});

export default ShareCardScreen;
