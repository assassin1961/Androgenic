import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Alert, Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { COLORS, GRADIENTS } from '../utils/theme';

const PIN_KEY = 'androgenic_pin';
const LOCK_KEY = 'androgenic_lock_enabled';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30000; // 30 seconds

const AppLockScreen = ({ onUnlock, isSetup = false }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(isSetup ? 'create' : 'enter'); // create, confirm, enter
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    checkBiometrics();
    if (!isSetup) tryBiometric();
  }, []);

  useEffect(() => {
    // Animate dots
    dotAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i < pin.length ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });

    if (pin.length === 4) {
      handlePinComplete(pin);
    }
  }, [pin]);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);
  };

  const tryBiometric = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!compatible || !enrolled) return;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Androgenic',
      cancelLabel: 'Use PIN',
      disableDeviceFallback: true,
    });

    if (result.success) {
      onUnlock();
    }
  };

  const handlePinComplete = async (enteredPin) => {
    const now = Date.now();
    if (lockedUntil > now) {
      shakeError();
      setPin('');
      return;
    }

    if (step === 'create') {
      setConfirmPin(enteredPin);
      setStep('confirm');
      setPin('');
      return;
    }

    if (step === 'confirm') {
      if (enteredPin === confirmPin) {
        await SecureStore.setItemAsync(PIN_KEY, enteredPin);
        await SecureStore.setItemAsync(LOCK_KEY, 'true');
        onUnlock();
      } else {
        shakeError();
        setStep('create');
        setConfirmPin('');
        setPin('');
        Alert.alert('Mismatch', 'PINs did not match. Try again.');
      }
      return;
    }

    // Verify PIN
    const storedPin = await SecureStore.getItemAsync(PIN_KEY);
    if (enteredPin === storedPin) {
      setAttempts(0);
      onUnlock();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      shakeError();
      Vibration.vibrate(200);
      setPin('');

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_DURATION);
        Alert.alert(
          'Too Many Attempts',
          `App locked for ${LOCKOUT_DURATION / 1000} seconds.`
        );
        setTimeout(() => setLockedUntil(0), LOCKOUT_DURATION);
      }
    }
  };

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const pressKey = (num) => {
    if (pin.length < 4) {
      setPin((p) => p + num);
    }
  };

  const deleteKey = () => {
    setPin((p) => p.slice(0, -1));
  };

  const isLocked = lockedUntil > Date.now();
  const title = step === 'create' ? 'Create PIN' : step === 'confirm' ? 'Confirm PIN' : 'Enter PIN';
  const subtitle = step === 'create'
    ? 'Set a 4-digit PIN to secure your data'
    : step === 'confirm'
    ? 'Re-enter your PIN to confirm'
    : isLocked
    ? 'Too many attempts. Please wait.'
    : attempts > 0
    ? `Incorrect PIN. ${MAX_ATTEMPTS - attempts} attempts left.`
    : 'Enter your PIN to unlock';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient colors={['#0a0a0a', '#0d0d18', '#0a0a0a']} style={styles.bg}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <LinearGradient colors={GRADIENTS.accent} style={styles.logoCircle}>
            <Ionicons name="lock-closed" size={32} color="#fff" />
          </LinearGradient>
          <Text style={styles.logoText}>ANDROGENIC</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* PIN Dots */}
        <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
          {[0, 1, 2, 3].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: dotAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [COLORS.bgCard, COLORS.accent],
                  }),
                  transform: [{
                    scale: dotAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.3],
                    }),
                  }],
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Keypad */}
        <View style={styles.keypad}>
          {[[1, 2, 3], [4, 5, 6], [7, 8, 9], ['bio', 0, 'del']].map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map((key) => {
                if (key === 'bio') {
                  return biometricAvailable && !isSetup ? (
                    <TouchableOpacity key="bio" style={styles.key} onPress={tryBiometric}>
                      <Ionicons name="finger-print" size={28} color={COLORS.accent} />
                    </TouchableOpacity>
                  ) : (
                    <View key="bio" style={styles.keyEmpty} />
                  );
                }
                if (key === 'del') {
                  return (
                    <TouchableOpacity key="del" style={styles.key} onPress={deleteKey}>
                      <Ionicons name="backspace-outline" size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.key}
                    onPress={() => pressKey(String(key))}
                    disabled={isLocked}
                    activeOpacity={0.5}
                  >
                    <Text style={styles.keyText}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Helper to check if lock is enabled
export const isLockEnabled = async () => {
  try {
    const val = await SecureStore.getItemAsync(LOCK_KEY);
    return val === 'true';
  } catch {
    return false;
  }
};

export const disableLock = async () => {
  try {
    await SecureStore.deleteItemAsync(LOCK_KEY);
    await SecureStore.deleteItemAsync(PIN_KEY);
  } catch {}
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 28,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  keypad: {
    width: '100%',
    maxWidth: 280,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  keyEmpty: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

export default AppLockScreen;
