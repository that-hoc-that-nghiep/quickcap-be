import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { EnvVariables } from 'src/constants';
import { Organization } from 'src/constants/org';
import { User } from 'src/constants/user';
import { createErrorHandler } from 'src/exception-filters/axios-error-handler';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}
  private readonly logger = new Logger(AuthService.name);
  authUrl = this.configService.get<string>(EnvVariables.AUTH_URL);
  async getUserFromToken(token: string) {
    const { data } = await firstValueFrom(
      this.httpService.get<User>(`${this.authUrl}/auth/verify/${token}`).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data);
          throw new HttpException(error.response.data, error.response.status);
        }),
      ),
    );
    return data;
  }

  async addUserToOrg(email: string, orgId: string, token: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .put(
          `${this.authUrl}/org/${orgId}/add`,
          {
            usersEmail: [email],
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .pipe(catchError(createErrorHandler(this.logger, 'add user to org'))),
    );
    return data;
  }

  async getUserById(id: string, token: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.authUrl}/auth/user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .pipe(
          catchError(
            createErrorHandler(this.logger, `Not found user by ${id}`),
          ),
        ),
    );
    return data;
  }

  isUserInOrg = (user: User, orgId: string) => {
    return user.organizations.some((org) => org.id === orgId);
  };

  getOrgFromUser = (user: User, orgId: string) => {
    const org: Organization =
      user.organizations.find((org) => org.id === orgId) ?? null;
    if (org === null) {
      throw new HttpException(
        `User not belong to org ${orgId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return org;
  };

  isUserInVideoOrg = (user: User, videoOrgIds: string[]): boolean => {
    const userOrgIds = user.organizations.map((org) => org.id);

    return videoOrgIds.some((videoOrgId) => userOrgIds.includes(videoOrgId));
  };
}
