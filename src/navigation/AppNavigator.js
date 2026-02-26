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
import WorkoutScreen from '../screens/WorkoutScreen';
import WaterTrackerScreen from '../screens/WaterTrackerScreen';
import AgeEstimateScreen from '../screens/AgeEstimateScreen';
import SkinToneScreen from '../screens/SkinToneScreen';
import BodyFatScreen from '../screens/BodyFatScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import AppLockScreen from '../screens/AppLockScreen';
import GuidesScreen from '../screens/GuidesScreen';
import MewingGuideScreen from '../screens/MewingGuideScreen';
import SkinCareGuideScreen from '../screens/SkinCareGuideScreen';
import JawlineGuideScreen from '../screens/JawlineGuideScreen';
import HairGuideScreen from '../screens/HairGuideScreen';
import BoneStructureGuideScreen from '../screens/BoneStructureGuideScreen';
import NutritionGuideScreen from '../screens/NutritionGuideScreen';
import SleepGuideScreen from '../screens/SleepGuideScreen';
import PostureGuideScreen from '../screens/PostureGuideScreen';
import ProFeaturesScreen from '../screens/ProFeaturesScreen';
import AIRecommendationsScreen from '../screens/AIRecommendationsScreen';
import GlowUpReportScreen from '../screens/GlowUpReportScreen';
import BeforeAfterScreen from '../screens/BeforeAfterScreen';
import AuthScreen from '../screens/AuthScreen';
import GlowUpSimulatorScreen from '../screens/GlowUpSimulatorScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import WeeklyInsightsScreen from '../screens/WeeklyInsightsScreen';
import ShareCardScreen from '../screens/ShareCardScreen';
import EyeAreaGuideScreen from '../screens/EyeAreaGuideScreen';
import SymmetryGuideScreen from '../screens/SymmetryGuideScreen';
import GroomingGuideScreen from '../screens/GroomingGuideScreen';
import SupplementsGuideScreen from '../screens/SupplementsGuideScreen';
import DailyTipsScreen from '../screens/DailyTipsScreen';
import AndrogenicIQScreen from '../screens/AndrogenicIQScreen';
import ForumScreen from '../screens/ForumScreen';
import ChatScreen from '../screens/ChatScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import LooksMaxHubScreen from '../screens/LooksMaxHubScreen';
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
            contentStyle: { backgroundColor: '#000000' },
          }}
        >
          <Stack.Screen name="Auth" component={AuthScreen} options={{ animation: 'fade' }} />
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
          <Stack.Screen name="Workout" component={WorkoutScreen} />
          <Stack.Screen name="WaterTracker" component={WaterTrackerScreen} />
          <Stack.Screen name="AgeEstimate" component={AgeEstimateScreen} />
          <Stack.Screen name="SkinTone" component={SkinToneScreen} />
          <Stack.Screen name="BodyFat" component={BodyFatScreen} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} />
          <Stack.Screen name="Guides" component={GuidesScreen} />
          <Stack.Screen name="MewingGuide" component={MewingGuideScreen} />
          <Stack.Screen name="SkinCareGuide" component={SkinCareGuideScreen} />
          <Stack.Screen name="JawlineGuide" component={JawlineGuideScreen} />
          <Stack.Screen name="HairGuide" component={HairGuideScreen} />
          <Stack.Screen name="BoneStructureGuide" component={BoneStructureGuideScreen} />
          <Stack.Screen name="NutritionGuide" component={NutritionGuideScreen} />
          <Stack.Screen name="SleepGuide" component={SleepGuideScreen} />
          <Stack.Screen name="PostureGuide" component={PostureGuideScreen} />
          <Stack.Screen name="ProFeatures" component={ProFeaturesScreen} />
          <Stack.Screen name="AIRecommendations" component={AIRecommendationsScreen} />
          <Stack.Screen name="GlowUpReport" component={GlowUpReportScreen} />
          <Stack.Screen name="BeforeAfter" component={BeforeAfterScreen} />
          <Stack.Screen name="GlowUpSimulator" component={GlowUpSimulatorScreen} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} />
          <Stack.Screen name="WeeklyInsights" component={WeeklyInsightsScreen} />
          <Stack.Screen name="EyeAreaGuide" component={EyeAreaGuideScreen} />
          <Stack.Screen name="SymmetryGuide" component={SymmetryGuideScreen} />
          <Stack.Screen name="GroomingGuide" component={GroomingGuideScreen} />
          <Stack.Screen name="SupplementsGuide" component={SupplementsGuideScreen} />
          <Stack.Screen name="DailyTips" component={DailyTipsScreen} />
          <Stack.Screen name="AndrogenicIQ" component={AndrogenicIQScreen} />
          <Stack.Screen name="Forum" component={ForumScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} />
          <Stack.Screen name="LooksMaxHub" component={LooksMaxHubScreen} />
          <Stack.Screen
            name="ShareCard"
            component={ShareCardScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="AppLock"
            component={AppLockSetupScreen}
            options={{ presentation: 'modal', animation: 'fade', gestureEnabled: false }}
          />
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

// Wrapper for AppLock setup via navigation
const AppLockSetupScreen = ({ navigation }) => {
  return (
    <AppLockScreen
      isSetup={true}
      onUnlock={() => navigation.goBack()}
    />
  );
};

const HomeWithTabs = withTabBar(HomeScreen, 'Home');
const RoutineWithTabs = withTabBar(RoutineScreen, 'Routine');
const CompareWithTabs = withTabBar(CompareScreen, 'Compare');
const LeaderboardWithTabs = withTabBar(LeaderboardScreen, 'Leaderboard');
const ProfileWithTabs = withTabBar(ProfileScreen, 'Profile');

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  screenContent: {
    flex: 1,
  },
});

export default AppNavigator;
