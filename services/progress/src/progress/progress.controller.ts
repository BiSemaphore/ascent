import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@ascent/auth';
import type { AuthUser } from '@ascent/auth';
import { ProgressService } from './progress.service';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  mine(@CurrentUser() user: AuthUser) {
    return this.progress.forLearner(user.userId);
  }
}
