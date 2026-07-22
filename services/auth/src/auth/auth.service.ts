import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { DB } from '../database/database.module';
import { users } from '../database/schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Database } from '../database/database.module';
import type { Role } from '@ascent/auth';

const SALT_ROUNDS = 10;

/** Accounts and identity: registration, login, and JWT issuance. */
@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly jwt: JwtService,
    private readonly activity: ActivityService,
  ) {}

  /**
   * Register a new account, hash the password, log the activity, and return a JWT.
   * @param dto - email, password, and optional signup role
   * @param ip - caller IP, recorded in the activity log
   * @throws ConflictException when the email is already registered
   */
  async register(dto: RegisterDto, ip?: string) {
    const [existing] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const [user] = await this.db
      .insert(users)
      .values({ email: dto.email, passwordHash, role: dto.role ?? 'learner' })
      .returning({ id: users.id, email: users.email, role: users.role });

    await this.activity.log({
      type: 'user.registered',
      userId: user.id,
      email: user.email,
      ip,
    });
    return this.sign(user.id, user.email, user.role);
  }

  /**
   * Verify credentials, log the attempt (success or failure), and return a JWT.
   * @param dto - email and password
   * @param ip - caller IP, recorded in the activity log
   * @throws UnauthorizedException when the credentials are invalid
   */
  async login(dto: LoginDto, ip?: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      await this.activity.log({ type: 'login.failed', email: dto.email, ip });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.activity.log({
      type: 'user.logged_in',
      userId: user.id,
      email: user.email,
      ip,
    });
    return this.sign(user.id, user.email, user.role);
  }

  /** Sign a JWT for a user and return it with a trimmed user object. */
  private sign(id: string, email: string, role: Role) {
    const accessToken = this.jwt.sign({ sub: id, email, role });
    return { accessToken, user: { id, email, role } };
  }
}
