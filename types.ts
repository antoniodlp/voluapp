
export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum UserRole {
  VOLUNTEER = 'VOLUNTEER',
  ADMIN = 'ADMIN'
}

export enum VolunteerType {
  VTC = 'VTC',
  VTP = 'VTP',
  BASE = 'BASE'
}

export type ShiftPeriod = 'MORNING' | 'AFTERNOON';

export interface VolunteerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  photoUrl: string;
  status: UserStatus;
  role: UserRole;
  volunteerType: VolunteerType;
  area?: string;
  instagram?: string;
  telegram?: string;
  activatedAt?: string;
  deactivatedAt?: string;
  joinedAt: string;
}

export interface Shift {
  id: string;
  volunteerId: string;
  daysOfWeek: number[]; // 0 for Sunday, 1 for Monday, etc.
  period: ShiftPeriod;
}

export interface AttendanceRecord {
  id: string;
  volunteerId: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // Full ISO
}

export interface Announcement {
  id: string;
  message: string;
  publishedAt: string;
  status: 'published' | 'hidden';
  createdBy: string;
}

export interface AppState {
  currentUser: VolunteerProfile | null;
  volunteers: VolunteerProfile[];
  shifts: Shift[];
  attendances: AttendanceRecord[];
  announcements: Announcement[];
}
