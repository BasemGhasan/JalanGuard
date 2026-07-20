export type UserProfile = {
  id: string;
  name: string;
  email: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  user: UserProfile | null;
};

/** Which events the user wants to be notified about. See `preferencesService`. */
export type NotificationPreferences = {
  /** Votes and status changes on hazards I submitted. */
  myReports: boolean;
  /** New hazards reported close to my location. */
  nearbyHazards: boolean;
  /** Trust-score changes and contribution milestones. */
  trustMilestones: boolean;
};
