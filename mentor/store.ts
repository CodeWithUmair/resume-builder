// mentor/store.ts
// Local progress persistence. Tracks every graded attempt so the interviewer
// can prioritise your weak areas next session. One JSON file, no database.
// Gitignored (lives under output/ conceptually, but we keep it at repo root as
// .mentor-progress.json — add it to .gitignore).

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { QUESTIONS, Question } from "./questions.js";

const STORE_PATH = join(process.cwd(), ".mentor-progress.json");

export interface Attempt {
  questionId: string;
  category: string;
  score: number; // 0–10
  at: string; // ISO timestamp
}

export interface Progress {
  attempts: Attempt[];
}

export function load(): Progress {
  if (!existsSync(STORE_PATH)) return { attempts: [] };
  try {
    return JSON.parse(readFileSync(STORE_PATH, "utf8")) as Progress;
  } catch {
    return { attempts: [] };
  }
}

export function save(p: Progress): void {
  writeFileSync(STORE_PATH, JSON.stringify(p, null, 2), "utf8");
}

export function record(questionId: string, category: string, score: number): void {
  const p = load();
  p.attempts.push({ questionId, category, score, at: new Date().toISOString() });
  save(p);
}

/** Latest score per question (undefined if never attempted). */
function latestScores(): Map<string, number> {
  const p = load();
  const map = new Map<string, number>();
  for (const a of p.attempts) map.set(a.questionId, a.score); // later attempts overwrite
  return map;
}

/**
 * Pick the next question to ask.
 * Priority: (1) never attempted, (2) lowest previous score, (3) HIGH difficulty first.
 * `exclude` lets the CLI avoid repeating within a single session.
 */
export function pickNext(exclude: Set<string> = new Set()): Question {
  const scores = latestScores();
  const pool = QUESTIONS.filter((q) => !exclude.has(q.id));
  const candidates = pool.length ? pool : QUESTIONS;

  const scoreOf = (q: Question) => {
    const s = scores.get(q.id);
    if (s === undefined) return -1; // unseen — highest priority
    return s;
  };

  return [...candidates].sort((a, b) => {
    const diff = scoreOf(a) - scoreOf(b);
    if (diff !== 0) return diff;
    // tie-break: HIGH difficulty before MED
    if (a.difficulty !== b.difficulty) return a.difficulty === "high" ? -1 : 1;
    return 0;
  })[0];
}

/** Human-readable summary for the CLI dashboard. */
export function summary(): {
  totalAttempted: number;
  totalQuestions: number;
  avgScore: number;
  weakest: { category: string; avg: number }[];
} {
  const p = load();
  const attempted = new Set(p.attempts.map((a) => a.questionId));

  const byCat = new Map<string, number[]>();
  for (const a of p.attempts) {
    if (!byCat.has(a.category)) byCat.set(a.category, []);
    byCat.get(a.category)!.push(a.score);
  }

  const weakest = [...byCat.entries()]
    .map(([category, scores]) => ({
      category,
      avg: scores.reduce((x, y) => x + y, 0) / scores.length,
    }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3);

  const allScores = p.attempts.map((a) => a.score);
  const avgScore = allScores.length
    ? allScores.reduce((x, y) => x + y, 0) / allScores.length
    : 0;

  return {
    totalAttempted: attempted.size,
    totalQuestions: QUESTIONS.length,
    avgScore,
    weakest,
  };
}
