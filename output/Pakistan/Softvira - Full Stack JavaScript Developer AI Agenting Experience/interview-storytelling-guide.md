# Interview Guide: Softvira, Full Stack JavaScript Developer (AI Agenting)

Round: not announced. The JD only says "send your CV to careers@softvira.com". Expect an
on-site technical interview in Karachi with a lead or CTO, likely a project walkthrough
plus agent questions, possibly a live coding task.
Formula: CHOICE (Context, Hard part, Options, I did, Consequence, Evolve).
Updated: 2026-09-17. Rebuilt from the real code of each project.

---

## 1. Read this 5 minutes before the call

- **Lead story:** AI SDR Agent. LangGraph pipeline, Claude, real integrations (Apollo,
  Tavily, Gmail, LinkedIn), human approval, cron-driven sequences.
- **Backup story:** PinFlow. AI-generated content, a background scheduler, a third-party
  API with strict rules.
- **LangGraph depth if they push:** the interview mentor agent, which uses `interrupt()`
  and a checkpointer.

Three lines to remember:
1. "The model writes, the human approves, the system sends. I kept that on purpose."
2. "Today the graph is linear. Here is exactly what I would add to make it reliable."
3. "Most agent bugs are not the model being wrong. They are duplicate side effects and
   lost state."

Do NOT say:
- "No human in the loop." False. A human approves every email, by design.
- "Handles real campaigns for clients" or any user numbers. CONFIRM real usage first.
- "Multi-agent system." It is one graph with three nodes. Say that.

---

## 2. What this interviewer is scoring

Their JD says it plainly: "a builder who can code custom agents, not someone who only
uses ready-made AI tools". So they will test whether you understand what is under the
framework.

| JD signal | What they will probe | Your answer |
|---|---|---|
| Custom agents in TypeScript | Show the graph. What is state? | SDR `StateGraph`, typed `Annotation` state |
| Tool calling, structured outputs | How do you get reliable JSON? | Honest: JSON parse with fallback, and the upgrade |
| Memory, context management | What happens between runs? | Dedup from past campaigns, `SearchCache`, checkpointer in mentor |
| Integrate with APIs and databases | Real side effects, failures | Gmail send, LinkedIn cron, status column |
| Reliable in production | What breaks? How do you debug? | Duplicate-send risk, silent email failure bug |
| Full stack | Frontend plus backend | Next.js 16, SSE progress stream, Prisma, Paddle |

What makes me write "hire": he can draw his own graph, explains one real failure mode,
and says what he would change without being pushed. What makes me doubt: buzzwords
(autonomous, multi-agent) that the code does not support.

---

## 3. Opening: "Tell me about yourself" (about 60 seconds)

> I am a full-stack JavaScript engineer with about four years of experience. TypeScript,
> Next.js, Node, NestJS, PostgreSQL.
> My day job is production SaaS for US healthcare clients: billing systems, auth, deploys.
> Alongside that I build AI products in code. The main one is an AI sales agent on
> LangGraph and Claude. It finds prospects, researches them, writes personalized emails,
> and runs LinkedIn follow-ups. I also built a Pinterest automation SaaS where Claude
> writes the pin content and a background worker publishes it.
> Your posting asks for someone who codes agents and connects them to real APIs and
> databases. That is exactly the part I enjoy most.

---

## 4. Lead story: AI SDR Agent (app.umairamir.com)

### The story (CHOICE, about 2 minutes)

