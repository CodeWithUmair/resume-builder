// mentor/smoke.ts
// Non-interactive end-to-end check. Runs one full interview cycle with a canned
// answer so we can confirm the graph, interrupt/resume, and grading all work.
//   Run: npm run mentor:check

import "dotenv/config";
import { Command } from "@langchain/langgraph";
import { buildInterviewer } from "./graph.js";
import { pickNext, summary } from "./store.js";
import { QUESTIONS } from "./questions.js";

async function main() {
  console.log(`Questions loaded: ${QUESTIONS.length}`);
  console.log(`Next question would be: ${pickNext().id} — ${pickNext().q}`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("\n⚠ ANTHROPIC_API_KEY not set — skipping live grading test.");
    console.log("  (Graph build + question bank + store all OK.)");
    buildInterviewer(); // confirms the graph compiles
    console.log("✓ Graph compiles.");
    return;
  }

  const app = buildInterviewer();
  const thread = { configurable: { thread_id: `smoke-${Date.now()}` } };

  const paused = await app.invoke({ exclude: [] }, thread);
  if (!paused.question) throw new Error("No question selected");
  console.log(`\nInterviewer asked [${paused.question.category}]: ${paused.question.q}`);

  const cannedAnswer =
    "The event loop lets single-threaded JS handle async work. The call stack runs " +
    "sync code; when it's empty the loop drains the microtask queue fully (Promise " +
    "callbacks, queueMicrotask) before taking one macrotask (setTimeout, I/O). In Node, " +
    "process.nextTick runs before Promises. So Promise.then fires before setTimeout(0).";

  console.log(`\nCanned answer submitted. Grading…`);
  const done = await app.invoke(new Command({ resume: cannedAnswer }), thread);

  console.log("\n=== GRADE ===");
  console.log(JSON.stringify(done.grade, null, 2));

  const s = summary();
  console.log(`\nStore now: ${s.totalAttempted}/${s.totalQuestions} attempted, avg ${s.avgScore.toFixed(1)}.`);
  console.log("\n✓ Full cycle works.");
}

main().catch((e) => {
  console.error("Smoke test failed:", e);
  process.exit(1);
});
