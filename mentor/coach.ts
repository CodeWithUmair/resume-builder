// mentor/coach.ts
// Job / client coach. You paste a job description (or client brief); the coach
// scores your fit against YOUR real profile, tells you what to emphasise, flags
// gaps to prepare for, and drafts a short tailored pitch.
//
// It reuses the same ChatAnthropic client and your PROFILE — so advice is
// grounded in your actual experience, never generic.

import { profileSummary, PROFILE } from "./profile.js";
import { complete, parseJson } from "./llm.js";

export interface CoachReport {
  fitScore: number; // 0–10
  verdict: string;
  emphasize: string[]; // parts of your background to lead with
  gaps: string[]; // likely concerns + how to handle them
  prepQuestions: string[]; // questions THIS role will probably ask
  pitch: string; // a short tailored outreach / cover note
}

export async function coachOnJob(jobText: string): Promise<CoachReport> {
  const system = [
    "You are a sharp career coach for a senior engineer. You are direct and practical,",
    "never flattering. You know this candidate's real background:",
    "",
    profileSummary(),
    "",
    `Projects: ${PROFILE.projects.map((p) => `${p.name} (${p.tech})`).join("; ")}`,
    "",
    "Given a job post or client brief, assess fit HONESTLY against this real",
    "background (do not invent skills the candidate lacks), then coach them.",
    "",
    "Respond with ONLY valid JSON, no markdown fences, in this exact shape:",
    '{"fitScore": <0-10>, "verdict": "<one line>", "emphasize": ["..."], "gaps": ["concern + how to handle"], "prepQuestions": ["likely interview questions for THIS role"], "pitch": "<3-4 sentence tailored outreach the candidate can send>"}',
  ].join("\n");

  const text = await complete(system, `JOB POST / CLIENT BRIEF:\n\n${jobText}`, {
    maxTokens: 1500,
    temperature: 0.4,
  });

  return parseJson<CoachReport>(text, {
    fitScore: 0,
    verdict: "Could not parse — raw model output below.",
    emphasize: [],
    gaps: [],
    prepQuestions: [],
    pitch: text.slice(0, 600),
  });
}
