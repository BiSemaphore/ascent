import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({ description: 'The cohort to purchase a seat in' })
  @IsUUID()
  cohortId!: string;
}
