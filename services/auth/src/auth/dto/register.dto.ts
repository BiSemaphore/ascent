import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const SIGNUP_ROLES = ['learner', 'instructor'] as const;

export class RegisterDto {
  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'supersecret', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: SIGNUP_ROLES, required: false, default: 'learner' })
  @IsOptional()
  @IsIn(SIGNUP_ROLES)
  role?: (typeof SIGNUP_ROLES)[number];
}
