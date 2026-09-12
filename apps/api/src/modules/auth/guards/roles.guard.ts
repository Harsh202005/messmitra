import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@messmitra/types';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization Header (Bearer token required)');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    // Decode token or match role from demo tokens / JWT
    let userRole: UserRole | null = null;

    if (token.startsWith('token-owner') || token === 'demo-owner-token') {
      userRole = 'owner';
    } else if (token.startsWith('token-member')) {
      userRole = 'member';
    } else if (token.startsWith('token-staff') || token.startsWith('token-cook')) {
      userRole = 'staff';
    } else {
      try {
        // Handle base64 encoded JSON token payload
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        userRole = decoded.role;
      } catch {
        // Fallback default
        userRole = 'owner';
      }
    }

    const hasRole = requiredRoles.includes(userRole as UserRole);
    if (!hasRole) {
      throw new ForbiddenException(`Access denied: Requires one of [${requiredRoles.join(', ')}] role, but you are [${userRole}]`);
    }

    return true;
  }
}
