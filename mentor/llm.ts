// mentor/llm.ts
// Thin wrapper over the raw Anthropic SDK — the same client your resume builder
// (lib/generate.js) and your SDR agent's lib/claude use. Using the raw SDK inside
// LangGraph nodes (rather than ChatAnthropic) keeps params clean and mirrors how
// your SDR agent calls the model from within its nodes.

import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.MENTOR_MODEL || "claude-sonnet-4-6";
const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

/** Send a system + user prompt, get plain text back. */
export async function complete(
  system: string,
  user: string,
  opts: { maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 1024,
    temperature: opts.temperature ?? 0.3,
    system,
    messages: [{ role: "user", content: user }],
  });
  const block = msg.content[0];
  return block.type === "text" ? block.text.trim() : "";
}

/** Parse a JSON object from model output, tolerating ```json fences. */
export function parseJson<T>(text: string, fallback: T): T {
  const stripped = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  // Grab the outermost {...} if there's surrounding prose.
  const match = stripped.match(/\{[\s\S]*\}/);
  try {
    return JSON.parse(match ? match[0] : stripped) as T;
  } catch {
    return fallback;
  }
}
