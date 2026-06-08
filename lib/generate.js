const Anthropic = require('@anthropic-ai/sdk');

// Umair's full profile — single source of truth for content generation
const PROFILE = {
  skills: {
    frontend:  'Next.js, React, TypeScript, Tailwind CSS, Zustand, React Query',
    backend:   'NestJS, Node.js, Express.js, REST APIs, WebSockets',
    ai:        'LangChain, LangGraph, Claude API, OpenAI API, RAG, pgvector, MCP, AI Agents, Prompt Engineering',
    database:  'PostgreSQL, Supabase, MongoDB, Prisma ORM, Redis',
    devops:    'DigitalOcean, PM2, Nginx, Vercel, Git, Docker',
  },
  experience: [
    {
      company: 'Decrypted Labs + Freelance',
      role:    'Full Stack AI Engineer',
      dates:   '2021–Present',
      bullets: [
        'Built and deployed production AI systems including an autonomous SDR agent (app.umairamir.com) handling full outbound sales pipeline using LangGraph, Claude API, and PostgreSQL',
        'Architected multi-tenant RAG platform with vector search, document ingestion pipeline, and real-time chat — live at scale with sub-500ms query response',
        'Delivered LightNX Defence Platform end-to-end: real-time asset tracking, role-based access control, and secure data pipelines under strict delivery windows',
        'Worked fully remote across UTC+0–UTC+8 clients; maintained async-first communication and shipped without hand-holding',
      ],
    },
    {
      company: 'Ecommerce Inside',
      role:    'MERN Stack Engineer',
      dates:   'July 2022 – June 2024',
      bullets: [
        'Owned frontend architecture for the main consumer app; built core product features in React and Node.js',
        'Integrated third-party shipping and payment APIs; standardized the adapter layer to cut future integration time by half',
      ],
    },
  ],
  projects: [
    {
      name:    'AI SDR Agent',
      tech:    'LangGraph, Claude API, NestJS, PostgreSQL, Next.js',
      bullets: [
        'Autonomous outbound sales agent: prospect discovery, email personalization, and follow-up sequencing with no human in the loop',
        'Live at app.umairamir.com; handles real campaigns for clients end-to-end',
      ],
    },
    {
      name:    'Chatbase-Clone RAG Platform',
      tech:    'Next.js, NestJS, pgvector, OpenAI, Supabase',
      bullets: [
        'Multi-tenant knowledge base platform: document ingestion, vector search, and context-aware chat supporting multiple document types',
        'Sub-500ms query response at production load across concurrent tenants',
      ],
    },
    {
      name:    'LightNX Defence Platform',
      tech:    'Next.js, NestJS, PostgreSQL, WebSockets, Mapbox',
      bullets: [
        'Real-time situational awareness dashboard: live asset tracking, alert management, and role-based access for defence client',
        'Delivered production-ready under strict deadline with zero critical post-launch bugs',
      ],
    },
  ],
  education: 'BS Computer Science | Virtual University of Pakistan',
};

async function generateResumeJson(jobTitle, company, keywords, marketType) {
  const client = new Anthropic();

  const prompt = `Generate a tailored resume JSON for Umair Amir applying to:

Job Title: ${jobTitle}
Company: ${company}
Market: ${marketType}
Keywords from job posting: ${keywords || 'not specified'}

Umair's full profile:
${JSON.stringify(PROFILE, null, 2)}

Rules:
1. Reorder skills within each category so the most relevant ones come first
2. Keep all 4 bullets for the main Decrypted Labs role; keep both bullets for Ecommerce Inside
3. Subtly adjust bullet wording to echo the job keywords — do not invent facts
4. Pick the 2 most relevant projects from the profile
5. Return ONLY valid JSON, no explanation, no markdown fences

Required JSON format:
{
  "skills": {
    "frontend": "...",
    "backend": "...",
    "ai": "...",
    "database": "...",
    "devops": "..."
  },
  "experience": [
    { "company": "...", "role": "...", "dates": "...", "bullets": ["..."] }
  ],
  "projects": [
    { "name": "...", "tech": "...", "bullets": ["...", "..."] }
  ]
}`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  const jsonMatch = text.match(/```json\s*([\s\S]+?)\s*```/) || text.match(/```\s*([\s\S]+?)\s*```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : text;
  return JSON.parse(jsonStr);
}

module.exports = { generateResumeJson, PROFILE };