> **C:** It is a sales outreach SaaS. A user describes their ideal customer, and the
> agent finds leads, researches each one, and writes a personal cold email. Next.js,
> Prisma on PostgreSQL, Claude for writing, Apollo for contacts, Tavily for research.
>
> **H:** The hard part is not writing one good email. It is that the agent touches the
> real world. It sends emails and LinkedIn messages from the user's own accounts. A bug
> there is not a wrong answer on screen. It is the same message sent twice to a real
> person, or a person contacted again in a second campaign.
>
> **O:** I could build one big prompt loop where the model decides what to do next, or a
> clear graph with fixed steps. For this job the steps are always the same, so I used a
> LangGraph state graph: find leads, research, write. Predictable and easy to debug.
>
> **I:** The state is typed: leads, enriched leads, drafts, progress. Each node streams
> progress to the UI over server-sent events, so the user sees "Researching lead 3 of 10".
> Before a run, I load every email and LinkedIn URL from the user's past campaigns, so the
> agent never picks the same person twice. The model only writes drafts. A human approves
> each one before it sends. LinkedIn follow-ups on day 1, 3 and 7 are rows in a table with
> a status. GitHub Actions calls a protected cron route every hour to send what is due.
>
> **C:** It is live at app.umairamir.com with login, plans and billing. Development uses a
> demo mode with mocked leads, so I do not burn paid API credits while testing.
>
> **E:** Honestly, the graph is still linear. There is no checkpointer, so if a run fails
> at lead 8 it starts again from zero. And the cron job marks a message "sent" after
> sending, so if two runs overlap, a message could go twice. That is the first thing I
> would fix.
>
> I can show you how I would fix both, or go into the email generation part.

### The drill ladder (spoken answers)

**Level 1: "Show me the graph."**
> Three nodes. `findLeads` calls Apollo with the user's filters and removes anyone seen
> before. `researchLeads` calls Tavily for each lead and adds the research to the state.
> `writeEmails` calls Claude for each enriched lead and builds a draft. Edges go start,
> find, research, write, end. Each node returns a partial state update.

**Level 1: "How do you get structured output from the model?"**
> Today I ask Claude for JSON with subject and body, parse it, and fall back to extracting
> the JSON block if there is extra text. It works, but it is not strict. The better way is
> tool use with a schema, a zod schema on my side, and one retry with the validation
> error if it fails.

**Level 2: "Why LangGraph and not a simple loop or a no-code tool?"**
> A no-code tool cannot do my dedup logic, my database, or my approval step. A plain loop
> would work today, but the graph gives me typed state, clear node boundaries, and a path
> to checkpoints, branching and human interrupts without rewriting. I use those features
> in another project, an interview mentor agent, where `interrupt()` pauses the graph for
> the user's answer and a checkpointer resumes it.

**Level 2: "Why a human approval step? Isn't the point automation?"**
> Cold email goes out from the user's own Gmail. One bad or wrong email hurts their
> domain and their reputation. Approval costs the user a minute and removes the worst
> risk. When quality is proven, you can loosen it per user. I would not start without it.

**Level 3: "What breaks in production?"**
> Two real ones. First, magic link login emails were not arriving, and the code reported
> success. The send function swallowed the mail library's rejection. I added proper error
> handling and logging, and then found the real causes: a paused database and a revoked
> Gmail app password. Lesson: an agent or a pipeline must never turn a failure into
> silence. Second, the duplicate send risk in the cron job, which I mentioned.

**Level 3: "How would you fix the duplicate send?"**
> Claim the row before sending. One atomic update: set status to processing where status
> is pending, and only send rows that update actually returned. In Postgres that is an
> `UPDATE ... RETURNING` or `SELECT ... FOR UPDATE SKIP LOCKED`. Then store the provider's
> message id when the send succeeds. If a row is stuck in processing, a sweeper checks
> the id before retrying instead of sending blindly.

**Level 4: "Make this agent production-grade. What changes?"**
> Four things. One: a Postgres checkpointer with a thread id per campaign, so a failed run
> resumes from the last node. Two: fan out research per lead with a concurrency limit,
> instead of a for loop, and retry each lead on its own. Three: a quality check node with
> a conditional edge: if the email breaks rules like too long or missing personalization,
> send it back to rewrite, at most twice. Four: move approval inside the graph with
> `interrupt()`, so approve and send are one resumable flow, with the send step idempotent.
> And I would log every model call with tokens, latency and the prompt version, so I can
> compare quality when I change a prompt.

### Interviewer's notes

Strong: the candidate is honest that the graph is simple and then designs the real
version in detail. That is more convincing than claiming a complex system. Risk: if you
describe it as "autonomous" or "multi-agent", I will ask about agent coordination and the
story collapses.

---

## 5. Backup story: PinFlow (AI content plus background worker)

