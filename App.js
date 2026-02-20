import React, { useState, useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import AppLockScreen, { isLockEnabled } from './src/screens/AppLockScreen';
import { endIAP } from './src/services/iapService';
import { loadToken } from './src/services/api';

export default function App() {
  const [locked, setLocked] = useState(false);
  const [checkingLock, setCheckingLock] = useState(true);

  useEffect(() => {
    // Load auth token and check lock in parallel
    Promise.all([
      isLockEnabled(),
      loadToken(),
    ]).then(([lockEnabled]) => {
      setLocked(lockEnabled);
      setCheckingLock(false);
    });

    return () => {
      endIAP();
    };
  }, []);

  if (checkingLock) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <AppNavigator />
      {locked && (
        <AppLockScreen onUnlock={() => setLocked(false)} />
      )}
    </>
  );
}
