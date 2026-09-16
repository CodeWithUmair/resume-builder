# HANDOFF — resume-builder repo

> ## RULE, added 2026-09-16: never create Resume or Cover Letter files in Google Drive.
> Google Drive only ever holds **Job Info** files (via the cloud routine). When
> generating a Resume/Cover Letter for a specific application — always a manual,
> per-application request in a session, never automatic — write them **locally in
> this repo**, under `output/<Remote|Pakistan>/<Company> - <Job Title>/resume.docx`
> and `.../cover-letter.docx`, using `build-resume.js` / `build-cover-letter.js`
> (`--data-file <json> --output <path>`, see either file's header for the expected
> JSON shape). This was violated once on 2026-09-16 (Nemonx Resume/Cover Letter got
> created as Drive Docs) and corrected immediately — the Drive docs were deleted and
> redone as local `.docx` files. Do not repeat that mistake for any future job.

> ## RULE, added 2026-09-16: every job folder gets its own interview storytelling guide.
> `interview-storytelling-guide.md` used to live at the repo root as one shared file.
> Umair wants each job self-contained instead: `output/<Remote|Pakistan>/<Company> -
> <Job Title>/interview-storytelling-guide.md`, alongside that job's `resume.docx` and
> `cover-letter.docx`. It moved out of the root entirely (deleted there, not copied) —
> there is no shared master file anymore. When starting a new job's application
> materials, create a fresh copy in that job's folder containing: the general
> five-beat framework + Umair's real project write-ups (hook / optional backstory /
> decision / scar / result — reuse the content from an existing job's copy, e.g.
> Nemonx's, as the template, don't reinvent it each time) plus a "Round [N] plan"
> section specific to that job's actual interview process and JD emphasis. Because
> `output/` is git-ignored, these never get committed or pushed — same as the docx
> files, this is local-only, per Umair's review, not shared.

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

### Psychable application (submitted, awaiting reply as of 2026-09-16)

Senior Full Stack Developer, Next.js/MongoDB, part-time 10-20 hrs/wk, $2-3k/month,
US remote, direct contract. Applied via Indeed. Drive folder:
"Job Applications/Remote/2026-09-03 - Psychable - Senior Full Stack Developer".

- It is a **code-review-first role**. "We need a developer who is as good at reviewing
  code as writing it." The review gate is the first thing you would own.
- **The 8 application questions ARE the application.** "Applications without the answers
  to our questions will not be reviewed." Each answer field is capped at **1500 chars**.
- **Status update 2026-09-16: fully submitted.** Umair recorded and submitted the Q8
  video roughly two weeks ago (around early September). All 8 answers plus the video
  went in. **No reply from Psychable yet.** `psychable-application-answers.md` (the
  written answers/video script) was deleted from this repo in an earlier session as
  no-longer-needed once submitted — the Drive folder's "Application Answers" doc is
  the remaining record. Treat this one as done-and-waiting, not as an open task; a
  cold application with no reply after ~2 weeks is normal, don't chase it, but also
  don't tell Umair anything implying it still needs work.

### Job-search automation routine — reworked 2026-09-15/16, scope changed

