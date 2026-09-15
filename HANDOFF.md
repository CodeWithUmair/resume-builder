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

## Current state (as of 2026-09-04)

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

## Job applications (added 2026-09-04)

This repo is now also where job applications get written, not just the resume pipeline.

### Umair's real background — READ THIS BEFORE WRITING ANY RESUME

The old automation profile was wrong in ways that shipped on real resumes. Corrected facts:

- **Decrypted Labs is Jun 2024 - Present.** Not 2021. The old routine hardcoded 2021 and
  it went out on every generated resume.
- **Current work is healthcare, not cruise booking.** Two client CRMs, both live:
  - `D:\work\chiro` — **Chiro360**, chiropractic auto-accident billing CRM.
    Next.js 16.2.4 + React 19.2.4 + NestJS + Prisma + Postgres. Patients, appointments,
    visits, CPT/ICD coding, insurance claims, attorney LOP, visit-based billing ledger,
    ~31 screens. Server-side permission guards per controller, server-only session layer
    (`frontend/src/lib/dal.ts`), AuditTrail model, 76 Playwright E2E tests passing.
    Umair designed the CPT/visit billing model the rest of the system depends on.
    Each repo has its own HANDOFF.md — read those, they are detailed.
  - `D:\work\DME` — durable medical equipment billing CRM. NestJS + Next.js.
    CMS-1500 generation, AWS Textract OCR, S3, OTP email auth, billing ledger.
    One codebase deployed as two white-label instances for two clients on isolated
    Supabase DBs. EC2 + pm2 + GitHub Actions. Umair handles the deploys and migrations.
- **Cruise booking platform: he inherited it, did not build it.** A senior colleague
  built ~half, then left the company. Umair got one handover session, read the codebase,
  finished and shipped it. He built the referral/promo engine and scheduled payouts.
  It is **React + Node + MongoDB, NOT Next.js**. Do not write "built from scratch".
  This is a strength, not a weakness — many postings ask for exactly this experience.
- **Do not use the word "owned"** for client projects. Umair dislikes it, it reads as
  business ownership. Use "responsible for" / "my responsibility".
- **LightNX Defence Platform and the multi-tenant RAG platform are real and live.**
  Confirmed 2026-09-03. LightNX = defence client, real-time asset tracking, RBAC over
  sensitive data. Use LightNX for any role mentioning security, RBAC, or regulated data.
- **Next.js experience: just over 3 years** (started around Next 13, ~1 year of React
  before that). Now on Next 16 / React 19 daily via Chiro360.
- Confirmed by Umair 2026-09-03: he has reviewed others’ PRs and blocked a merge; he has
  read MongoDB execution plans and fixed indexes; he has found and fixed a real security
  issue (auth checked in UI only, API route left open).

### Writing rules Umair has asked for

- **No em dashes or en dashes anywhere.** Hyphens inside compound words are fine.
- No generic AI phrasing, no sugar-coating, no corporate speak.
- Plain professional English. He is not a native speaker, so for anything he has to
  *say out loud* (video scripts, calls) use short sentences and simple words. Keep the
  technical terms, simplify the English around them.
- Never fabricate specifics of his real experiences. Ask him. He confirms readily.

### Psychable application (in progress)

Senior Full Stack Developer, Next.js/MongoDB, part-time 10-20 hrs/wk, $2-3k/month,
US remote, direct contract. Applied via Indeed. Drive folder:
"Job Applications/Remote/2026-09-03 - Psychable - Senior Full Stack Developer".

- It is a **code-review-first role**. "We need a developer who is as good at reviewing
  code as writing it." The review gate is the first thing you would own.
- **The 8 application questions ARE the application.** "Applications without the answers
  to our questions will not be reviewed." Each answer field is capped at **1500 chars**.
- Status: **Q1-Q7 written and verified under the limit. Q8 (video) not yet recorded.**
  Answers and the video script are in `psychable-application-answers.md` and the
  session transcript. Documents in `output/Remote/`.
