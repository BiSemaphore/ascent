import { ApiProperty } from '@nestjs/swagger';
import {
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCohortDto {
  @ApiProperty({ description: 'Program this cohort runs (from the Content service)' })
  @IsUUID()
  programId!: string;

  @ApiProperty({ example: 'Full-Stack - Aug 2026 Batch' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' })
  @IsISO8601()
  startDate!: string;

  @ApiProperty({ example: 30, minimum: 1 })
  @IsInt()
  @Min(1)
  seatLimit!: number;

  @ApiProperty({
    example: 4900,
    minimum: 0,
    description: 'Price in the currency minor unit (e.g. cents); 0 = free',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 'usd', required: false })
  @IsOptional()
  @IsString()
  currency?: string;
}
