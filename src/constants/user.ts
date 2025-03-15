import { ApiProperty } from '@nestjs/swagger';
import { Organization } from './org';

export enum UserPermission {
  ALL = 'ALL',
  READ = 'READ',
  UPLOAD = 'UPLOAD',
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
  subscription: UserSubscription;
  timestamp: string;
  organizations: Organization[];
}

export class UserApp {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  email: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  given_name: string;

  @ApiProperty({ type: String })
  family_name: string;

  @ApiProperty({ type: String })
  picture: string | null;

  @ApiProperty({ enum: UserSubscription, default: UserSubscription.FREE })
  subscription: UserSubscription;

  @ApiProperty({ type: String })
  timestamp: string;
}
