export type UserProfile = {
  id: string;
  name: string;
  email: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  user: UserProfile | null;
};
