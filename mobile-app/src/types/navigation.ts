export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  History: undefined;
  Profile: undefined;
};

import type { Hazard } from './map';

export type AppStackParamList = {
  MainTabs: undefined;
  Camera: undefined;
  Submission: undefined;
  /** Opened from a map pin — carries the tapped hazard, or undefined for a direct/deep entry. */
  HazardDetail: { hazard: Hazard } | undefined;
  Notifications: undefined;
  Settings: undefined;
};
