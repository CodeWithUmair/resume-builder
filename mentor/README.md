# Mentor — your interview & job coach

A terminal AI mentor for landing a **Senior Full-Stack AI Engineer** role (or a good
client). Built on **LangGraph + Claude**, personalised with your real profile.

Three modes:

1. **Mock interview** — a strict senior interviewer drills you on the 65 topics from
   `interview-prep.html`, grades each answer 0–10, names the gaps a senior answer would
   cover, asks a sharper follow-up, and **tracks your weak areas** so it drills them next.
2. **Job / client coach** — paste a job post or client brief; get an honest fit score,
   what to lead with, gaps to prepare for, likely interview questions, and a tailored pitch.
3. **Progress** — how many topics you've attempted, your average, and weakest areas.

## Run it

```bash
npm run mentor          # interactive mentor
npm run mentor:check    # non-interactive smoke test (verifies the graph end-to-end)
```

Requires `ANTHROPIC_API_KEY` in `.env` (already used by the resume builder).
Optional: `MENTOR_MODEL` env var to change the model (default `claude-sonnet-4-6`).

## Files

| File            | What it is                                                            |
|-----------------|-----------------------------------------------------------------------|
| `cli.ts`        | Terminal UI — mode menu + the interrupt/resume interview loop         |
| `graph.ts`      | The LangGraph mock-interviewer (state, nodes, `interrupt` for input)  |
| `coach.ts`      | The job/client coach (one LLM call, structured JSON out)              |
| `questions.ts`  | The 65-question bank (category + difficulty), mirrors the HTML        |
| `store.ts`      | Progress persistence (`.mentor-progress.json`) + weak-area picker     |
| `profile.ts`    | Your profile — the mentor's knowledge base about you                  |
| `llm.ts`        | Thin Anthropic SDK wrapper (same client as `lib/generate.js`)         |
| `smoke.ts`      | Headless end-to-end check                                             |
| `LANGGRAPH-EXPLAINED.md` | Learn LangGraph through your own SDR agent + this mentor    |

## How progress works

Every graded answer is appended to `.mentor-progress.json` (gitignored). The interviewer
picks your next question by: (1) never-attempted first, (2) then lowest previous score,
(3) HIGH difficulty before MED. So the more you use it, the more it targets your weak spots.

## Learning LangGraph

Read `LANGGRAPH-EXPLAINED.md`. It walks through your **AI SDR agent** code line by line,
maps every concept to this mentor, and ends with four exercises to cement it.
