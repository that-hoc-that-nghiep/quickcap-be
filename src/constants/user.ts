import { Organization } from './org';

export enum UserPermission {
  ALL = 'ALL',
  READ = 'READ',
  WRITE = 'WRITE',
}

export enum UserSubscription {
  FREE = 'FREE',
  PRO = 'PRO',
}
export interface User {
  id: string;
  email: string;
  verified_email: number;
  name: string;
  given_name: string;
  family_name: string;
  picture: string | null;
  locale: string | null;
  timestamp: string;
  organizations: Organization[];
}
