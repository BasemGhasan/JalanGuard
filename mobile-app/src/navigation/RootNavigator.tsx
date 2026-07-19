import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants';
import { ReportTabButton } from '../components';
import { AppStackParamList, AuthStackParamList, Hazard, MainTabParamList, UserProfile } from '../types';
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

function EmptyReportPlaceholder() {
  return null;
}

type RootNavigatorProps = {
  isAuthenticated: boolean;
  user: UserProfile | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (fullName: string, email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  onLogout: () => Promise<void>;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function MainTabsNavigator({
  user,
  onLogout,
  onOpenNotifications,
  onOpenHazardDetail,
  onOpenSettings,
  onOpenCamera,
}: {
  user: UserProfile | null;
  onLogout: () => Promise<void>;
  onOpenNotifications: () => void;
  onOpenHazardDetail: (hazard: Hazard) => void;
  onOpenSettings: () => void;
  onOpenCamera: () => void;
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
                : route.name === 'Profile'
                  ? t('common.tabs.profile')
                  : undefined,
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
          <HomeScreen
            user={user}
            onOpenMap={() => navigation.navigate('Map')}
            onOpenNotifications={onOpenNotifications}
          />
        )}
      </MainTabs.Screen>
      <MainTabs.Screen name="Map">
        {() => <MapScreen onOpenHazardDetail={onOpenHazardDetail} />}
      </MainTabs.Screen>
      <MainTabs.Screen
        name="Report"
        component={EmptyReportPlaceholder}
        options={{
          tabBarButton: () => <ReportTabButton onPress={onOpenCamera} />,
        }}
      />
      <MainTabs.Screen name="History">
        {() => <HistoryScreen user={user} onOpenHazardDetail={onOpenHazardDetail} />}
      </MainTabs.Screen>
      <MainTabs.Screen name="Profile">
        {() => <ProfileScreen user={user} onLogout={onLogout} onOpenSettings={onOpenSettings} />}
      </MainTabs.Screen>
    </MainTabs.Navigator>
  );
}

function AppStackNavigator({
  user,
  onLogout,
}: {
  user: UserProfile | null;
  onLogout: () => Promise<void>;
}) {
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
            user={user}
            onLogout={onLogout}
            onOpenNotifications={() => navigation.navigate('Notifications')}
            onOpenHazardDetail={(hazard) => navigation.navigate('HazardDetail', { hazard })}
            onOpenSettings={() => navigation.navigate('Settings')}
            onOpenCamera={() => navigation.navigate('Camera')}
          />
        )}
      </AppStack.Screen>
      <AppStack.Screen name="Camera">
        {({ navigation }) => (
          <CameraScreen
            onBack={() => navigation.goBack()}
            onCapture={(report) => navigation.navigate('Submission', report)}
          />
        )}
      </AppStack.Screen>
      <AppStack.Screen name="Submission">
        {({ navigation, route }) => (
          <SubmissionScreen
            photoUri={route.params.photoUri}
            latitude={route.params.latitude}
            longitude={route.params.longitude}
            user={user}
            onBack={() => navigation.goBack()}
            onSubmitted={() => navigation.navigate('MainTabs', { screen: 'History' })}
          />
        )}
      </AppStack.Screen>
      <AppStack.Screen name="HazardDetail">
        {({ navigation, route }) => (
          <HazardDetailScreen
            hazard={route.params?.hazard}
            user={user}
            onBack={() => navigation.goBack()}
          />
        )}
      </AppStack.Screen>
      <AppStack.Screen name="Notifications">
        {({ navigation }) => (
          <NotificationsScreen
            user={user}
            onBack={() => navigation.goBack()}
            onOpenHazardDetail={(hazard) => navigation.navigate('HazardDetail', { hazard })}
          />
        )}
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
  return (
    // Headerless: every auth screen renders its own centred title via AuthHero,
    // and the default header's white background clashed with the dark screens.
    // Back is still available via the OS gesture/button and the in-screen links.
    <AuthStack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Splash" component={SplashScreen} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLogin={onLogin} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {(props) => <RegisterScreen {...props} onRegister={onRegister} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

export function RootNavigator({ isAuthenticated, user, onLogin, onRegister, onLogout }: RootNavigatorProps) {
  if (isAuthenticated) {
    return <AppStackNavigator user={user} onLogout={onLogout} />;
  }

  return <AuthStackNavigator onLogin={onLogin} onRegister={onRegister} />;
}
