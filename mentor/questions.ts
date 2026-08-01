// mentor/questions.ts
// The 65-question bank, mirrored from interview-prep.html.
// Each question carries a category and difficulty so the interviewer can
// prioritise your weak areas. Keep IDs stable — the progress store keys off them.

export type Difficulty = "high" | "med";

export interface Question {
  id: string;
  category: string;
  difficulty: Difficulty;
  q: string;
}

export const CATEGORIES = [
  "JavaScript & TypeScript",
  "Node.js",
  "NestJS",
  "REST & GraphQL",
  "PostgreSQL",
  "MongoDB",
  "Redis & Caching",
  "Docker & CI/CD",
  "Auth & Security",
  "System Design",
  "AI & LLM",
  "React & Next.js",
  "DSA",
] as const;

export const QUESTIONS: Question[] = [
  // JavaScript & TypeScript
  { id: "c0", category: "JavaScript & TypeScript", difficulty: "high", q: "Explain the JavaScript event loop — call stack, microtask queue, macrotask queue." },
  { id: "c1", category: "JavaScript & TypeScript", difficulty: "high", q: "Promise.all vs Promise.allSettled vs Promise.race vs Promise.any — with real use cases." },
  { id: "c2", category: "JavaScript & TypeScript", difficulty: "high", q: "interface vs type in TypeScript — real differences, not just 'use interface for objects'." },
  { id: "c3", category: "JavaScript & TypeScript", difficulty: "high", q: "TypeScript utility types — Partial, Omit, Pick, Record, ReturnType, Parameters, Awaited." },
  { id: "c4", category: "JavaScript & TypeScript", difficulty: "high", q: "Closures — what they are and the 3 patterns you actually use." },
  { id: "c5", category: "JavaScript & TypeScript", difficulty: "high", q: "Async/await internals — how it compiles, error handling patterns, parallel vs sequential." },
  { id: "c6", category: "JavaScript & TypeScript", difficulty: "high", q: "TypeScript generics — constrained generics, keyof, conditional types, infer." },
  { id: "c7", category: "JavaScript & TypeScript", difficulty: "med", q: "this binding — the 4 rules and arrow functions." },

  // Node.js
  { id: "c8", category: "Node.js", difficulty: "high", q: "Node.js event loop phases — what runs in what order?" },
  { id: "c9", category: "Node.js", difficulty: "high", q: "Memory leaks in Node.js — causes, detection, fixes." },
  { id: "c10", category: "Node.js", difficulty: "high", q: "Worker Threads vs Cluster — when to use each." },
  { id: "c11", category: "Node.js", difficulty: "high", q: "Streams — when you need them and how pipes work." },
  { id: "c12", category: "Node.js", difficulty: "med", q: "process.nextTick vs setImmediate vs setTimeout(fn, 0)." },

  // NestJS
  { id: "c13", category: "NestJS", difficulty: "high", q: "Guards vs Interceptors vs Pipes vs Middleware — execution order and what each does." },
  { id: "c14", category: "NestJS", difficulty: "high", q: "Dependency Injection in NestJS — how the IoC container actually works." },
  { id: "c15", category: "NestJS", difficulty: "high", q: "BullMQ in NestJS — producer, consumer, retries, events." },
  { id: "c16", category: "NestJS", difficulty: "high", q: "Global exception filters — standardize error responses across the whole app." },
  { id: "c17", category: "NestJS", difficulty: "high", q: "NestJS lifecycle hooks — onModuleInit, onApplicationBootstrap, shutdown." },
  { id: "c18", category: "NestJS", difficulty: "high", q: "NestJS microservices — transports, patterns, hybrid apps." },

  // REST & GraphQL
  { id: "c19", category: "REST & GraphQL", difficulty: "high", q: "HTTP methods, idempotency, and status codes every senior engineer knows." },
  { id: "c20", category: "REST & GraphQL", difficulty: "high", q: "N+1 problem in GraphQL and DataLoader — how batching works." },
  { id: "c21", category: "REST & GraphQL", difficulty: "high", q: "REST API design best practices — versioning, pagination, filtering." },
  { id: "c22", category: "REST & GraphQL", difficulty: "high", q: "REST vs GraphQL — when to choose each, real trade-offs." },
  { id: "c23", category: "REST & GraphQL", difficulty: "high", q: "WebSockets vs SSE vs Long Polling — when to use each." },

  // PostgreSQL
  { id: "c24", category: "PostgreSQL", difficulty: "high", q: "Index types — B-tree, GIN, GiST, BRIN — and compound index left-prefix rule." },
  { id: "c25", category: "PostgreSQL", difficulty: "high", q: "EXPLAIN ANALYZE — how to read it and fix slow queries." },
  { id: "c26", category: "PostgreSQL", difficulty: "high", q: "ACID, transactions, and isolation levels — what they mean in practice." },
  { id: "c27", category: "PostgreSQL", difficulty: "high", q: "Row Level Security (RLS) for multi-tenant SaaS." },
  { id: "c28", category: "PostgreSQL", difficulty: "med", q: "CTEs, window functions, and advanced queries." },

  // MongoDB
  { id: "c29", category: "MongoDB", difficulty: "high", q: "Aggregation pipeline — all key stages with a real example." },
  { id: "c30", category: "MongoDB", difficulty: "high", q: "Embed vs Reference — schema design decision framework." },
  { id: "c31", category: "MongoDB", difficulty: "high", q: "MongoDB indexes — compound, TTL, text, sparse, partial." },
  { id: "c32", category: "MongoDB", difficulty: "med", q: "Change streams — real-time events from MongoDB." },

  // Redis & Caching
  { id: "c33", category: "Redis & Caching", difficulty: "high", q: "Redis data structures — which to use when." },
  { id: "c34", category: "Redis & Caching", difficulty: "high", q: "Rate limiting with Redis — fixed window and sliding window." },
  { id: "c35", category: "Redis & Caching", difficulty: "high", q: "Cache patterns — cache-aside, write-through, invalidation, stampede prevention." },
  { id: "c36", category: "Redis & Caching", difficulty: "med", q: "Redis Pub/Sub — real-time notifications across multiple servers." },

  // Docker & CI/CD
  { id: "c37", category: "Docker & CI/CD", difficulty: "high", q: "Production Dockerfile — multi-stage build, layer caching, security." },
  { id: "c38", category: "Docker & CI/CD", difficulty: "high", q: "Docker Compose for local dev environment." },
  { id: "c39", category: "Docker & CI/CD", difficulty: "high", q: "GitHub Actions — CI/CD pipeline with test, build, deploy." },
  { id: "c40", category: "Docker & CI/CD", difficulty: "med", q: "Nginx reverse proxy — config with SSL, SSE, and load balancing." },

  // Auth & Security
  { id: "c41", category: "Auth & Security", difficulty: "high", q: "JWT access + refresh token rotation — production pattern." },
  { id: "c42", category: "Auth & Security", difficulty: "high", q: "OAuth2 Authorization Code Flow — step by step." },
  { id: "c43", category: "Auth & Security", difficulty: "high", q: "OWASP Top 10 for Node.js/NestJS — what to know and fix." },
  { id: "c44", category: "Auth & Security", difficulty: "med", q: "RBAC in NestJS — roles, custom decorator, guard." },

  // System Design
  { id: "c45", category: "System Design", difficulty: "high", q: "Design a URL Shortener — schema, flow, scale." },
  { id: "c46", category: "System Design", difficulty: "high", q: "Design a Real-Time Notification System." },
  { id: "c47", category: "System Design", difficulty: "high", q: "Design a Multi-Tenant SaaS Backend." },
  { id: "c48", category: "System Design", difficulty: "high", q: "Design a Rate Limiter — algorithms and trade-offs." },
  { id: "c49", category: "System Design", difficulty: "med", q: "Horizontal vs Vertical scaling — when to choose each." },

  // AI & LLM
  { id: "c50", category: "AI & LLM", difficulty: "high", q: "LangGraph — state machines, nodes, conditional routing, persistence." },
  { id: "c51", category: "AI & LLM", difficulty: "high", q: "RAG architecture — ingestion pipeline, chunking, retrieval, generation." },
  { id: "c52", category: "AI & LLM", difficulty: "high", q: "MCP (Model Context Protocol) — what it is and how to build a server." },
  { id: "c53", category: "AI & LLM", difficulty: "high", q: "LLM Streaming — SSE from NestJS to React with real-time display." },

  // React & Next.js
  { id: "c54", category: "React & Next.js", difficulty: "high", q: "useMemo vs useCallback — when to use and when NOT to." },
  { id: "c55", category: "React & Next.js", difficulty: "high", q: "SSR vs SSG vs ISR vs CSR — Next.js App Router patterns." },
  { id: "c56", category: "React & Next.js", difficulty: "high", q: "React Server Components — zero JS bundle, direct DB access, composition pattern." },
  { id: "c57", category: "React & Next.js", difficulty: "high", q: "RTK Query — caching, invalidation, optimistic updates." },
  { id: "c58", category: "React & Next.js", difficulty: "med", q: "React performance — rendering, memo, virtualization, lazy loading." },

  // DSA
  { id: "c59", category: "DSA", difficulty: "high", q: "Hash Map pattern — Two Sum, Group Anagrams, frequency counting." },
  { id: "c60", category: "DSA", difficulty: "high", q: "Sliding Window — longest/shortest subarray with constraint." },
  { id: "c61", category: "DSA", difficulty: "high", q: "BFS and DFS — trees and graphs with real patterns." },
  { id: "c62", category: "DSA", difficulty: "high", q: "Binary Search — classic and 'search on condition' pattern." },
  { id: "c63", category: "DSA", difficulty: "high", q: "Dynamic Programming — Coin Change and the DP thought process." },
  { id: "c64", category: "DSA", difficulty: "med", q: "Stack — Valid Parentheses, Monotonic Stack, Next Greater Element." },
];

export function byId(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function byCategory(category: string): Question[] {
  return QUESTIONS.filter((q) => q.category === category);
}
