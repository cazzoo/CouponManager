import { UserRole } from '../types';

export interface DevTestUser {
  email: string;
  password: string;
  role: UserRole;
}

export const DEV_TEST_USERS: DevTestUser[] = [
  { email: 'user@example.com', password: 'password123', role: 'user' },
  { email: 'manager@example.com', password: 'password123', role: 'manager' },
  { email: 'another@example.com', password: 'password123', role: 'user' },
  { email: 'test4@example.com', password: 'password123', role: 'user' },
];

export const DEMO_USER: DevTestUser = {
  email: 'demo@example.com',
  password: 'demo12345',
  role: 'demo',
};

export const getAllDevUsers = (): DevTestUser[] => {
  return [...DEV_TEST_USERS, DEMO_USER];
};

export const getUserInitials = (email: string): string => {
  const [username] = email.split('@');
  return username
    .split('.')
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
    .substring(0, 2);
};

export const getDevUserByEmail = (email: string): DevTestUser | undefined => {
  return getAllDevUsers().find((user) => user.email === email);
};

export const DEV_USER_STORAGE_KEY = 'dev_last_user';

export const getLastSelectedUser = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(DEV_USER_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setLastSelectedUser = (email: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEV_USER_STORAGE_KEY, email);
  } catch (error) {
    console.error('Failed to save last selected user:', error);
  }
};
