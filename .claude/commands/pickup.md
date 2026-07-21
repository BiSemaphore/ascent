---
description: Start-of-session read-in for Ascent — report where we are and what's next.
---

You are starting a work session on **Ascent** (a cohort-based EdTech LMS built as
microservices). Read the project state and report it. Do NOT start building yet.

## Steps

1. Read these, in order:
   - `CLAUDE.md` (project context, learning approach, current state)
   - `docs/PRD.md` (what & why)
   - `docs/ROADMAP.md` (the phased plan)
   - `docs/ARCHITECTURE.md` (services, communication, decisions)
2. Check live repo state:
   - `git log --oneline -10`
   - `git status`
3. Find the **current phase** in `docs/ROADMAP.md` — the first phase that still has
   unchecked `[ ]` boxes.

## Report back (concise)

- **What Ascent is** — one line.
- **Current phase** — its name, what's already done (checked) vs remaining (unchecked).
- **Uncommitted changes** — anything in `git status` worth noting.
- **Suggested next concrete step** — the smallest next action.

## Rules

- Do NOT scaffold code, install packages, or run generators yet — **confirm the next
  step with the user first.**
- Honor the learning approach in `CLAUDE.md`: explain the *why*, define jargon, teach
  the raw layer before framework abstractions (especially Kafka), one small step at a time.
</content>
