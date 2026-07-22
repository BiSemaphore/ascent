import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@ascent/auth';
import type { AuthUser } from '@ascent/auth';
import { ContentService } from './content.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateProgramDto } from './dto/create-program.dto';
import { PublishDto } from './dto/publish.dto';

/** HTTP API for the curriculum: authoring (staff) and delivery (learners). */
@ApiTags('content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('programs')
  listPrograms(@CurrentUser() user: AuthUser) {
    return this.content.listPrograms(user.role);
  }

  @Get('programs/:id')
  getProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.content.getProgramTree(id, user.role);
  }

  @Post('programs')
  @Roles('instructor', 'admin')
  createProgram(@Body() dto: CreateProgramDto, @CurrentUser() user: AuthUser) {
    return this.content.createProgram(user.userId, dto);
  }

  @Patch('programs/:id/publish')
  @Roles('instructor', 'admin')
  publishProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PublishDto,
  ) {
    return this.content.setProgramPublished(id, dto.published);
  }

  @Post('programs/:programId/courses')
  @Roles('instructor', 'admin')
  createCourse(
    @Param('programId', ParseUUIDPipe) programId: string,
    @Body() dto: CreateCourseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.content.createCourse(programId, user.userId, dto);
  }

  @Patch('courses/:id/publish')
  @Roles('instructor', 'admin')
  publishCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PublishDto,
  ) {
    return this.content.setCoursePublished(id, dto.published);
  }

  @Post('courses/:courseId/modules')
  @Roles('instructor', 'admin')
  createModule(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: CreateModuleDto,
  ) {
    return this.content.createModule(courseId, dto);
  }

  @Post('modules/:moduleId/lessons')
  @Roles('instructor', 'admin')
  createLesson(
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.content.createLesson(moduleId, dto);
  }

  @Post('lessons/:lessonId/complete')
  @Roles('learner')
  completeLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.content.completeLesson(user.userId, lessonId);
  }
}
