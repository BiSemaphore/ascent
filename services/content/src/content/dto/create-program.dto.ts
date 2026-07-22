import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProgramDto {
  @ApiProperty({ example: 'Full-Stack Development' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
