// mentor/graph.ts
// The mock-interviewer as a LangGraph state machine.
//
// This deliberately mirrors your AI SDR agent (lib/langgraph/sdr-agent.ts) so
// you can see the same building blocks — Annotation.Root state, nodes, edges,
// compile() — but it adds ONE new concept your SDR app didn't use:
//   human-in-the-loop via interrupt().
//
// Graph shape (one question per invoke):
//   START → selectQuestion → askAndCollect --interrupt--> grade → END
//
// interrupt() pauses the graph and hands control back to the CLI. The CLI reads
// your typed answer, then resumes the graph with new Command({ resume: answer }).
// A MemorySaver checkpointer is what makes pause/resume possible.

import { StateGraph, Annotation, START, END, interrupt, MemorySaver } from "@langchain/langgraph";
import { Question } from "./questions.js";
import { pickNext } from "./store.js";
import { profileSummary } from "./profile.js";
import { complete, parseJson } from "./llm.js";

export interface Grade {
  score: number; // 0–10
  verdict: string; // one-line summary
  strengths: string[];
  gaps: string[]; // what a senior answer would have added
  followUp: string; // a sharper follow-up question to push you
}

// ── State: the data that flows through the graph ──
// replace<T> = "last write wins" reducer, same helper style as your SDR agent.
function replace<T>(_old: T, incoming: T): T {
  return incoming;
}

const InterviewState = Annotation.Root({
  exclude: Annotation<string[]>({ default: () => [], reducer: replace }),
  question: Annotation<Question | null>({ default: () => null, reducer: replace }),
  answer: Annotation<string>({ default: () => "", reducer: replace }),
  grade: Annotation<Grade | null>({ default: () => null, reducer: replace }),
});

export type InterviewStateT = typeof InterviewState.State;

// ── Node 1: pick the next question (prioritises your weak areas via the store) ──
function selectQuestion(state: InterviewStateT): Partial<InterviewStateT> {
  const q = pickNext(new Set(state.exclude));
  return { question: q };
}

// ── Node 2: present the question and WAIT for the human answer ──
// interrupt() throws control back to the caller; execution resumes here with
// whatever value the CLI passes to Command({ resume }).
function askAndCollect(state: InterviewStateT): Partial<InterviewStateT> {
  const answer = interrupt({
    type: "question",
    question: state.question,
  }) as string;
  return { answer };
}

// ── Node 3: grade the answer like a strict senior interviewer ──
async function grade(state: InterviewStateT): Promise<Partial<InterviewStateT>> {
  const q = state.question!;
  const system = [
    "You are a strict but fair senior engineering interviewer at a top product company.",
    "You are interviewing this candidate for a Senior Full-Stack AI Engineer role.",
    "",
    "Candidate background (use it to calibrate — hold them to a senior bar):",
    profileSummary(),
    "",
    "Grade the answer to the question. Be honest and specific. A 10 is a crisp,",
    "correct, senior-level answer with trade-offs and a concrete example. A 5 is",
    "partially correct but shallow or missing key points. Below 5 has real gaps.",
    "Do NOT be generous. Reward precision, penalise hand-waving.",
    "",
    "Respond with ONLY valid JSON, no markdown fences, in this exact shape:",
    '{"score": <0-10 integer>, "verdict": "<one line>", "strengths": ["..."], "gaps": ["what a senior answer adds"], "followUp": "<one sharper follow-up question>"}',
  ].join("\n");

  const user = [
    `CATEGORY: ${q.category}`,
    `QUESTION: ${q.q}`,
    "",
    "CANDIDATE ANSWER:",
    state.answer?.trim() || "(no answer given)",
  ].join("\n");

  const text = await complete(system, user, { maxTokens: 1024, temperature: 0.3 });

  const parsed = parseJson<Grade>(text, {
    score: 0,
    verdict: "Could not parse grade — treat as retry.",
    strengths: [],
    gaps: [text.slice(0, 300)],
    followUp: "Try answering again more concretely.",
  });
  return { grade: parsed };
}

export function buildInterviewer() {
  const graph = new StateGraph(InterviewState)
    .addNode("selectQuestion", selectQuestion)
    .addNode("askAndCollect", askAndCollect)
    .addNode("gradeAnswer", grade)
    .addEdge(START, "selectQuestion")
    .addEdge("selectQuestion", "askAndCollect")
    .addEdge("askAndCollect", "gradeAnswer")
    .addEdge("gradeAnswer", END);

  // MemorySaver = in-memory checkpointer. Required for interrupt()/resume to work.
  // (Your SDR agent had no checkpointer because it never paused for a human.)
  return graph.compile({ checkpointer: new MemorySaver() });
}
