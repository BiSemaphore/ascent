# Product Requirements Document (PRD) — Ascent

A PRD answers **what** we're building, **for whom**, and **why** — in plain language, before any code. Everything technical points back here.

---

## 1. Vision (one line)

**Ascent is a full EdTech platform — a Learning Management System (LMS)** — where instructors create and publish courses, and learners enroll, consume content, complete assessments (including **auto-graded coding problems**), and track their progress toward completion. Built as a microservices system to showcase real distributed-systems engineering.

> It is a *complete LMS product*, not just a coding tool. Hands-on, auto-graded coding practice is a standout **feature** within it — a differentiator vs. a plain video LMS.

## 2. The problem

Learning platforms are either shallow (just videos) or narrow (just problems). A strong EdTech product combines **structured courses + real content + assessments + hands-on practice + progress + a path to completion**, for both learners and the instructors who run the courses. Building that well — course management, safe code execution, concurrency, real-time feedback, at scale — requires solving genuinely hard engineering problems, which is the point of this project.

## 2a. Build principle — design the whole, build in slices

This PRD describes the **complete LMS product vision**. We do **not** build it all at once. The [roadmap](ROADMAP.md) sequences it into working slices: a basic course-and-lessons LMS first, then enrollment, then assessments and the coding judge, then live classes, and so on. Every real EdTech platform grew this way. The full product is the destination; each phase is a working milestone.

## 3. The core model — cohort-based learning

Ascent is **cohort-based**, like Scaler (not self-paced like Udemy/LeetCode). Learning is organized around **cohorts**: scheduled batches of learners who progress through a program together.

- A **program** (e.g. "Full-Stack Development") has a fixed **curriculum** (courses → modules → lessons + assessments).
- A **cohort** is a dated instance of a program (e.g. "Full-Stack — Aug 2026 Batch") with a **start date**, a **schedule**, **limited seats**, assigned **mentors**, and a group of **peers**.
- Content and live sessions **unlock over time** according to the cohort schedule.
- Learners have **deadlines**, see a **cohort leaderboard**, and can discuss with cohort-mates.

## 4. Target users

| Role | Needs |
| --- | --- |
| **Learner** | Enroll in a cohort, follow the schedule, watch/read lessons, solve auto-graded coding problems, submit assignments, track progress against the cohort, attend live classes, compete on the cohort leaderboard, get a certificate on completion |
| **Instructor / Mentor** | Create program curriculum (courses, lessons, coding problems with test cases); run a cohort; hold live classes; grade/track learner progress; answer doubts |
| **Admin** | Create programs, open/schedule cohorts, set seat limits, manage users and platform health |

## 5. Core features (the full product vision)

Grouped by area. See the [roadmap](ROADMAP.md) for the order we build them — **not all at once**.

### Content & curriculum
- Programs → courses → modules → lessons (video / text / resources).
- Instructors create and publish curriculum.

### Cohorts (the heart of the product)
- Admin opens a cohort of a program: start date, schedule, **limited seats**, mentors.
- Learners **enroll** in a cohort — concurrency-safe, seats never oversold.
- Content and live sessions **unlock on schedule**.

### Assessments
- **Quizzes** (auto-graded).
- **Coding problems** — the **online judge**: submit code, run against hidden test cases in a sandbox, get a verdict (Accepted / Wrong Answer / Time Limit Exceeded / Error).
- **Assignments** with deadlines.

### Progress, motivation & community
- Progress tracking and course completion (event-driven).
- **Certificates** on completion.
- Gamification: XP, streaks, and a **cohort leaderboard**.
- Discussions / doubts within a cohort.
- Real-time: submission verdicts and updates stream back live.

### Live classes
- Scheduled sessions per cohort (embed/link video — we do not build a streaming pipeline).

### Accounts & platform
- Auth with roles (learner / mentor / admin).
- Notifications (announcements, deadlines, results).
- Payments / cohort purchase (kept minimal — stub or one demo flow).
- Instructor & admin dashboards and analytics.

## 6. Explicitly out of scope

- Building a **video streaming pipeline** (we embed or link video, not transcode).
- Real payment processing (stub it, or a single demo flow at most).
- Mobile apps.
- Production-grade content moderation.

## 7. Success criteria

This project succeeds if it can:
1. Run locally with a single `docker-compose up`.
2. Demonstrate a full **event-driven flow**: a code submission triggers judging, and the result fans out to progress, gamification, and notifications via Kafka.
3. Safely execute untrusted user code in a sandbox.
4. Handle concurrent cohort enrollment without exceeding seat limits.
5. Show a polished Angular UI where a learner solves a problem and watches the verdict arrive in real time.
6. Be explainable end-to-end in an interview, with a clear architecture diagram.

## 8. The "demo that lands"

A learner opens a coding problem, writes a solution in an in-browser editor, hits **Submit**, and watches it get queued, run in a sandbox, and return "Accepted — 10/10 tests" in real time — while their XP ticks up and the leaderboard reshuffles.
</content>
