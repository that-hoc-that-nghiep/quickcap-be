import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
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

interface User {
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
export class AuthGuard implements CanActivate {
  constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      //   const user = await firstValueFrom(
      //     this.authClient.send('validate_token', { token }),
      //   );
      const user: User = {
        id: 'user_12345',
        created_at: '2024-02-05T10:00:00Z',
        email: 'john.doe@example.com',
        name: 'John Doe',
        given_name: 'John',
        family_name: 'Doe',
        picture: 'https://randomuser.me/api/portraits/men/1.jpg',
        locale: 'en-US',
        metadata: JSON.stringify({ theme: 'dark', role: 'admin' }),
        subscription: UserSubscription.FREE,
        organizations: [
          {
            id: 'org_001',
            name: 'Tech Innovators',
            image: 'https://via.placeholder.com/150',
            metadata: JSON.stringify({
              industry: 'Technology',
              size: '50-100',
            }),
            created_at: '2023-06-15T08:30:00Z',
            is_owner: true,
            is_permission: UserPermission.ALL,
          },
          {
            id: 'org_002',
            name: 'Design Masters',
            image: null,
            metadata: null,
            created_at: '2022-04-10T12:00:00Z',
            is_owner: false,
            is_permission: UserPermission.READ,
          },
        ],
      };

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }
}
