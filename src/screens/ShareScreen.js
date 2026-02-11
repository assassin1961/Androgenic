import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Share, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { COLORS, GRADIENTS, getScoreColor, getScoreLabel } from '../utils/theme';
import { CATEGORY_INFO } from '../utils/faceAnalysis';
import { isPro, canAccessCategory } from '../utils/pro';

const ShareScreen = ({ route, navigation }) => {
  const { scores } = route.params;
  const viewShotRef = useRef();
  const pro = isPro();

  const categories = ['masculinity', 'jawline', 'eyes', 'cheekbones', 'hair', 'skin', 'symmetry']
    .filter((cat) => pro || canAccessCategory(cat));

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your Androgenic results' });
      } else {
        await Share.share({ message: `My Androgenic Score: ${scores.overallRating}/10! Check out your face analysis at Androgenic.` });
      }
    } catch (e) {
      console.warn('Share error:', e);
      Alert.alert('Error', 'Failed to share. Try again.');
    }
  };

  const handleSave = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      const filename = `androgenic_${Date.now()}.png`;
      const dest = FileSystem.documentDirectory + filename;
      await FileSystem.copyAsync({ from: uri, to: dest });
      Alert.alert('Saved!', 'Your result card has been saved.');
    } catch (e) {
      console.warn('Save error:', e);
      Alert.alert('Error', 'Failed to save image.');
    }
  };

  const handleCopyText = async () => {
    const lines = [`ANDROGENIC - Face Analysis`, `Overall: ${scores.overallRating}/10`];
    categories.forEach((cat) => {
      lines.push(`${CATEGORY_INFO[cat].label}: ${scores[cat]} (${getScoreLabel(scores[cat])})`);
    });
    await Share.share({ message: lines.join('\n') });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Results</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Shareable Card */}
      <View style={styles.cardWrapper}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          <LinearGradient colors={['#1a1025', '#0a0a12', '#0a1020']} style={styles.shareCard}>
            {/* Branding */}
            <View style={styles.cardHeader}>
              <LinearGradient colors={GRADIENTS.accent} style={styles.miniLogo}>
                <Text style={styles.miniLogoText}>A</Text>
              </LinearGradient>
              <Text style={styles.cardBrand}>ANDROGENIC</Text>
            </View>

            {/* Overall Score */}
            <View style={styles.overallCircle}>
              <Text style={styles.overallScore}>{scores.overallRating}</Text>
              <Text style={styles.overallOf}>/10</Text>
            </View>
            <Text style={styles.overallLabel}>
              {scores.overallRating >= 8 ? 'Elite' : scores.overallRating >= 6 ? 'Above Average' : scores.overallRating >= 4 ? 'Average' : 'Developing'}
            </Text>

            {/* Score Grid */}
            <View style={styles.scoreGrid}>
              {categories.map((cat) => {
                const color = getScoreColor(scores[cat]);
                return (
                  <View key={cat} style={styles.scoreItem}>
                    <Text style={styles.scoreCatLabel}>{CATEGORY_INFO[cat].label}</Text>
                    <Text style={[styles.scoreValue, { color }]}>{scores[cat]}</Text>
                    <View style={styles.miniBar}>
                      <View style={[styles.miniBarFill, { width: `${scores[cat]}%`, backgroundColor: color }]} />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Watermark */}
            <Text style={styles.watermark}>androgenic.app</Text>
          </LinearGradient>
        </ViewShot>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleShare} activeOpacity={0.8}>
          <LinearGradient colors={GRADIENTS.accent} style={styles.shareBtn}>
            <Ionicons name="share-social" size={20} color="#fff" />
            <Text style={styles.shareBtnText}>Share Image</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.rowBtns}>
          <TouchableOpacity onPress={handleSave} style={styles.secondBtn}>
            <Ionicons name="download-outline" size={20} color={COLORS.accent} />
            <Text style={styles.secondBtnText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCopyText} style={styles.secondBtn}>
            <Ionicons name="copy-outline" size={20} color={COLORS.accent} />
            <Text style={styles.secondBtnText}>Copy Text</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  shareCard: {
    width: 300,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108,92,231,0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  miniLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniLogoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  cardBrand: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  overallCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  overallScore: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  overallOf: {
    fontSize: 24,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  overallLabel: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  scoreGrid: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreCatLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    width: 80,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '800',
    width: 30,
    textAlign: 'right',
  },
  miniBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  watermark: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    fontWeight: '500',
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  rowBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  secondBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  secondBtnText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ShareScreen;
