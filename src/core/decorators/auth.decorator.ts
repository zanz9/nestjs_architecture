import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt_auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { UserRoles } from '../db/enum/user_roles.enum';

export const ROLES_KEY = 'roles';

export const Auth = (roles?: UserRoles[]) => {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles ?? Object.values(UserRoles)),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth('Authorization'),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
};
