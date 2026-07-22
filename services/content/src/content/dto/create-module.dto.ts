import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ example: 'Getting Started' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
