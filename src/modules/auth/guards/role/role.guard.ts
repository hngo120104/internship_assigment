/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './role.decorator';
import { Role } from './role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('You need to login first.');
    }
    const userRoles: Role[] = request.user.roles ?? [];

    if (!userRoles || userRoles.length === 0) {
      throw new UnauthorizedException('Need to login first.');
    }

    return requiredRoles.some((requiredRole) =>
      userRoles.includes(requiredRole),
    );
  }
}
