import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@ascent/auth';
import type { AuthUser } from '@ascent/auth';
import { CohortService } from './cohort.service';
import { CreateCohortDto } from './dto/create-cohort.dto';

@ApiTags('cohorts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CohortController {
  constructor(private readonly cohorts: CohortService) {}

  @Get()
  list() {
    return this.cohorts.list();
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.cohorts.get(id);
  }

  @Post()
  @Roles('instructor', 'admin')
  create(@Body() dto: CreateCohortDto, @CurrentUser() user: AuthUser) {
    return this.cohorts.create(user.userId, dto);
  }

  @Post(':id/enroll')
  @Roles('learner')
  enroll(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.cohorts.enroll(id, user.userId);
  }
}
