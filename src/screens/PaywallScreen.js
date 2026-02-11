import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/theme';
import { PRO_CONFIG, startFreeTrial, purchasePlan, hasUsedTrial, isPro } from '../utils/pro';

const PaywallScreen = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const trialUsed = hasUsedTrial();
  const alreadyPro = isPro();

  const handleSubscribe = async () => {
    Alert.alert(
      'Confirm Purchase',
      `Subscribe to ${PRO_CONFIG.plans.find(p => p.id === selectedPlan)?.label} plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            await purchasePlan(selectedPlan);
            Alert.alert('Welcome to PRO!', 'All features are now unlocked.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  };

  const handleStartTrial = async () => {
    await startFreeTrial();
    Alert.alert(
      'Trial Started!',
      `Your ${PRO_CONFIG.trialDays}-day free trial has begun. Enjoy all PRO features!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  if (alreadyPro) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.alreadyPro}>
          <Ionicons name="checkmark-circle" size={64} color={COLORS.scoreHigh} />
          <Text style={styles.alreadyProTitle}>You're a PRO!</Text>
          <Text style={styles.alreadyProText}>All features are already unlocked.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Close Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.proBadgeLg}>
            <Ionicons name="star" size={32} color="#000" />
          </LinearGradient>
          <Text style={styles.heroTitle}>Androgenic PRO</Text>
          <Text style={styles.heroSubtitle}>Unlock your full looksmaxxing potential</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          {PRO_CONFIG.proFeatures.map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.scoreHigh} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        <Text style={styles.plansTitle}>Choose Your Plan</Text>
        <View style={styles.plansGrid}>
          {PRO_CONFIG.plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                plan.popular && styles.planCardPopular,
              ]}>
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>POPULAR</Text>
                  </View>
                )}
                {plan.savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>{plan.savings}</Text>
                  </View>
                )}
                <Text style={styles.planLabel}>{plan.label}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
                {selectedPlan === plan.id && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} style={styles.planCheck} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={handleSubscribe} activeOpacity={0.8}>
          <LinearGradient colors={GRADIENTS.accent} style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>Subscribe Now</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Trial */}
        {!trialUsed && (
          <TouchableOpacity onPress={handleStartTrial} style={styles.trialBtn}>
            <Text style={styles.trialBtnText}>
              Start {PRO_CONFIG.trialDays}-Day Free Trial
            </Text>
          </TouchableOpacity>
        )}

        {/* Restore */}
        <TouchableOpacity onPress={() => Alert.alert('Restore', 'No previous purchases found.')} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'flex-end',
    paddingVertical: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  proBadgeLg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.gold,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  featuresSection: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  featureText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  planCard: {
    width: '100%',
    minWidth: 155,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(108,92,231,0.1)',
  },
  planCardPopular: {
    borderColor: COLORS.accent,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  savingsBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.scoreHigh,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savingsText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  planLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  planPrice: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  planPeriod: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  planCheck: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  ctaBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  trialBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
    marginBottom: 12,
  },
  trialBtnText: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  restoreText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  alreadyPro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  alreadyProTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.scoreHigh,
    marginTop: 16,
    marginBottom: 8,
  },
  alreadyProText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 24,
  },
  doneBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PaywallScreen;
