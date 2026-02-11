import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import AnalyzingScreen from '../screens/AnalyzingScreen';
import ResultsScreen from '../screens/ResultsScreen';
import TipsScreen from '../screens/TipsScreen';
import PaywallScreen from '../screens/PaywallScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProgressScreen from '../screens/ProgressScreen';
import PlanScreen from '../screens/PlanScreen';
import ShareScreen from '../screens/ShareScreen';
import RoutineScreen from '../screens/RoutineScreen';
import CompareScreen from '../screens/CompareScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import FaceShapeScreen from '../screens/FaceShapeScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import DetailAnalysisScreen from '../screens/DetailAnalysisScreen';
import ProductsScreen from '../screens/ProductsScreen';
import TabBar from '../components/TabBar';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#0a0a0a' },
          }}
        >
          <Stack.Screen name="Home" component={HomeWithTabs} />
          <Stack.Screen name="RoutineTab" component={RoutineWithTabs} />
          <Stack.Screen name="CompareTab" component={CompareWithTabs} />
          <Stack.Screen name="LeaderboardTab" component={LeaderboardWithTabs} />
          <Stack.Screen name="ProfileTab" component={ProfileWithTabs} />
          <Stack.Screen
            name="Analyzing"
            component={AnalyzingScreen}
            options={{ gestureEnabled: false, animation: 'fade' }}
          />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="Tips" component={TipsScreen} />
          <Stack.Screen
            name="Paywall"
            component={PaywallScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Progress" component={ProgressScreen} />
          <Stack.Screen name="Plan" component={PlanScreen} />
          <Stack.Screen
            name="Share"
            component={ShareScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="Routine" component={RoutineScreen} />
          <Stack.Screen name="Compare" component={CompareScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="FaceShape" component={FaceShapeScreen} />
          <Stack.Screen name="Challenge" component={ChallengeScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="DetailAnalysis" component={DetailAnalysisScreen} />
          <Stack.Screen name="Products" component={ProductsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      {showOnboarding && (
        <OnboardingScreen onFinish={() => setShowOnboarding(false)} />
      )}
    </>
  );
};

// Wrapper components to add tab bar to main screens
const withTabBar = (ScreenComponent, tabName) => {
  return function WrappedScreen(props) {
    return (
      <View style={styles.tabContainer}>
        <View style={styles.screenContent}>
          <ScreenComponent {...props} />
        </View>
        <TabBar
          activeTab={tabName}
          onTabPress={(tab) => {
            const screenMap = {
              Home: 'Home',
              Routine: 'RoutineTab',
              Compare: 'CompareTab',
              Leaderboard: 'LeaderboardTab',
              Profile: 'ProfileTab',
            };
            const target = screenMap[tab];
            if (target && target !== (tabName === 'Home' ? 'Home' : tabName + 'Tab')) {
              props.navigation.navigate(target);
            }
          }}
        />
      </View>
    );
  };
};

const HomeWithTabs = withTabBar(HomeScreen, 'Home');
const RoutineWithTabs = withTabBar(RoutineScreen, 'Routine');
const CompareWithTabs = withTabBar(CompareScreen, 'Compare');
const LeaderboardWithTabs = withTabBar(LeaderboardScreen, 'Leaderboard');
const ProfileWithTabs = withTabBar(ProfileScreen, 'Profile');

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  screenContent: {
    flex: 1,
  },
});

export default AppNavigator;
