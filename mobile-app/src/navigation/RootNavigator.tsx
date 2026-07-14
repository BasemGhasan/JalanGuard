import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants';
import { AppStackParamList, AuthStackParamList, MainTabParamList } from '../types';
import {
  CameraScreen,
  HazardDetailScreen,
  HistoryScreen,
  ForgotPasswordScreen,
  HomeScreen,
  LoginScreen,
  MapScreen,
  NotificationsScreen,
  OnboardingScreen,
  ProfileScreen,
  RegisterScreen,
  SettingsScreen,
  SplashScreen,
  SubmissionScreen,
} from '../screens';

type RootNavigatorProps = {
  isAuthenticated: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (fullName: string, email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  onLogout: () => Promise<void>;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function MainTabsNavigator({
  onLogout,
  onOpenNotifications,
  onOpenHazardDetail,
  onOpenSettings,
}: {
  onLogout: () => Promise<void>;
  onOpenNotifications: () => void;
  onOpenHazardDetail: () => void;
  onOpenSettings: () => void;
}) {
  const { t } = useTranslation();

  return (
    <MainTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.accent,
          borderTopColor: COLORS.primary,
        },
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.disabled,
        tabBarLabel:
          route.name === 'Home'
            ? t('common.tabs.home')
            : route.name === 'Map'
              ? t('common.tabs.map')
              : route.name === 'History'
                ? t('common.tabs.history')
                : t('common.tabs.profile'),
        tabBarIcon: ({ color, size }) => {
          const iconByRoute: Record<string, keyof typeof MaterialIcons.glyphMap> = {
            Home: 'home',
            Map: 'map',
            History: 'history',
            Profile: 'person',
          };

          return <MaterialIcons name={iconByRoute[route.name] ?? 'circle'} size={size} color={color} />;
        },
      })}
    >
      <MainTabs.Screen name="Home">
        {({ navigation }) => (
          <HomeScreen onOpenMap={() => navigation.navigate('Map')} onOpenNotifications={onOpenNotifications} />
        )}
      </MainTabs.Screen>
      <MainTabs.Screen name="Map">
        {() => <MapScreen onOpenHazardDetail={onOpenHazardDetail} />}
      </MainTabs.Screen>
      <MainTabs.Screen name="History" component={HistoryScreen} />
      <MainTabs.Screen name="Profile">
        {() => <ProfileScreen onLogout={onLogout} onOpenSettings={onOpenSettings} />}
      </MainTabs.Screen>
    </MainTabs.Navigator>
  );
}

function AppStackNavigator({ onLogout }: { onLogout: () => Promise<void> }) {
  return (
    <AppStack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      <AppStack.Screen name="MainTabs">
        {({ navigation }) => (
          <MainTabsNavigator
            onLogout={onLogout}
            onOpenNotifications={() => navigation.navigate('Notifications')}
            onOpenHazardDetail={() => navigation.navigate('HazardDetail')}
            onOpenSettings={() => navigation.navigate('Settings')}
          />
        )}
      </AppStack.Screen>
      <AppStack.Screen name="Camera">
        {({ navigation }) => (
          <CameraScreen onBack={() => navigation.goBack()} onCapture={() => navigation.navigate('Submission')} />
        )}
      </AppStack.Screen>
      <AppStack.Screen name="Submission">
        {({ navigation }) => (
          <SubmissionScreen onBack={() => navigation.goBack()} onSubmit={() => navigation.navigate('MainTabs')} />
        )}
      </AppStack.Screen>
      <AppStack.Screen name="HazardDetail">
        {({ navigation }) => <HazardDetailScreen onBack={() => navigation.goBack()} />}
      </AppStack.Screen>
      <AppStack.Screen name="Notifications">
        {({ navigation }) => <NotificationsScreen onBack={() => navigation.goBack()} />}
      </AppStack.Screen>
      <AppStack.Screen name="Settings">
        {({ navigation }) => (
          <SettingsScreen onBack={() => navigation.goBack()} onLogout={onLogout} />
        )}
      </AppStack.Screen>
    </AppStack.Navigator>
  );
}

function AuthStackNavigator({
  onLogin,
  onRegister,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (fullName: string, email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
}) {
  const { t } = useTranslation();

  return (
    <AuthStack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerTitleAlign: 'center',
      }}
    >
      <AuthStack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} options={{ title: t('auth.titles.welcome') }} />
      <AuthStack.Screen name="Login" options={{ title: t('navigation.auth.login') }}>
        {(props) => <LoginScreen {...props} onLogin={onLogin} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register" options={{ title: t('navigation.auth.register') }}>
        {(props) => <RegisterScreen {...props} onRegister={onRegister} />}
      </AuthStack.Screen>
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: t('navigation.auth.resetPassword') }}
      />
    </AuthStack.Navigator>
  );
}

export function RootNavigator({ isAuthenticated, onLogin, onRegister, onLogout }: RootNavigatorProps) {
  if (isAuthenticated) {
    return <AppStackNavigator onLogout={onLogout} />;
  }

  return <AuthStackNavigator onLogin={onLogin} onRegister={onRegister} />;
}
