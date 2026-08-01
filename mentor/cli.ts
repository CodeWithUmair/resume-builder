// mentor/cli.ts
// Your terminal mentor. Run: npm run mentor
//
// Modes:
//   1) Mock interview  — strict interviewer drills you, grades, tracks weak areas
//   2) Job / client coach — paste a job post, get an honest fit + prep + pitch
//   3) Progress         — see how you're doing and what's weakest
//
// Requires ANTHROPIC_API_KEY in .env (already used by your resume builder).

import "dotenv/config";
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { Command } from "@langchain/langgraph";
import { buildInterviewer, Grade } from "./graph.js";
import { coachOnJob } from "./coach.js";
import { record, summary } from "./store.js";

const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m", red: "\x1b[31m", mag: "\x1b[35m",
};
const color = (c: keyof typeof C, s: string) => `${C[c]}${s}${C.reset}`;

function scoreColor(n: number): keyof typeof C {
  if (n >= 8) return "green";
  if (n >= 5) return "yellow";
  return "red";
}

// Line-buffering reader: unlike rl.question(), this never drops lines that
// arrive while we're awaiting the model (important for piped input & tests).
class LineReader {
  private queue: string[] = [];
  private waiters: ((v: string | null) => void)[] = [];
  private ended = false;
  constructor(private rl: readline.Interface) {
    rl.on("line", (line) => {
      const w = this.waiters.shift();
      if (w) w(line);
      else this.queue.push(line);
    });
    rl.on("close", () => {
      this.ended = true;
      while (this.waiters.length) this.waiters.shift()!(null);
    });
  }
  ask(prompt: string): Promise<string | null> {
    output.write(prompt);
    if (this.queue.length) return Promise.resolve(this.queue.shift()!);
    if (this.ended) return Promise.resolve(null);
    return new Promise((res) => this.waiters.push(res));
  }
}

async function mockInterview(lr: LineReader) {
  console.log(color("cyan", "\n=== MOCK INTERVIEW ===") + color("dim", "  (blank answer to skip · 'menu' to exit)\n"));
  const app = buildInterviewer();
  const seen = new Set<string>();

  while (true) {
    const thread = { configurable: { thread_id: `q-${Date.now()}-${seen.size}` } };

    // First invoke runs until interrupt() — the graph picks a question and pauses.
    const paused = await app.invoke({ exclude: [...seen] }, thread);
    const question = paused.question;
    if (!question) break;
    seen.add(question.id);

    console.log(color("mag", `[${question.category}]`) + color("dim", ` ${question.difficulty.toUpperCase()}`));
    console.log(color("bold", question.q) + "\n");

    const answer = await lr.ask(color("cyan", "your answer › "));
    if (answer === null) break; // stdin closed
    if (answer.trim().toLowerCase() === "menu") break;
    if (!answer.trim()) { console.log(color("dim", "  (skipped)\n")); continue; }

    console.log(color("dim", "\n  grading…"));

    // Resume the SAME thread, feeding the answer back into interrupt().
    const done = await app.invoke(new Command({ resume: answer }), thread);
    const g = done.grade as Grade | null;
    if (!g) { console.log(color("red", "  (no grade returned)\n")); continue; }

    record(question.id, question.category, g.score);
    printGrade(g);
  }
}

function printGrade(g: Grade) {
  console.log("\n" + color(scoreColor(g.score), color("bold", `  Score: ${g.score}/10`)) + color("dim", `  — ${g.verdict}`));
  if (g.strengths?.length) {
    console.log(color("green", "  ✓ Strengths:"));
    g.strengths.forEach((s) => console.log("    • " + s));
  }
  if (g.gaps?.length) {
    console.log(color("yellow", "  △ What a senior answer adds:"));
    g.gaps.forEach((s) => console.log("    • " + s));
  }
  if (g.followUp) console.log(color("cyan", "  → Follow-up: ") + g.followUp);
  console.log("");
}

async function jobCoach(lr: LineReader) {
  console.log(color("cyan", "\n=== JOB / CLIENT COACH ===") + color("dim", "  paste the job post, then type END on its own line\n"));
  const lines: string[] = [];
  while (true) {
    const line = await lr.ask("");
    if (line === null || line.trim() === "END") break;
    lines.push(line);
  }
  const jobText = lines.join("\n").trim();
  if (!jobText) { console.log(color("dim", "  (nothing pasted)\n")); return; }

  console.log(color("dim", "\n  analysing fit…"));
  const r = await coachOnJob(jobText);

  console.log("\n" + color(scoreColor(r.fitScore), color("bold", `  Fit: ${r.fitScore}/10`)) + color("dim", `  — ${r.verdict}`));
  if (r.emphasize?.length) {
    console.log(color("green", "\n  Lead with:"));
    r.emphasize.forEach((s) => console.log("    • " + s));
  }
  if (r.gaps?.length) {
    console.log(color("yellow", "\n  Gaps to handle:"));
    r.gaps.forEach((s) => console.log("    • " + s));
  }
  if (r.prepQuestions?.length) {
    console.log(color("mag", "\n  They'll likely ask:"));
    r.prepQuestions.forEach((s) => console.log("    • " + s));
  }
  if (r.pitch) console.log(color("cyan", "\n  Tailored pitch:\n  ") + r.pitch);
  console.log("");
}

function showProgress() {
  const s = summary();
  console.log(color("cyan", "\n=== PROGRESS ==="));
  console.log(`  Attempted: ${color("bold", `${s.totalAttempted}/${s.totalQuestions}`)} questions`);
  console.log(`  Avg score: ${color(scoreColor(s.avgScore), s.avgScore.toFixed(1) + "/10")}`);
  if (s.weakest.length) {
    console.log(color("yellow", "  Weakest areas (drilled next):"));
    s.weakest.forEach((w) => console.log(`    • ${w.category} — ${w.avg.toFixed(1)}/10`));
  } else {
    console.log(color("dim", "  No attempts yet. Start a mock interview!"));
  }
  console.log("");
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(color("red", "ANTHROPIC_API_KEY not set. Add it to .env (see .env.example)."));
    process.exit(1);
  }

  const rl = readline.createInterface({ input, output, terminal: false });
  const lr = new LineReader(rl);
  console.log(color("bold", "\n🎯 Mentor — your interview & job coach") + color("dim", "  (Senior Full-Stack AI Engineer)"));

  while (true) {
    console.log(color("dim", "\n────────────────────────────"));
    console.log("  " + color("bold", "1") + " Mock interview");
    console.log("  " + color("bold", "2") + " Job / client coach");
    console.log("  " + color("bold", "3") + " Progress");
    console.log("  " + color("bold", "q") + " Quit");
    const raw = await lr.ask(color("cyan", "\nchoose › "));
    if (raw === null) break;
    const choice = raw.trim().toLowerCase();

    if (choice === "1") await mockInterview(lr);
    else if (choice === "2") await jobCoach(lr);
    else if (choice === "3") showProgress();
    else if (choice === "q" || choice === "quit" || choice === "exit") break;
    else console.log(color("dim", "  pick 1, 2, 3, or q"));
  }

  rl.close();
  console.log(color("green", "\nKeep grinding. See you tomorrow. 💪\n"));
}

main().catch((e) => {
  console.error(color("red", "\nError: "), e);
  process.exit(1);
});
