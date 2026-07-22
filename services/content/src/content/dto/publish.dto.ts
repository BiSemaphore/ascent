import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PublishDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  published!: boolean;
}