- Umair still needs to: record the video, upload unlisted, test the link logged out.

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
- **`.auth-token.json` is DEAD.** Expired 2026-06-08, `invalid_grant`. Its scope is
  `drive.readonly` so it could not write anyway. It also carries
  `refresh_token_expires_in`, which Google only sets when the OAuth consent screen is
  in **Testing** mode — refresh tokens die after 7 days there. `npm run sync` will keep
  failing until Umair re-auths AND publishes the consent screen. `auth-setup.js` is an
  interactive browser flow, so only Umair can run it.
- **To write to Drive, use the MCP connector, not the OAuth token.** It has separate,
  working auth. Use `create_file` with `textContent` + `contentMimeType: "text/html"`
  and let Drive convert it to a Google Doc. **Base64 .docx upload fails** with "invalid
  argument". `update_file` only changes metadata (title/parent), so to change content
  you must trash the old doc and create a new one.
- **Unrelated live security issue, flagged to Umair 2026-09-04:**
  `D:\work\chiro\HANDOFF.md` contains a real production password in plain text and is
  committed to git. That repo has a `client` remote pointing at a GitHub account Umair
  does not control. Needs rotating and scrubbing from history. Not done yet.

## Known open threads / next steps

- **Psychable: record the video (Q8) and submit.** Everything else is written.
- **Rotate the chiro production password** and scrub it from git history (see Secrets).
- **Re-auth Google Drive** (`node auth-setup.js`) and publish the OAuth consent screen
  so it stops expiring weekly. Only needed for `npm run sync`; Drive writes work via MCP.
- `job-automation-routine.md` is the corrected v2 of Umair’s job-search prompt. It lives
  in this repo but he runs it elsewhere, so **paste it over the old one wherever it runs**.
  Unclear whether he has done that yet.
- Old applications in `job-applications-archive.json` have **no full job descriptions**,
  only summaries. That data is unrecoverable (the shortlinks are dead). Only new runs of
  the v2 routine will capture full JDs.
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

### 2026-09-04 — Psychable application, automation routine rewrite

Applied to Psychable (Senior Full Stack Developer). Built a tailored resume and cover
letter, then rewrote both twice as facts got corrected.

**What happened, in order:**

1. Built resume/cover letter from the Drive folder the automation had generated. That
   generated resume dated Decrypted Labs to 2021 (real: Jun 2024) and contained a leaked
   internal note inside a resume bullet: *"same domain as the Psychable marketplace Umair
   would own"*. Rebuilt from his real CV instead.
2. Umair supplied the **actual Indeed job description**, which his automation had reduced
   to ~10 summary lines. The real posting was a code-review-first role requiring 8 written
   answers and a video. None of that survived into the stored Job Info doc.
3. Diagnosed the automation and wrote `job-automation-routine.md` (v2). Root causes:
   Job Info stored only derived summaries and never the raw JD; the profile block was
   stale and wrong; and the project-bullet template literally instructed the model to
   write `[why it matters for this specific remote role]` as a bullet, which is what leaked.
4. Umair corrected several facts: LightNX and the RAG platform are real; the cruise
   platform was inherited not built, and is React not Next.js; "owned" is the wrong word.
5. **Umair then pointed at `D:\work\chiro` and `D:\work\DME`** as his actual current
   work. Read both. Chiro360 runs Next.js 16.2.4 / React 19.2.4, which is Psychable’s exact
   stack, in healthcare, with server-side authorization and 76 Playwright tests. Rewrote
   the resume, cover letter and video script around these instead of cruise booking. This
   was the single biggest improvement to the application.
6. Wrote all 8 answers to the 1500-char field limit and verified each count.

**Files added:** `job-automation-routine.md`, `psychable-application-answers.md`,
`output/Remote/Umair-Resume-Psychable.docx`, `output/Remote/Umair-CoverLetter-Psychable.docx`.

**Open question for next session:** the resume lists Chiro360 and DME under Decrypted Labs
(Jun 2024 - Present). Umair has not confirmed whether those are Decrypted Labs work,
freelance, or through another company. Verify before he submits anywhere else.
