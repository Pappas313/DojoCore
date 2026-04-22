export interface BaseUser {
  username: string;
  email: string;
  password?: string;
  role: number; // 0=admin, 1=coach, 2=manager, 3=athlete
  address?: string;
  gender: number; // 0=female, 1=male, 2=other
  dateOfBirth: string; // YYYY-MM-DD
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: number;
  status: number; // 0=pending, 1=approved, 2=inprogress, 3=rejected
}

export interface UserAuthResponse {
  user: UserResponse;
  message: string;
}

export interface LoginPayload {
  identifier: string;
  password?: string;
}

export type GymAction = 'join' | 'create' | 'none';

export interface GymData {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface CombinedRegistrationPayload {
  user: BaseUser;
  gymAction: GymAction;
  gymCode: string | null;
  newGym: GymData | null;
}
