import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { jwtConstants } from './constants';
  import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthorizationService } from './authorization.service';

@Injectable()
export class AuthGuard implements CanActivate{
    constructor(
        private jwtService: JwtService,
        private authService: AuthorizationService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
          const request = context.switchToHttp().getRequest();
          const { authorization }: any = request.headers;
          if (!authorization || authorization.trim() === '') {
            throw new UnauthorizedException('Please provide token');
          }
          const authToken = authorization.replace(/bearer/gim, '').trim();
          const resp = await this.authService.validateToken(authToken);
          request.decodedData = resp;
          return true;
        } catch (error) {
          console.log('auth error - ', error.message);
          throw new ForbiddenException(
            error.message || 'session expired! Please sign In',
          );
        }
    }
}

