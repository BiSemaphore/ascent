---
description: End-of-session handoff for Ascent — update the docs so a fresh session continues cleanly.
---

You are wrapping up a work session on **Ascent**. The docs are the project's memory —
update them to reflect reality so the next session picks up without drift.

## Steps

1. See what changed this session:
   - `git status`
   - `git diff --stat`
2. Summarize, in plain language, what was accomplished this session.
3. **Update the docs to match reality:**
   - `docs/ROADMAP.md` — tick completed `[ ]` → `[x]` boxes for the current phase; if a
     phase is fully done, note it and point to the next.
   - `docs/ARCHITECTURE.md` — if services, tech, ports, events, or decisions changed,
     update it.
   - `CLAUDE.md` — update the **"Where we are / next step"** section with the current
     state and the exact next action.
   - `README.md` — if code was added, ensure run/setup instructions are current.
4. **Consistency sweep** — service names, phase numbers, ports, and decisions must match
   across all docs. If unsure, grep for stale terms (e.g. old service names) and fix them.
5. State the **exact next step** for the next session.

## Rules

- Do NOT `git commit`, push, or publish unless the user explicitly asks.
- Only update docs to reflect what actually happened — don't invent progress.
- Keep the tone and structure of the existing docs.
</content>
