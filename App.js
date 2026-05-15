import React, { useState, useEffect } from 'react';
import { StatusBar, View, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

const isNative = Platform.OS !== 'web';

export default function App() {
  const [locked, setLocked] = useState(false);
  const [checkingLock, setCheckingLock] = useState(isNative);

  useEffect(() => {
    if (!isNative) return;
    (async () => {
      try {
        const { isLockEnabled } = require('./src/screens/AppLockScreen');
        const { loadToken } = require('./src/services/api');
        const [lockEnabled] = await Promise.all([isLockEnabled(), loadToken()]);
        setLocked(lockEnabled);
      } catch {}
      setCheckingLock(false);
    })();

    return () => {
      try {
        const { endIAP } = require('./src/services/iapService');
        endIAP();
      } catch {}
    };
  }, []);

  if (checkingLock) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <AppNavigator />
      {isNative && locked && (() => {
        const AppLockScreen = require('./src/screens/AppLockScreen').default;
        return <AppLockScreen onUnlock={() => setLocked(false)} />;
      })()}
    </>
  );
}
