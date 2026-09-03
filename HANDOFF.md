# HANDOFF — resume-builder repo

> **Purpose of this file:** single source of truth for what this repo is, what's been
> done, and what's next — so a new chat session can pick up with full context instead
> of re-deriving it. **Update the "Session Log" section at the end of every work
> session**, in summarized-but-informative form (what changed, why, what's left).
> Keep the sections above it (Repo Purpose, Current State, Architecture) accurate —
> edit them in place when they go stale, don't just append.

---

## Repo purpose

Two things live in this repo, both belonging to **Umair Amir** (Full-Stack AI Engineer,
Karachi, switching jobs toward a **Senior Full-Stack AI Engineer** role):

1. **Resume/cover-letter builder** (the original repo) — generates tailored `.docx`
   resumes and cover letters from job postings synced out of Google Drive, using the
   Claude API to reword/reorder a fixed profile (`lib/generate.js`) per job.
2. **Interview prep system** (added 2026-07) — static HTML study material plus a
   terminal AI mentor, to prepare for senior-level interviews (backend/AI-heavy,
   full-stack, DSA, system design).

## Current state (as of 2026-08-01)

- Resume builder: working locally (`npm run sync`, `npm run build`). No changes made
  to it recently.
- `interview-prep.html` — detailed 65-question study guide (13 categories: JS/TS,
  Node, NestJS, REST/GraphQL, Postgres, Mongo, Redis, Docker/CI, Auth, System Design,
  AI/LLM, React/Next, DSA). Native `<details>` accordions, zero-JS-render, fast.
  Progress tracked via localStorage checkboxes.
- `interview-questions.html` — the file Umair actually uses day to day. Same 65
  topics, questions only (no answers). **One "Search →" button per topic** that opens
  `claude.ai/new?q=...` with a single heavy prompt combining three modes in one
  session: deep teaching → strict mock interview → code-review/bug-hunt drill. Framed
  around his real background (4 yrs full-stack: WordPress/Shopify/Next.js/Node.js,
  backend focus more recent) so Claude treats him as senior and doesn't pad with
  basics. **Do not add multiple buttons back** — he explicitly rejected a 3-button
  (Learn/Interview/Review) version in favor of one button, one combined prompt.
- `mentor/` — TypeScript + LangGraph CLI mentor (`npm run mentor`). Three modes: mock
  interview (LangGraph graph with `interrupt()` human-in-the-loop, grades 0–10,
  persists to `.mentor-progress.json`, prioritizes weak areas), job/client coach
  (paste a job post → fit score + prep + tailored pitch), progress dashboard. Built to
  mirror Umair's own AI SDR agent (`D:\mine\ai-sdr-agent`) so he learns LangGraph from
  his own code — see `mentor/LANGGRAPH-EXPLAINED.md`. Uses the **raw
  `@anthropic-ai/sdk`** inside graph nodes, not `ChatAnthropic`, because this account's
  model rejects `top_p:-1` / `temperature`+`top_p` together, which the langchain
  wrapper sends by default.
- **Deploy**: `netlify.toml` added — builds a `dist/` folder containing only
  `interview-questions.html` (renamed to `index.html`), so the Netlify site serves
  *only* that file, nothing else in the repo. Repo pushed to
  `github.com/CodeWithUmair/resume-builder` (public). Umair was walked through
  connecting it on Netlify's UI (Import from GitHub → auto-detects `netlify.toml`) —
  **confirm in the next session whether the site actually deployed** and get the URL.

## Architecture / key files

```
lib/generate.js          — Umair's PROFILE (skills/experience/projects) + Claude prompt
                            for tailoring resume JSON per job. Source of truth for his
                            background; mentor/profile.ts mirrors it for the AI mentor.
sync.js, build-resume.js,
build-cover-letter.js    — original resume pipeline (Google Drive → docx)
interview-prep.html      — detailed answers, 65 Qs, static accordion UI
interview-questions.html — questions-only + single combined Claude-prompt button
                            (THIS is the file deployed to Netlify)
netlify.toml             — deploy config: copies interview-questions.html → dist/index.html
mentor/
  questions.ts           — the 65-question bank (mirrors interview-prep.html; keep in sync)
  profile.ts              — Umair's profile for the mentor (mirrors lib/generate.js)
  graph.ts                — LangGraph mock-interviewer (state, nodes, interrupt/resume)
  coach.ts                — job/client fit coach (single LLM call, structured JSON)
  llm.ts                  — raw Anthropic SDK wrapper used by graph.ts/coach.ts
  store.ts                — progress persistence + weak-area picker
  cli.ts                  — terminal UI (custom line-buffering reader, not rl.question —
                             rl.question drops lines that arrive while awaiting the model)
  smoke.ts                — headless end-to-end check (npm run mentor:check)
  LANGGRAPH-EXPLAINED.md  — teaches LangGraph via Umair's real SDR agent code
  README.md               — mentor usage docs
```

## Secrets / safety notes

- `.env`, `credentials.json`, `.auth-token.json`, `.mentor-progress.json` are all
  git-ignored and confirmed NOT tracked (repo is public on GitHub — verify this stays
  true before any future commit that touches these areas).
- `ANTHROPIC_API_KEY` in `.env` is required for both the resume builder and the mentor.

## Known open threads / next steps

- Confirm Netlify deploy succeeded and get the live URL; smoke-test the Search button
  from the deployed site (not just locally).
- `mentor/` has never been used interactively by Umair for real prep yet — only
  smoke-tested by the assistant. Worth checking in on how it feels in practice.
- If interview-prep.html's 65 questions ever change, mentor/questions.ts and
  interview-questions.html must be updated to match (currently manually kept in sync,
  no single source of truth — could be worth fixing if this drifts).

---

## Session Log

### 2026-08-01 — HANDOFF.md created
Created this file to give future sessions full context without re-deriving it.
No code changes this session beyond adding HANDOFF.md itself.
