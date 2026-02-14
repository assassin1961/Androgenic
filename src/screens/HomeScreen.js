import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Animated, Easing, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, GRADIENTS, SHADOWS, GLASS } from '../utils/theme';
import { loadProState, getScansRemaining, isPro } from '../utils/pro';
import ProBanner from '../components/ProBanner';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [ready, setReady] = useState(false);
  const heroGlow = useRef(new Animated.Value(0.6)).current;
  const heroRotate = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const featureAnims = useRef([...Array(10)].map(() => new Animated.Value(0))).current;
  const pulseRing = useRef(new Animated.Value(1)).current;
  const btnScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadProState().then(() => setReady(true));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProState().then(() => setReady(true));
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (!ready) return;

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 8, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, friction: 6, delay: 200, useNativeDriver: true }),
    ]).start();

    // Staggered feature grid entrance
    featureAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(400 + i * 60),
        Animated.spring(anim, { toValue: 1, friction: 7, useNativeDriver: true }),
      ]).start();
    });

    // Pulsing hero glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(heroGlow, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(heroGlow, { toValue: 0.6, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Slow rotating ring
    Animated.loop(
      Animated.timing(heroRotate, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Pulse ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseRing, { toValue: 1.15, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseRing, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [ready]);

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

  const spin = heroRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const FEATURES = [
    { icon: 'flame-outline', text: '30-Day Challenge', screen: 'Challenge', color: '#ff6b35' },
    { icon: 'today-outline', text: 'Daily Routine', screen: 'RoutineTab', color: '#00e676' },
    { icon: 'bag-outline', text: 'Products', screen: 'Products', color: '#ffab40' },
    { icon: 'trophy-outline', text: 'Leaderboard', screen: 'LeaderboardTab', color: '#FFD700' },
    { icon: 'barbell-outline', text: 'Workouts', screen: 'Workout', color: '#ff5252' },
    { icon: 'water-outline', text: 'Water Tracker', screen: 'WaterTracker', color: '#00e5ff' },
    { icon: 'color-palette-outline', text: 'Skin Tone', screen: 'SkinTone', color: '#ff6090' },
    { icon: 'body-outline', text: 'Body Fat', screen: 'BodyFat', color: '#a89afa' },
    { icon: 'book-outline', text: 'Guides', screen: 'Guides', color: '#1de9b6' },
    { icon: 'nutrition-outline', text: 'Nutrition', screen: 'NutritionGuide', color: '#ffab40' },
  ];

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
            <Ionicons name="today-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconBtn}>
            <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pro Banner */}
      <View style={styles.bannerContainer}>
        <ProBanner onUpgrade={() => navigation.navigate('Paywall')} />
      </View>

      {/* Main Content */}
      <Animated.View style={[styles.mainContent, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroCenter}>
            {/* Outer rotating ring */}
            <Animated.View style={[styles.heroRingOuter, { transform: [{ rotate: spin }, { scale: pulseRing }] }]}>
              <View style={styles.ringDotTop} />
              <View style={styles.ringDotBottom} />
            </Animated.View>
            {/* Glow */}
            <Animated.View style={[styles.heroGlowCircle, { opacity: heroGlow }]} />
            {/* Icon */}
            <LinearGradient colors={GRADIENTS.accent} style={styles.heroIconBg}>
              <Ionicons name="scan" size={38} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>Analyze Your Face</Text>
          <Text style={styles.heroSubtitle}>
            AI-powered scoring across 7 categories with personalized looksmax tips
          </Text>
        </View>

        {/* Action Buttons */}
        <Animated.View style={[styles.actions, { transform: [{ scale: btnScale }] }]}>
          <TouchableOpacity onPress={handleCamera} activeOpacity={0.85}>
            <LinearGradient colors={GRADIENTS.accent} style={[styles.primaryBtn, SHADOWS.accentGlow]}>
              <Ionicons name="camera" size={22} color="#fff" />
              <Text style={styles.primaryBtnText}>Take a Selfie</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleUpload} style={[styles.secondaryBtn, GLASS.card]} activeOpacity={0.85}>
            <Ionicons name="image-outline" size={22} color={COLORS.accentLight} />
            <Text style={styles.secondaryBtnText}>Upload Photo</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Features Grid */}
        <View style={styles.features}>
          {FEATURES.map((feat, i) => (
            <Animated.View key={i} style={{
              opacity: featureAnims[i],
              transform: [{ scale: featureAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
            }}>
              <TouchableOpacity
                style={styles.featureItem}
                onPress={() => feat.screen && navigation.navigate(feat.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.featureIconBg, { backgroundColor: feat.color + '18' }]}>
                  <Ionicons name={feat.icon} size={18} color={feat.color} />
                </View>
                <Text style={styles.featureText}>{feat.text}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
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
    paddingTop: 10,
    paddingBottom: 6,
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 10,
    color: COLORS.accent,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    ...GLASS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  heroCenter: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  heroRingOuter: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: 'rgba(124,108,240,0.25)',
    borderTopColor: COLORS.accent,
    borderRightColor: COLORS.accentLight,
  },
  ringDotTop: {
    position: 'absolute',
    top: -3,
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  ringDotBottom: {
    position: 'absolute',
    bottom: -3,
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accentLight,
  },
  heroGlowCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accentGlow,
  },
  heroIconBg: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.accentGlow,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 24,
  },
  actions: {
    gap: 10,
    marginBottom: 24,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    gap: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    gap: 10,
  },
  secondaryBtnText: {
    color: COLORS.accentLight,
    fontSize: 17,
    fontWeight: '700',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: (width - 52) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});

export default HomeScreen;
