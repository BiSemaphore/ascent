import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthUser } from './auth-user';
import type { Role } from './role';

interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

/**
 * Passport strategy that verifies the Bearer JWT with the shared `JWT_SECRET`
 * and exposes the caller as an {@link AuthUser} on the request. Every service
 * that authenticates provides this strategy.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Maps a verified JWT payload to the {@link AuthUser} attached to the request.
   * @param payload - the decoded, signature-verified token claims
   */
  validate(payload: JwtPayload): AuthUser {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
