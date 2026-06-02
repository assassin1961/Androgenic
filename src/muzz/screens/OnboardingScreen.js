import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable, SafeAreaView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInRight, FadeInDown } from 'react-native-reanimated';
import { M, GRAD, RADIUS, SPACE, SHADOW, TYPE } from '../theme';
import { INTERESTS, VALUES, INTENTIONS } from '../data';
import { useMuzz } from '../store';
import { GButton, Chip } from '../components/ui';
import Butterfly from '../components/Butterfly';
import * as H from '../haptics';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { completeOnboarding } = useMuzz();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('27');
  const [gender, setGender] = useState('Man');
  const [job, setJob] = useState('');
  const [intention, setIntention] = useState('Marriage');
  const [interests, setInterests] = useState([]);
  const [values, setValues] = useState([]);
  const [bio, setBio] = useState('');

  const steps = ['Welcome', 'You', 'Looking for', 'Interests', 'Values', 'Butterfly'];
  const total = steps.length;

  const toggle = (arr, set, v, max) => {
    if (arr.includes(v)) set(arr.filter((x) => x !== v));
    else if (!max || arr.length < max) set([...arr, v]);
    H.select();
  };

  const canNext = () => {
    if (step === 1) return name.trim().length > 1;
    if (step === 3) return interests.length >= 3;
    if (step === 4) return values.length >= 2;
    return true;
  };

  const next = () => {
    H.press();
    if (step < total - 1) setStep(step + 1);
    else completeOnboarding({ name: name.trim(), age: Number(age) || 27, gender, job: job.trim(), intention, interests, values, bio: bio.trim() });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* progress */}
      <View style={styles.progressRow}>
        {steps.map((_, i) => (
          <View key={i} style={[styles.progressSeg, { backgroundColor: i <= step ? M.primary : M.border }]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <Animated.View entering={FadeIn} style={styles.welcome}>
            <View style={styles.bfWrap}><Butterfly size={150} /></View>
            <Text style={styles.logo}>muzz<Text style={{ color: M.butterfly }}>·ai</Text></Text>
            <Text style={styles.welcomeTitle}>Dating, without the swiping</Text>
            <Text style={styles.welcomeSub}>
              Meet your AI Butterfly. It learns who you are, then quietly finds the people you'll actually click with — and brings them to you.
            </Text>
            <View style={styles.featureList}>
              {[
                ['sparkles', 'Auto-matching — no endless swiping'],
                ['shield-checkmark', 'Verified, marriage-minded community'],
                ['people', 'Muzz Social to share your world'],
              ].map(([ic, t]) => (
                <View key={t} style={styles.featureRow}>
                  <View style={styles.featureIcon}><Ionicons name={ic} size={16} color={M.primary} /></View>
                  <Text style={styles.featureText}>{t}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {step === 1 && (
          <Animated.View entering={FadeInRight}>
            <Text style={styles.q}>Tell us about you</Text>
            <Text style={styles.label}>First name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={M.textMuted} style={styles.input} />
            <Text style={styles.label}>Age</Text>
            <TextInput value={age} onChangeText={(t) => setAge(t.replace(/[^0-9]/g, '').slice(0, 2))} keyboardType="number-pad" style={styles.input} />
            <Text style={styles.label}>I am a</Text>
            <View style={styles.row}>
              {['Man', 'Woman'].map((g) => (
                <Chip key={g} label={g} active={gender === g} onPress={() => setGender(g)} />
              ))}
            </View>
            <Text style={styles.label}>Job / occupation</Text>
            <TextInput value={job} onChangeText={setJob} placeholder="What do you do?" placeholderTextColor={M.textMuted} style={styles.input} />
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={FadeInRight}>
            <Text style={styles.q}>What are you here for?</Text>
            <Text style={styles.helper}>The butterfly prioritises people who want the same.</Text>
            {INTENTIONS.map((opt) => (
              <Pressable key={opt} onPress={() => { setIntention(opt); H.select(); }} style={[styles.bigOpt, intention === opt && styles.bigOptActive]}>
                <Text style={[styles.bigOptText, intention === opt && { color: M.primary }]}>{opt}</Text>
                {intention === opt && <Ionicons name="checkmark-circle" size={22} color={M.primary} />}
              </Pressable>
            ))}
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View entering={FadeInRight}>
            <Text style={styles.q}>What do you love?</Text>
            <Text style={styles.helper}>Pick at least 3 — these teach the butterfly.</Text>
            <View style={styles.wrap}>
              {INTERESTS.map((i) => (
                <Chip key={i} label={i} active={interests.includes(i)} onPress={() => toggle(interests, setInterests, i, 8)} />
              ))}
            </View>
          </Animated.View>
        )}

        {step === 4 && (
          <Animated.View entering={FadeInRight}>
            <Text style={styles.q}>What matters to you?</Text>
            <Text style={styles.helper}>Pick at least 2 values.</Text>
            <View style={styles.wrap}>
              {VALUES.map((v) => (
                <Chip key={v} label={v} active={values.includes(v)} color={M.butterfly} onPress={() => toggle(values, setValues, v, 5)} />
              ))}
            </View>
            <Text style={[styles.label, { marginTop: 20 }]}>A line about you (optional)</Text>
            <TextInput value={bio} onChangeText={setBio} placeholder="Say something real…" placeholderTextColor={M.textMuted} multiline style={[styles.input, { height: 90, textAlignVertical: 'top' }]} />
          </Animated.View>
        )}

        {step === 5 && (
          <Animated.View entering={FadeIn} style={styles.welcome}>
            <View style={styles.bfWrap}><Butterfly size={160} /></View>
            <Text style={styles.welcomeTitle}>Your butterfly is ready</Text>
            <Text style={styles.welcomeSub}>
              {name ? `Nice to meet you, ${name}. ` : ''}I've learned {interests.length} interests and {values.length} values. From now on, I'll fly out and bring your best matches straight to you — no swiping required.
            </Text>
            <Animated.View entering={FadeInDown.delay(300)} style={styles.statRow}>
              {[['Interests', interests.length], ['Values', values.length], ['Daily picks', '∞']].map(([l, v]) => (
                <View key={l} style={styles.stat}>
                  <Text style={styles.statVal}>{v}</Text>
                  <Text style={styles.statLabel}>{l}</Text>
                </View>
              ))}
            </Animated.View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && step < total - 1 && (
          <Pressable onPress={() => { setStep(step - 1); H.tap(); }} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={M.textSoft} />
          </Pressable>
        )}
        <GButton
          label={step === 0 ? 'Get started' : step === total - 1 ? 'Release the butterfly' : 'Continue'}
          icon={step === total - 1 ? 'sparkles' : undefined}
          onPress={next}
          gradient={step === total - 1 ? GRAD.butterfly : GRAD.primary}
          style={{ flex: 1 }}
          disabled={!canNext()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: M.bg },
  progressRow: { flexDirection: 'row', paddingHorizontal: SPACE.xl, paddingTop: 12, gap: 5 },
  progressSeg: { flex: 1, height: 4, borderRadius: 2 },
  scroll: { padding: SPACE.xl, paddingBottom: 30, flexGrow: 1 },
  welcome: { alignItems: 'center', paddingTop: 10 },
  bfWrap: { height: 170, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 34, fontWeight: '900', color: M.primary, letterSpacing: -1, marginTop: 4 },
  welcomeTitle: { ...TYPE.h1, fontSize: 26, textAlign: 'center', marginTop: 18 },
  welcomeSub: { ...TYPE.soft, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 12, paddingHorizontal: 6 },
  featureList: { marginTop: 26, alignSelf: 'stretch', gap: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: M.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  featureText: { ...TYPE.body, fontWeight: '600' },
  q: { ...TYPE.hero, fontSize: 27, marginBottom: 6 },
  helper: { ...TYPE.soft, marginBottom: 18 },
  label: { ...TYPE.caption, color: M.textSoft, marginTop: 16, marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: M.bgInput, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: M.text, fontWeight: '600',
  },
  row: { flexDirection: 'row', marginTop: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  bigOpt: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: M.bgSoft, borderRadius: RADIUS.md, padding: 18, marginBottom: 12,
    borderWidth: 1.5, borderColor: M.border,
  },
  bigOptActive: { borderColor: M.primary, backgroundColor: M.primarySoft },
  bigOptText: { ...TYPE.h3 },
  statRow: { flexDirection: 'row', marginTop: 30, gap: 14 },
  stat: { flex: 1, backgroundColor: M.bgSoft, borderRadius: RADIUS.md, paddingVertical: 18, alignItems: 'center' },
  statVal: { fontSize: 26, fontWeight: '900', color: M.butterfly },
  statLabel: { ...TYPE.caption, marginTop: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', padding: SPACE.xl, gap: 12 },
  back: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: M.border, alignItems: 'center', justifyContent: 'center' },
});
