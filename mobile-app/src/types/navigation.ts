export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  /** Carries the address the 8-digit signup code was sent to. */
  VerifyEmail: { email: string };
  /** Carries the address the 8-digit recovery code was sent to. */
  ResetPassword: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  Report: undefined;
  History: undefined;
  Profile: undefined;
};

import type { NavigatorScreenParams } from '@react-navigation/native';

import type { Hazard } from './map';

/** Captured photo plus GPS fix (null if location permission was denied/unavailable) handed off from Camera to Submission. */
export type CapturedReport = {
  photoUri: string;
  latitude: number | null;
  longitude: number | null;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Camera: undefined;
  Submission: CapturedReport;
  /** Opened from a map pin — carries the tapped hazard, or undefined for a direct/deep entry. */
  HazardDetail: { hazard: Hazard } | undefined;
  Notifications: undefined;
  Settings: undefined;
  /** Settings → Account: edit display name and change password. */
  AccountSettings: undefined;
  /** Settings → Notifications: per-category notification toggles. */
  NotificationSettings: undefined;
};