`job-automation-routine.md` (Remote) and the new `job-automation-routine-pakistan.md`
(Pakistan) both changed shape: **they no longer generate a Resume or Cover Letter Doc.**
Each now does one thing — find postings, verify/resolve the apply link, and save a single
detailed "Job Info" file to the Drive folder for that job. Resume/cover letter generation
for a specific application now happens separately, in this repo, using that Job Info file
plus the real-background facts above as input. This replaces the old stale next-step ("v2,
unclear if pasted over the old one") below — both files are pushed to origin
(commit `e131838`), Remote is v4, Pakistan is v3.

- **`job-automation-routine.md` has an uncommitted local edit right now**: Step 1 was
  rewritten to search the Indeed/Dice/ZipRecruiter connectors' `search_jobs` tools directly
  before falling back to site search. Review and commit next session if it looks right.
- **Real run exposed a platform bug, not a config mistake.** Domains added under
  Settings → Capabilities do not actually get through — every site-search fallback
  (WeWorkRemotely, RemoteOK, Himalayas, Wellfound, Arc.dev, even ZipRecruiter's own site for
  resolving links) still hit a network block on a real run. Only the Indeed/Dice/ZipRecruiter
  *connector* tools worked, because those run server-side on the provider's own API rather
  than through Claude's blocked browsing path. Practical ceiling right now is whatever those
  three connectors surface — one real run returned 5 jobs, not the routine's target of 10.
- Two gaps found, not yet fixed, want more data before deciding:
  1. ZipRecruiter's connector has no `get_job_details` tool, so a strong ZipRecruiter match
     with no capturable full JD gets silently dropped instead of saved. Considered a
     "partial Job Info, JD NOT CAPTURED — check manually" fallback tier for a v5; held off,
     want a few more runs to see if the drop rate justifies the extra complexity.
  2. Dice returned mostly irrelevant .NET/Java/government-clearance roles in that one run —
     may not be worth keeping, but one data point isn't enough to cut it yet.
- The quality gate is working as intended: that run correctly flagged **MRoads** (no public
  company profile) and **Softforms Inc** ($150-250k for a vague role, zero public profile)
  rather than presenting them as clean matches. Don't relax this chasing volume.

### More job-board MCP connectors — researched, not yet wired in

Umair wants more daily volume since he's now applying aggressively. Status:

- **Official claude.ai connectors** (Settings → Connectors → Discover): only Indeed, Dice,
  ZipRecruiter confirmed as verified job-board connectors as of this session. Worth
  re-checking Discover for LinkedIn/Glassdoor/Monster/Greenhouse/Lever/Ashby — the directory
  grows fast and may have added some since.
- **Two Apify-hosted MCP actors found, cost/trust caveats noted, not yet connected:**
  - `jungle_synthesizer/rozee-pk-pakistan-job-listing-scraper` — Rozee.pk (Pakistan's
    dominant board). $1.60/1,000 records scraped. 0.0 rating, 3 total users — unproven.
  - `apricot_blackberry/job-board-aggregator` — LinkedIn + Glassdoor + ZipRecruiter in one
    feed. **$50.00/1,000 job postings** — cost this out before running it daily. 0.0 rating,
    104 total users — also unproven, and LinkedIn/Glassdoor scraping is inherently flaky
    (both sites actively fight scrapers).
  - Both reachable via Apify's hosted MCP gateway, scoped to just those tools:
    - `https://mcp.apify.com/?tools=fetch-actor-details,jungle_synthesizer/rozee-pk-pakistan-job-listing-scraper`
    - `https://mcp.apify.com/?tools=fetch-actor-details,apricot_blackberry/job-board-aggregator`
- **Added locally in Claude Code only** (this repo, via
  `claude mcp add apify "https://mcp.apify.com/" -t http`, unscoped — exposes all 69k+ Apify
  tools). This does **not** reach the claude.ai cloud routine, which has its own separate
  Connectors list. Needs Apify OAuth on first real tool call — not done yet (non-interactive
  session can't complete that popup).
- **Still needed on claude.ai itself (Umair's action, not doable from a coding session):**
  Settings → Connectors → Add custom connector → paste the two scoped URLs above as two
  separate connectors → complete the Apify OAuth popup for each → then open the routine's
  own task/Project settings and confirm the new connectors are actually enabled there
  (adding a connector globally doesn't always auto-enable it inside an existing scheduled
  routine).
- **Explicitly ruled out:** auto-apply/form-filling MCP tools that drive LinkedIn Easy Apply
  / Greenhouse / Ashby / Workday via browser automation with real login credentials — ToS
  and account-ban risk, a different risk class from an API-based connector. Not for an
  unattended routine.
- **Next step:** once Umair connects these and runs a real test, report what actually came
  back (genuine current postings vs empty vs cost per call) so the working one(s) can be
  folded into Step 1 of the relevant routine file, same pattern as Dice/ZipRecruiter.

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
- **Commit the pending `job-automation-routine.md` edit** (Step 1 connector-search
  rewrite) — see Job-search automation routine section above.
- **Connect the two Apify job-board connectors on claude.ai** and run a real test — see
  More job-board MCP connectors section above. Report results back before wiring into
  Step 1 of either routine file.
- **Decide on the ZipRecruiter partial-listing fallback and whether to keep Dice** —
  needs a few more real runs of data first (see Job-search automation routine section).
- Old applications in `job-applications-archive.json` have **no full job descriptions**,
  only summaries. That data is unrecoverable (the shortlinks are dead). Only new runs of
  the current routine will capture full JDs.
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

### 2026-09-15/16 — Job-search routine reworked to Job-Info-only, connector research

Umair said the routine's actual job — generating a Resume/Cover Letter Doc per posting —
wasn't what he wanted. His real workflow: the cloud routine finds jobs and saves the
posting; he pulls that into this repo to generate the resume/cover letter only when he's
actually applying. Rewrote both routine files around that:

1. `job-automation-routine.md` → v3, then v4. Dropped Resume/Cover Letter file creation
   entirely (Step 4 went from 3 files to 1). Added apply-link resolution (follow
   shortlinks/redirects, record both, flag dead/unresolved links) to Step 2. v4 rewired
   Step 1 to search the Indeed/Dice/ZipRecruiter connectors directly via `search_jobs`
   before falling back to site search, since connector APIs run server-side and bypass a
   network block that turned out to affect every site-search fallback.
2. `job-automation-routine-pakistan.md` created (didn't exist in the repo before — only
   pasted into chat previously). Same Job-Info-only rework, dropped the "read base resume
   from Personal Information" step since there's no resume to generate here anymore.
3. Committed and pushed both (`e131838`) along with an unrelated pending HANDOFF.md update
   and a deleted `psychable-application-answers.md`.
4. Ran the reworked remote routine for real. Confirmed a **platform bug**: the
   Settings → Capabilities domain allowlist does not actually reach the routine's sandbox —
   every site-search fallback still hit a network block, only the three connector APIs
   worked. Real yield was 5 jobs, not 10, with 2 of those correctly flagged as sketchy
   (MRoads, Softforms) rather than scored clean.
5. Umair wants more volume since he's applying aggressively now. Researched additional
   job-board MCP options: official claude.ai connectors beyond Indeed/Dice/ZipRecruiter
   are unconfirmed; found two Apify-hosted actors (Rozee.pk scraper, LinkedIn+Glassdoor+
   ZipRecruiter aggregator) reachable via Apify's MCP gateway. Flagged cost ($50/1,000 for
   the aggregator vs $1.60/1,000 for Rozee.pk) and trust caveats (both 0.0 rated,
   low-usage, community-maintained) before recommending. Added the generic Apify MCP
   server locally in Claude Code (`claude mcp add apify`) for testing in this repo — does
   not affect the claude.ai cloud routine, which needs the two scoped URLs added as
   *custom connectors on claude.ai itself* (Umair's action, still pending, needs Apify
   OAuth). Explicitly ruled out auto-apply/form-filling MCP tools (LinkedIn Easy Apply
   etc. via browser automation) as too much ToS/ban risk for an unattended routine.

**Open for next session:** commit the pending v4 diff to `job-automation-routine.md`;
confirm whether Umair connected the two Apify connectors on claude.ai and what a real
test run returned; decide on the ZipRecruiter-partial-listing fallback and Dice
keep/drop once a few more runs give more data.

### 2026-09-16 — Drive cleanup, target raised to 20, backfilled short Job Info files

Three things, all in Google Drive plus two routine-file edits (uncommitted, see below).

1. **Deleted job folders older than 20 days** (cutoff 2026-08-26) from both
   "Job Applications/Remote/" and "Job Applications/Pakistan/". 22 of 34 trashed
   cleanly. **12 were blocked by a permission classifier** ("Unverifiable Deletion
   Scope" — reads as a bulk-delete throttle, not a hard rule) and are still sitting in
   Drive: Remote — Nexxt Ideas, Lemon.io. Pakistan — Q-Solutions, Smart Working
   Solutions, Volga Partners, Yellow Squad Inc, Dr Hud, BearPlex, Appicoders Inc, The
   Services Tree Enterprises, Progatix, COLOR STUDIO PROFESSIONAL. All dated Aug 07-15,
   same criteria as the ones that succeeded — Umair needs to delete these manually or
   grant a permission rule for bulk Drive deletes.
2. **Both routine files' Step 1 changed from "FIND 10" to "FIND 20"** — Umair is in
   high-volume application mode now. `job-automation-routine-pakistan.md` is already
   committed at this new target; **`job-automation-routine.md` has this change
   uncommitted, stacked on top of the also-still-uncommitted v4 Step-1-connector-search
   diff from the previous session** — both need reviewing and committing together.
3. **Backfilled 6 short-form Job Info files that predated the "capture full JD"
   fix**, using the Indeed connector's `search_jobs` + `get_job_details` (re-finding
   each posting by company+title since the original Indeed shortlinks 403/404 on
   direct WebFetch — Indeed itself blocks non-browser fetches, this is not the sandbox
   network bug from the earlier session, that was specific to the cloud-routine's
   sandbox; this local session has real internet access, it's the target sites doing
   the blocking). Old docs trashed, new `text/plain` docs created in the same folders
   (Drive's `update_file` still only changes title/parentId, never content — confirmed
   again this session, so replace-via-trash-and-recreate remains the only path):
   - **Zeta Corp** (Pakistan) — full JD revealed **2 required application questions**
     ("current salary?" / "expected salary?") that the original short scrape missed
     entirely. Have real numbers ready before applying.
   - **Outsource Origin Limited** (Pakistan) — full JD revealed **8 required
     application questions** (AI/RAG experience, tool-calling, Meta/Google Ads API,
     comfort with a 2-3 person team, 12pm-9pm on-site hours, join within 1-2 days,
     salary confirmation) — the original scrape only had "must join within 1-2 days."
     This is not a resume-and-letter-only application.
   - **Dolphin Advanced** (Pakistan) — full JD confirms Flutter/React Native mobile
     dev is a core "What You'll Do" item, not optional, plus fintech/POS experience
     and 5-8 years — sharper gaps than the original short version implied. Its salary
     field is a broken placeholder ("Rs2.00 - Rs3.00 per year"), not real data.
   - **Hbox Digital** (Pakistan) — full JD confirms Adonis.js + React Native are both
     explicitly required, plus native Android/iOS preferred — more mobile-skewed than
     the short version suggested.
   - **Softvira** (Pakistan) — full JD confirms this is genuinely code-first agent
     building ("We want a builder who can code... not someone who only has experience
     using ready-made AI tools"), strengthens the case, no new gaps. Apply by emailing
     careers@softvira.com with GitHub/portfolio links attached — no formal questions.
   - **CloudLab Technologies** (Pakistan/remote-eligible) — full JD confirms
     remote-first plus concrete perks (MacBook Pro, health cover for family, annual
     bonus), and that Node.js counts as an alternative to FastAPI, softening that gap.
   **Could not backfill** (tried, no luck — reported to Umair as-is rather than
   guessed): **BitMEX**'s Greenhouse posting now shows "no current openings" (likely
   filled/closed — deprioritize). Tether Operations (404), Yooli/WeWorkRemotely (403),
   CREDIX/beincrypto (403), Cosuno/Personio (404) all blocked direct WebFetch and
   aren't Indeed-sourced so the connector couldn't help either — status unconfirmed,
   Umair should open these links himself before investing application time. amIT
   Global Solutions, Ecom Elite By SMG, Connect Logistics, and Retail online are
   Indeed-sourced but didn't turn up via the connector's re-search (likely expired off
   Indeed's live index) — their original short Job Info is all that exists for these
   four, full JD is not recoverable.

**Also corrected:** Psychable is not an open task — Umair recorded and submitted the
Q8 video roughly two weeks ago, all 8 answers went in, no reply yet. See the Psychable
section above.

**Open for next session:** commit the two stacked uncommitted diffs on
`job-automation-routine.md` (v4 connector-search rewrite + FIND 20 change); Umair to
manually clear the 12 Drive folders the permission classifier blocked; consider
whether the "capture full JD before scoring" step should have caught these gaps
originally — it was added specifically to prevent this class of problem (see the v1→v2
changelog in `job-automation-routine.md`) but several 09-03/09-04 folders still
predate that fix.

### 2026-09-16 (cont.) — Nemonx application, real profile correction, output-location fix

Umair corrected his own profile mid-session: NestJS is ~1 year of real production work
(not "familiar, not primary") across two live client SaaS products during the Decrypted
Labs period — Chiro360 (chiropractic billing CRM, he designed the core CPT/visit billing
model) and DME (durable medical equipment billing CRM, white-labeled for two clients).
Prisma is ~3 years, PostgreSQL ~1-1.5 years as his primary relational DB. Corrected the
profile in `job-automation-routine.md` and in `user-umair-profile.md` (memory). Bumped
Nemonx's Job Info match score 8→9/10 and rewrote its GAPS section to match reality —
also softened one claim rather than inflating it: no real SAML/OIDC experience exists,
so the resume frames it as "strong OAuth2/JWT/RBAC foundation," not direct SAML work.

Wrote `interview-storytelling-guide.md` — a reusable five-beat framework (constraint →
system shape → the one decision that mattered → what broke → outcome) for "walk me
through a project" interview rounds, a JD-to-project matching table, and a Nemonx-
specific Round 1 plan built around Chiro360's billing model. One line in it is
deliberately left for Umair to fill by hand: the actual schema/design tradeoff on the
billing ledger — a real memory only he has, not something to write from outside.

**Mistake made and corrected:** generated the Nemonx Resume/Cover Letter as Google Docs
in the Job Info Drive folder, same as the old (now-abandoned) workflow. Umair caught it
immediately — Drive must only ever hold Job Info, resume/cover letter generation is
local-only, per application, in `output/<Remote|Pakistan>/<Company> - <Job Title>/`.
Deleted the two Drive docs and regenerated them as real `.docx` files instead, using the
existing `build-resume.js`/`build-cover-letter.js` pipeline (JSON data files, `--output`
pointing at the new folder) rather than writing plain text. See the RULE banner at the
top of this file — this must not happen again for any future job.

**Open for next session:** confirm with Umair whether Chiro360/DME are formally
Decrypted Labs work or a separate arrangement before any more resumes go out naming
that employer. Fill in the real billing-ledger schema decision in
`interview-storytelling-guide.md`'s Nemonx section before that interview happens.