> **C:** A Pinterest scheduling SaaS for creators and agencies. Claude writes the pin
> title, description and alt text. A worker publishes pins at scheduled times.
>
> **H:** Two constraints. Pinterest actively punishes spam patterns, so publishing too
> much at once can hurt the user's account. And a scheduler needs a long-running process.
>
> **O:** The frontend is on Vercel, so the easy option was a Vercel cron. But serverless
> functions have time limits, and the free cron runs once a day. So I ran a separate
> Express worker on a DigitalOcean server instead.
>
> **I:** `node-cron` every 20 minutes, 2 pins per run, oldest first, one at a time. Each
> pin moves from scheduled to publishing to published or failed, and every attempt is
> saved with its error. Expired Pinterest tokens refresh once before a publish is marked
> failed. AI output goes into separate `generated_` fields, so it never overwrites what
> the user typed.
>
> **C:** Backend and frontend are live. Pinterest first denied my API trial access. I
> think the reviewer saw a backend that was not deployed and copy that sounded like bulk
> auto-posting. I deployed it, rewrote the privacy policy, made it clear the user approves
> every pin, and resubmitted. CONFIRM current approval status.
>
> **E:** Claiming a pin is a read and then an update, not one atomic step. It is safe only
> because one instance runs. Before scaling I would make it a conditional update, or
> move to BullMQ with Redis. I kept the publish logic separate so only the caller changes.

**Level 2: "Why not BullMQ from day one?"**
> Volume is small and there is one server. Redis is one more thing to run and pay for.
> I wrote down the upgrade path and kept the code shaped for it. I would switch when I
> need retries with backoff, a dead-letter queue, or more than one worker.

---

## 6. Behavioral answers mapped to this JD

**"Tell me about a bug you debugged."** Use S2 in short form:
> Production login broke in two ways. An `http` API URL got a 301 to https, and the
> browser turned the POST into a GET. Then the cookie was set on the backend domain, so
> the frontend's server could not see it. The fix was a relative `/api` with Next
> rewrites. The second bug came from my own earlier config choice.

**"Turn an idea into a working prototype fast."**
> PinFlow went from a written plan to a deployed frontend and backend. I wrote the
> architecture decisions down first, like why the scheduler cannot run on Vercel, so I
> did not have to change direction later.

**"A time you were wrong."**
> I pointed a frontend straight at a backend domain. It looked right and it broke login in
> production, because of cookie scope. Now I check where cookies live before I choose an
> API URL pattern.

**"How do you use AI coding tools?"** (they will ask, it is an AI company)
> Every day. Claude Code writes a lot of code with me. I decide the design, I read every
> change, and type check, build and tests must pass. I also know where it fails: it once
> gave me a config that broke production login. Using AI tools is easy. Knowing when the
> output is wrong is the skill.

**"Why Softvira?"**
> Most job posts list AI as a keyword. Yours says you want people who code agents and
> connect them to real systems. That is the work I already do after hours. I want to do
> it full time, with a team.

---

## 7. Gaps: honest answers

**Tool calling / function calling in production.**
> In my SDR agent the model returns JSON, not tool calls. I understand the flow: define
> tools with a schema, the model returns a tool call, my code runs it and returns the
> result, loop until a final answer. CONFIRM: any project where you shipped real tool
> calling or MCP. If none, say "I have not shipped it in production yet" and explain the
> loop above.

**RAG and vector search.** CONFIRM the RAG platform details before claiming it: how
chunks are made, which embedding model, how tenants are isolated, how quality was checked.
If you cannot answer those, say "I have built RAG with pgvector, not at large scale."

**Multi-agent systems.**
> Not in production. My agents are single graphs. I would only split into multiple agents
> when the tasks need different tools or context, because every extra agent adds
> coordination failures.

**On-site 12pm to 9pm.** Decide your answer before the call.

---

## 8. Questions to ask them

1. "Are the agents you build for clients or for your own products?"
2. "Which framework do you use today, LangGraph, your own code, or something else?"
3. "How do you test an agent before it reaches a client? Do you keep eval sets?"
4. "What was the last agent that failed in production, and why?"
5. "What would success look like for me in the first three months?"

---

## 9. After the call: 2-minute self-score

- [ ] Could I explain my graph node by node without notes?
- [ ] Did I say what the system does NOT do before they found it?
- [ ] Each story under about 2 minutes?
- [ ] Named one real mistake?
- [ ] Anything I claimed that I should verify or build before round 2?
