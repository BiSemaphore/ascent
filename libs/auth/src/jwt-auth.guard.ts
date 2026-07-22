import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Route guard that requires a valid JWT; responds 401 when it is missing or invalid. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
