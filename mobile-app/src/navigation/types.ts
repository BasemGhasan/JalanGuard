/**
 * Navigation Types
 * Type-safe navigation parameters
 */

import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
    Home: undefined;
    Map: undefined;
    Report: undefined;
    Profile: undefined;
};

// Home Stack
export type HomeStackParamList = {
    HomeScreen: undefined;
    ReportDetails: { reportId: string };
    AllReports: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
    ProfileScreen: undefined;
    EditProfile: undefined;
    Settings: undefined;
    MyReports: undefined;
};

// Root Navigator
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
    Onboarding: undefined;
};

// Utility type for useNavigation hook
declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
