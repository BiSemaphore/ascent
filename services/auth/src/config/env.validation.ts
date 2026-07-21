import { plainToInstance } from 'class-transformer';
import { IsInt, IsString, MinLength, validateSync } from 'class-validator';

class EnvVars {
  @IsInt()
  PORT!: number;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  MONGODB_URL!: string;

  @IsString()
  MONGODB_DB!: string;

  @IsString()
  @MinLength(16)
  JWT_SECRET!: string;

  @IsString()
  JWT_EXPIRES_IN!: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvVars, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('\n');
    throw new Error(`Invalid environment variables:\n${details}`);
  }
  return validated;
}
