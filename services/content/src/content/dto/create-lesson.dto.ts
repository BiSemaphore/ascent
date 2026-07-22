import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

const LESSON_TYPES = ['video', 'text', 'resource'] as const;

export class CreateLessonDto {
  @ApiProperty({ example: 'What is TypeScript?' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ enum: LESSON_TYPES, required: false, default: 'text' })
  @IsOptional()
  @IsIn(LESSON_TYPES)
  type?: (typeof LESSON_TYPES)[number];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
