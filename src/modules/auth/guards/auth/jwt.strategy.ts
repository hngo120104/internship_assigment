import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import type { CurrentUserPayload } from '../../../../custom.decorators/current.user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY',
    });
  }

  validate(payload: CurrentUserPayload): CurrentUserPayload {
    if (!payload) throw new UnauthorizedException('Unauthorized.');
    return { sub: payload.sub, roles: payload.roles };
  }
}
