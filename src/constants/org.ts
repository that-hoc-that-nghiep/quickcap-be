import { UserPermission } from './user';

export enum OrgType {
  PERSONAL = 'Personal',
  ORGANIZATION = 'Organization',
}
export interface Organization {
  id: string;
  name: string;
  image: string | null;
  type: OrgType;
  timestamp: string;
  created_at: string;
  is_owner: boolean;
  is_permission: UserPermission;
}
