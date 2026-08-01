// mentor/profile.ts
// Umair's profile — the mentor's knowledge base about YOU.
// Kept in sync with the PROFILE object in lib/generate.js (resume generator).
// The mock interviewer and job coach both read this so feedback is personalized.

export const PROFILE = {
  name: "Umair Amir",
  location: "Karachi, Pakistan (remote-first)",
  target: "Senior Full-Stack AI Engineer",
  skills: {
    frontend: "Next.js, React, TypeScript, Tailwind CSS, Zustand, React Query",
    backend: "NestJS, Node.js, Express.js, REST APIs, WebSockets",
    ai: "LangChain, LangGraph, Claude API, OpenAI API, RAG, pgvector, MCP, AI Agents, Prompt Engineering",
    database: "PostgreSQL, Supabase, MongoDB, Prisma ORM, Redis",
    devops: "DigitalOcean, PM2, Nginx, Vercel, Git, Docker",
  },
  experience: [
    {
      company: "Decrypted Labs + Freelance",
      role: "Full Stack AI Engineer",
      dates: "2021–Present",
      highlights: [
        "Autonomous SDR agent (app.umairamir.com) — full outbound pipeline with LangGraph, Claude API, PostgreSQL",
        "Multi-tenant RAG platform — vector search, ingestion pipeline, real-time chat, sub-500ms queries",
        "LightNX Defence Platform — real-time asset tracking, RBAC, secure data pipelines",
      ],
    },
    {
      company: "Ecommerce Inside",
      role: "MERN Stack Engineer",
      dates: "Jul 2022 – Jun 2024",
      highlights: [
        "Owned frontend architecture for the main consumer app (React + Node.js)",
        "Integrated shipping/payment APIs; standardized an adapter layer",
      ],
    },
  ],
  projects: [
    { name: "AI SDR Agent", tech: "LangGraph, Claude API, NestJS, PostgreSQL, Next.js" },
    { name: "Chatbase-Clone RAG Platform", tech: "Next.js, NestJS, pgvector, OpenAI, Supabase" },
    { name: "LightNX Defence Platform", tech: "Next.js, NestJS, PostgreSQL, WebSockets, Mapbox" },
  ],
  education: "BS Computer Science | Virtual University of Pakistan",
};

export function profileSummary(): string {
  const p = PROFILE;
  return [
    `Candidate: ${p.name} — targeting ${p.target}, based in ${p.location}.`,
    `Frontend: ${p.skills.frontend}`,
    `Backend: ${p.skills.backend}`,
    `AI: ${p.skills.ai}`,
    `Database: ${p.skills.database}`,
    `DevOps: ${p.skills.devops}`,
    `Recent work: ${p.experience[0].highlights.join("; ")}`,
  ].join("\n");
}
