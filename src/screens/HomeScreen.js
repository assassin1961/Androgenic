import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, GRADIENTS } from '../utils/theme';
import { loadProState, getScansRemaining, isPro } from '../utils/pro';
import ProBanner from '../components/ProBanner';

const HomeScreen = ({ navigation }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadProState().then(() => setReady(true));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProState().then(() => setReady(true));
    });
    return unsubscribe;
  }, [navigation]);

  const handleCamera = async () => {
    if (!isPro() && getScansRemaining() <= 0) {
      navigation.navigate('Paywall');
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required to take a selfie.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      navigation.navigate('Analyzing', { imageUri: result.assets[0].uri });
    }
  };

  const handleUpload = async () => {
    if (!isPro() && getScansRemaining() <= 0) {
      navigation.navigate('Paywall');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Photo library permission is required to upload a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      navigation.navigate('Analyzing', { imageUri: result.assets[0].uri });
    }
  };

  if (!ready) return <View style={styles.container} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgPrimary} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>ANDROGENIC</Text>
          <Text style={styles.tagline}>AI Face Analysis</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => navigation.navigate('Routine')} style={styles.iconBtn}>
            <Ionicons name="today-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconBtn}>
            <Ionicons name="person-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pro Banner */}
      <View style={styles.bannerContainer}>
        <ProBanner onUpgrade={() => navigation.navigate('Paywall')} />
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient
            colors={['rgba(108,92,231,0.15)', 'rgba(108,92,231,0.05)']}
            style={styles.heroGlow}
          >
            <View style={styles.faceIcon}>
              <Ionicons name="scan-outline" size={64} color={COLORS.accent} />
            </View>
          </LinearGradient>
          <Text style={styles.heroTitle}>Analyze Your Face</Text>
          <Text style={styles.heroSubtitle}>
            Get detailed scores across 7 categories with personalized improvement tips
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleCamera} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.primaryBtn}>
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.primaryBtnText}>Take a Selfie</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleUpload} style={styles.secondaryBtn} activeOpacity={0.8}>
            <Ionicons name="image-outline" size={24} color={COLORS.accent} />
            <Text style={styles.secondaryBtnText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Features Grid */}
        <View style={styles.features}>
          {[
            { icon: 'flame-outline', text: '30-Day Challenge', screen: 'Challenge' },
            { icon: 'today-outline', text: 'Daily Routine', screen: 'RoutineTab' },
            { icon: 'bag-outline', text: 'Products', screen: 'Products' },
            { icon: 'trophy-outline', text: 'Leaderboard', screen: 'LeaderboardTab' },
          ].map((feat, i) => (
            <TouchableOpacity
              key={i}
              style={styles.featureItem}
              onPress={() => feat.screen && navigation.navigate(feat.screen)}
              activeOpacity={feat.screen ? 0.7 : 1}
            >
              <Ionicons name={feat.icon} size={20} color={COLORS.accent} />
              <Text style={styles.featureText}>{feat.text}</Text>
            </TouchableOpacity>
          ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: '600',
    letterSpacing: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  faceIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.accent,
    gap: 10,
  },
  secondaryBtnText: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});

export default HomeScreen;
