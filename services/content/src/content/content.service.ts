import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { TOPICS, createEvent } from '@ascent/contracts';
import { DB } from '../database/database.module';
import {
  courses,
  lessonCompletions,
  lessons,
  modules,
  outbox,
  programs,
} from '../database/schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateProgramDto } from './dto/create-program.dto';
import type { Database } from '../database/database.module';
import type { Role } from '@ascent/auth';

/** Owns the curriculum (programs, courses, modules, lessons) and lesson completion. */
@Injectable()
export class ContentService {
  constructor(@Inject(DB) private readonly db: Database) {}

  /**
   * Record that a learner completed a lesson and emit `LessonCompleted` via the
   * outbox (same transaction). Idempotent: completing again is a no-op and emits
   * nothing.
   * @throws NotFoundException when the lesson does not exist
   */
  async completeLesson(userId: string, lessonId: string) {
    const [lesson] = await this.db
      .select({ id: lessons.id, programId: courses.programId })
      .from(lessons)
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .innerJoin(courses, eq(modules.courseId, courses.id))
      .where(eq(lessons.id, lessonId))
      .limit(1);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return this.db.transaction(async (tx) => {
      const [completion] = await tx
        .insert(lessonCompletions)
        .values({ userId, lessonId })
        .onConflictDoNothing()
        .returning();
      if (!completion) {
        return { lessonId, alreadyCompleted: true };
      }

      const event = createEvent({
        eventType: 'LessonCompleted',
        producer: 'content',
        payload: { lessonId, programId: lesson.programId, userId },
      });
      await tx.insert(outbox).values({
        topic: TOPICS.lessonCompleted,
        key: lesson.programId,
        payload: event,
      });
      return { lessonId, completed: true };
    });
  }

  /** Whether a role may author and see unpublished content. */
  private isStaff(role: Role) {
    return role === 'instructor' || role === 'admin';
  }

  /** Create a program (CMS/write side). */
  async createProgram(userId: string, dto: CreateProgramDto) {
    const [program] = await this.db
      .insert(programs)
      .values({
        title: dto.title,
        description: dto.description,
        createdBy: userId,
      })
      .returning();
    return program;
  }

  /**
   * List programs (delivery/read side). Learners see only published programs;
   * staff see all.
   */
  async listPrograms(role: Role) {
    const query = this.db.select().from(programs);
    const rows = this.isStaff(role)
      ? await query.orderBy(asc(programs.createdAt))
      : await query
          .where(eq(programs.published, true))
          .orderBy(asc(programs.createdAt));
    return rows;
  }

  /**
   * A program with its nested courses, modules, and lessons. Learners get only
   * published courses of a published program; staff get everything.
   * @throws NotFoundException when the program is missing or unpublished for a learner
   */
  async getProgramTree(id: string, role: Role) {
    const staff = this.isStaff(role);

    const [program] = await this.db
      .select()
      .from(programs)
      .where(eq(programs.id, id))
      .limit(1);
    if (!program || (!staff && !program.published)) {
      throw new NotFoundException('Program not found');
    }

    const courseRows = await this.db
      .select()
      .from(courses)
      .where(
        staff
          ? eq(courses.programId, id)
          : and(eq(courses.programId, id), eq(courses.published, true)),
      )
      .orderBy(asc(courses.position));

    const courseIds = courseRows.map((c) => c.id);
    const moduleRows = courseIds.length
      ? await this.db
          .select()
          .from(modules)
          .where(inArray(modules.courseId, courseIds))
          .orderBy(asc(modules.position))
      : [];

    const moduleIds = moduleRows.map((m) => m.id);
    const lessonRows = moduleIds.length
      ? await this.db
          .select()
          .from(lessons)
          .where(inArray(lessons.moduleId, moduleIds))
          .orderBy(asc(lessons.position))
      : [];

    return {
      ...program,
      courses: courseRows.map((course) => ({
        ...course,
        modules: moduleRows
          .filter((m) => m.courseId === course.id)
          .map((m) => ({
            ...m,
            lessons: lessonRows.filter((l) => l.moduleId === m.id),
          })),
      })),
    };
  }

  /**
   * Publish or unpublish a program.
   * @throws NotFoundException when the program does not exist
   */
  async setProgramPublished(id: string, published: boolean) {
    const [updated] = await this.db
      .update(programs)
      .set({ published })
      .where(eq(programs.id, id))
      .returning();
    if (!updated) {
      throw new NotFoundException('Program not found');
    }
    return updated;
  }

  /**
   * Add a course to a program.
   * @throws NotFoundException when the program does not exist
   */
  async createCourse(programId: string, userId: string, dto: CreateCourseDto) {
    await this.ensureProgram(programId);
    const [course] = await this.db
      .insert(courses)
      .values({
        programId,
        title: dto.title,
        description: dto.description,
        position: dto.position ?? 0,
        createdBy: userId,
      })
      .returning();
    return course;
  }

  /**
   * Publish or unpublish a course.
   * @throws NotFoundException when the course does not exist
   */
  async setCoursePublished(id: string, published: boolean) {
    const [updated] = await this.db
      .update(courses)
      .set({ published })
      .where(eq(courses.id, id))
      .returning();
    if (!updated) {
      throw new NotFoundException('Course not found');
    }
    return updated;
  }

  /**
   * Add a module to a course.
   * @throws NotFoundException when the course does not exist
   */
  async createModule(courseId: string, dto: CreateModuleDto) {
    await this.ensureCourse(courseId);
    const [created] = await this.db
      .insert(modules)
      .values({ courseId, title: dto.title, position: dto.position ?? 0 })
      .returning();
    return created;
  }

  /**
   * Add a lesson to a module.
   * @throws NotFoundException when the module does not exist
   */
  async createLesson(moduleId: string, dto: CreateLessonDto) {
    await this.ensureModule(moduleId);
    const [created] = await this.db
      .insert(lessons)
      .values({
        moduleId,
        title: dto.title,
        type: dto.type ?? 'text',
        content: dto.content,
        position: dto.position ?? 0,
      })
      .returning();
    return created;
  }

  private async ensureProgram(id: string) {
    const [row] = await this.db
      .select({ id: programs.id })
      .from(programs)
      .where(eq(programs.id, id))
      .limit(1);
    if (!row) {
      throw new NotFoundException('Program not found');
    }
  }

  private async ensureCourse(id: string) {
    const [row] = await this.db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
    if (!row) {
      throw new NotFoundException('Course not found');
    }
  }

  private async ensureModule(id: string) {
    const [row] = await this.db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.id, id))
      .limit(1);
    if (!row) {
      throw new NotFoundException('Module not found');
    }
  }
}
