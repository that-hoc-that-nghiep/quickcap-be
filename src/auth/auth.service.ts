import { Injectable } from '@nestjs/common';
import { UserPermission, UserSubscription } from 'src/constants/user';
export interface Organization {
  id: string;
  name: string;
  image: string | null;
  metadata: string | null;
  created_at: string;
  is_owner: boolean;
  is_permission: UserPermission;
}

export interface User {
  id: string;
  created_at: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string | null;
  locale: string | null;
  metadata: string | null;
  subscription: UserSubscription;
  organizations: Organization[];
}
@Injectable()
export class AuthService {
  isUserInOrg = (user: User, orgId: string) => {
    return user.organizations.some((org) => org.id === orgId);
  };

  getOrgFromUser = (user: User, orgId: string) => {
    return user.organizations.find((org) => org.id === orgId);
  };

  isUserInVideoOrg = (user: User, videoOrgIds: string[]): boolean => {
    const userOrgIds = user.organizations.map((org) => org.id); // Lấy danh sách orgId của user

    return videoOrgIds.some((videoOrgId) => userOrgIds.includes(videoOrgId)); // Kiểm tra sự giao nhau
  };
}
