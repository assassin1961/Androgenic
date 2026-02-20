import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/theme';
import { register, login } from '../services/api';

const AuthScreen = ({ navigation, onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Error', 'Email and password are required.');
    }
    if (mode === 'register' && password.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters.');
    }

    try {
      setLoading(true);
      if (mode === 'register') {
        await register(email.trim(), password, displayName.trim() || undefined);
      } else {
        await login(email.trim(), password);
      }
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (onAuthSuccess) onAuthSuccess();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoSection}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.logoBadge}>
              <Ionicons name="diamond" size={32} color="#000" />
            </LinearGradient>
            <Text style={styles.logoText}>ANDROGENIC</Text>
            <Text style={styles.logoSub}>AI-Powered Face Analysis</Text>
          </View>

          {/* Toggle */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'login' && styles.toggleActive]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'register' && styles.toggleActive]}
              onPress={() => setMode('register')}
            >
              <Text style={[styles.toggleText, mode === 'register' && styles.toggleTextActive]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'register' && (
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Display Name (optional)"
                  placeholderTextColor={COLORS.textMuted}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
              <LinearGradient colors={GRADIENTS.gold} style={styles.submitBtn}>
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.submitText}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Skip */}
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Continue without account</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Your data is synced securely and encrypted in transit.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 40 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoBadge: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoText: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 3 },
  logoSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  toggleRow: { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 4, marginBottom: 24 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleActive: { backgroundColor: COLORS.accent },
  toggleText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  toggleTextActive: { color: '#fff' },
  form: { gap: 14, marginBottom: 20 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  eyeBtn: { padding: 4 },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitText: { fontSize: 16, fontWeight: '800', color: '#000' },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { color: COLORS.textMuted, fontSize: 14, textDecorationLine: 'underline' },
  disclaimer: { textAlign: 'center', fontSize: 10, color: COLORS.textMuted, lineHeight: 14, marginTop: 12, paddingHorizontal: 20 },
});

export default AuthScreen;
