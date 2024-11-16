import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthorizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authToken = request.cookies?.jwt;
    if (!authToken) {
      throw new UnauthorizedException(`Please provide token`);
    }
    try {
      const decodedData = await this.authService.validateToken(authToken);
      request.decodedData = decodedData;
      return true;
    } catch (error) {
      throw new ForbiddenException(
        error?.message || 'Session expired! Please sign in.',
      );
    }
  }
}

