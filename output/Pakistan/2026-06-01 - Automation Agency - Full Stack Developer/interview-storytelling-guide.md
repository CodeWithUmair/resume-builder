# Interview Guide: Automation Agency, Full Stack Developer

Round: unknown. Company name unknown ("Hiring Team, Unknown Company" in the cover letter).
The original job description was not saved. This guide is built from what the June cover
letter shows the role wanted: "intelligent automation ecosystems", multi-step agent flows,
API and webhook integrations, Node.js backends connecting AI to external platforms, and
GoHighLevel.
Formula: CHOICE (Context, Hard part, Options, I did, Consequence, Evolve).
Updated: 2026-09-17.

---

## 0. Before anything else: fix the application in this folder

This folder was made by the old June pipeline, before your profile was corrected. If they
call you, the interviewer will have this resume open. Several lines would not survive a
single follow-up question:

| Claim in resume / cover letter | Problem | Say instead |
|---|---|---|
| Decrypted Labs "2021 to Present" | Real start is Jun 2024 | Jun 2024 to present |
| SDR agent "no human in the loop" | False. A human approves every email | "Human approves before send, by design" |
| SDR agent "handles real campaigns for clients" | Not verified | CONFIRM usage, or drop it |
| SDR agent built with "LangGraph and OpenAI" | The code uses Claude | LangGraph and Claude |
| "Social media automation platform serving 3K+ users, Instagram and TikTok" | Not verified. 3,000+ users belongs to the IAMDIVINITY dashboard | CONFIRM, or use PinFlow instead |
| RAG platform "sub-500ms at production load" | No source for the number | Drop the number unless measured |
| LightNX "real-time asset tracking" | Code shows an RFQ and quotation portal | CONFIRM before using |

If this job is still open (posted around June, so it may not be), regenerate the resume
and cover letter first. A guide cannot save a resume that the interviewer can disprove.

---

## 1. Read this 5 minutes before the call

- **Lead story:** PinFlow. Automation SaaS: AI-generated content, a background scheduler,
  OAuth tokens, a strict third-party API, a real rejection you recovered from.
- **Backup story:** AI SDR Agent. Multi-step LangGraph flow connected to Apollo, Tavily,
  Gmail and LinkedIn, with an hourly cron sequence.

Three lines to remember:
1. "Automation that touches a real account must be paced, logged, and safe to retry."
2. "A failed job is never silent. Every attempt is saved with its error."
3. "I have not used GoHighLevel, but I have built the same triggers, actions and
   schedules in code."

Do NOT say:
- Anything from the table in section 0 that you have not confirmed.
- "GHL is a two-week learning curve" as a promise. Say how you would learn it instead.

---

## 2. What this interviewer is scoring

An automation agency sells reliability to clients. A broken workflow means a client's
leads get no reply or get three replies. So they score:

| Signal | What they will probe | Your answer |
|---|---|---|
| Integrations with external platforms | OAuth, tokens, rate limits | PinFlow token refresh, encrypted tokens, pacing |
| Scheduled and triggered workflows | Cron vs queue vs webhook | PinFlow worker decision, SDR hourly cron |
| AI inside workflows | How do you control output? | `generated_` fields, human approval |
| Reliability | Retries, duplicates, failures | Status flow, attempts table, duplicate-send fix |
| Client delivery | Communication, deadlines | DME server migration, DNS incident |
| GoHighLevel / no-code tools | Can you work in their tools? | Honest gap, plus how you would ramp |

---

## 3. Opening: "Tell me about yourself" (about 60 seconds)

> I am a full-stack engineer with about four years of experience in TypeScript and Node.
> My day job is production SaaS for US healthcare clients, so I am used to real data,
> real deploys, and clients who depend on the system.
> On the automation side, I built a Pinterest scheduling SaaS where Claude writes the
> content and a background worker publishes it on a schedule. And an AI sales agent on
> LangGraph that finds leads, researches them, writes emails, and runs LinkedIn
> follow-ups from a cron job.
> What I like about agency automation work is that it connects many systems, and it only
> has value if it keeps running without someone watching it.

---

## 4. Lead story: PinFlow

### The story (CHOICE, about 2 minutes)

> **C:** PinFlow is a Pinterest scheduling tool for creators and agencies. The user adds
> pins, Claude writes an SEO title, description and alt text, and the system publishes
> each pin at its scheduled time to the user's Pinterest account.
>
> **H:** Two hard parts. Pinterest punishes spam patterns, so publishing a day's pins at
> once can damage the user's account. And a scheduler needs a process that is always
> running, but my frontend was on Vercel.
>
> **O:** The easy option was Vercel cron. But serverless functions have time limits, and
> the free cron runs only once a day. So I put the scheduler in a separate Express worker
> on a DigitalOcean server.
>
> **I:** `node-cron` runs every 20 minutes and publishes at most two due pins, oldest first,
> one after another. Each pin moves from scheduled, to publishing, to published or failed.
> Every attempt is saved in a `PublishAttempt` table with its error. If the Pinterest token
> is expired, it refreshes and retries once before marking the pin failed. Tokens are
> encrypted in the database. And AI output goes into separate `generated_` fields, so the
> user's own text is never overwritten.
>
> **C:** Frontend on Vercel, backend live on the server under PM2. Then Pinterest denied my
> API trial access. I think the reviewer saw a backend that was not deployed yet, and text
> that sounded like bulk auto-posting. I deployed the backend, rewrote the privacy policy,
> made it clear the user approves each pin, and resubmitted. CONFIRM current status.
>
> **E:** One weakness I know: taking a pin for publishing is a read and then an update, not
> one atomic step. It is safe only because a single instance runs. Before scaling I would
> make it a conditional update, or move to BullMQ with Redis.
>
> I can go deeper on the scheduler, the token handling, or the Pinterest review.

### The drill ladder (spoken answers)

**Level 1: "Walk me through one publish."**
> The cron tick finds pins with status scheduled and a time in the past, two at most. For
> each pin: set status to publishing, build the payload from the generated fields or the
> user's fields, call Pinterest with a valid token. On success, in one transaction, save
> published, the Pinterest pin id, and a successful attempt. On error, in one transaction,
> save failed, the reason, and a failed attempt.

**Level 2: "Why cron and not a queue?"**
> Small volume, one server. Redis is one more service to run. I kept the publish logic in
> its own function, so moving to a BullMQ job only changes who calls it. I would move when
> I need backoff retries, a dead-letter queue, or more than one worker.

**Level 2: "Why pace at two pins per run?"**
> Pinterest's API limit allows much more, but their spam rules care about patterns, not
> just limits. For the user's account, slow and steady is safer than fast.

**Level 3: "What if the publish succeeds but your database write fails?"**
> Then the pin stays in publishing. It will not be posted twice, because the worker only
> picks scheduled pins. But it is stuck. I would add a sweeper that finds pins stuck in
> publishing for too long and checks with Pinterest before retrying.

**Level 3: "What if you run two server instances?"**
> Today two instances could pick the same pin. That is why PM2 runs a single instance.
> The fix is an atomic claim: update where id matches and status is still scheduled, and
> only continue if one row changed.

**Level 4: "A client wants this for 50 accounts and Instagram too."**
> The data model is already multi-tenant: a pin belongs to a Pinterest account, which
> belongs to a user, because agencies manage many client accounts. For more platforms I
> would add a publisher interface per platform, a real queue with per-account rate limits,
> and a dashboard of failed jobs per client, so the agency sees problems before the client
> does.

---

## 5. Backup story: AI SDR Agent (short)

> **C:** A sales outreach SaaS. It finds leads with Apollo, researches them with Tavily,
> and Claude writes a personal email for each one.
>
> **H:** It sends from the user's real Gmail and LinkedIn. A mistake is a real person
> getting a duplicate or a bad message.
>
> **O / I:** A LangGraph flow with three fixed steps, typed state, and live progress in the
> UI. Leads from past campaigns are skipped. A human approves every email. LinkedIn
> follow-ups on day 1, 3 and 7 are rows with a status, sent by an hourly cron route that
> needs a secret token, with a random delay between sends.
>
> **C / E:** Live at app.umairamir.com. The honest weak point: the cron marks a message
> sent after sending, so overlapping runs could send twice. The fix is claiming rows
> atomically before sending and saving the provider's message id.

**Level 3: "Tell me about a silent failure."**
> Login emails were not arriving and the code said success, because the send function
> swallowed the error. I added logging and found a paused database and a revoked app
> password. Automation must never hide a failure.

---

## 6. Behavioral answers mapped to this role

**Client communication under pressure (use DME, S4).**
> I moved two clients' apps to a new server. The client was asked to update a DNS record
> and added a second record instead of editing the old one. Some users reached the old
> server, some the new one, a partial outage. I found it, explained exactly which row to
> edit, and checked three public DNS resolvers. Now I give that exact instruction every
> time, before the cutover.

**Picking up someone else's work.**
> On a cruise booking platform, a senior colleague built about half and then left. I had
> one handover session, read the codebase, finished it, and shipped it, including the
> referral and promo code engine and scheduled payouts.

**A mistake and what changed.**
> During a server migration I lost uncommitted work three times with `git reset --hard`.
> Now I commit before any reset, every time.

**"How do you use AI tools?"**
> Claude Code every day. I make the design decisions, read every change, and run type
> checks and tests. It is fast, but I am responsible for what ships.

---

## 7. Gaps: honest answers

**GoHighLevel.**
> I have not used GoHighLevel. I have built the same building blocks in code: scheduled
> jobs, status-driven workflows, OAuth connections, and AI steps. To ramp up, I would
> build one real client workflow end to end in a sandbox account in my first week,
> including its webhooks, and compare it with how I would do it in code.

**Webhooks at scale.** CONFIRM real webhook work (for example Stripe on the cruise
platform) before claiming details. The general answer:
> Verify the signature, save the event id with a unique constraint so duplicates are
> ignored, respond fast, and process the work in the background.

**Instagram / TikTok APIs.** Only claim if confirmed. Otherwise: "Not yet. Pinterest is
the platform API I have gone through app review with."

---

## 8. Questions to ask them

1. "Which platforms do most of your client automations run on: GoHighLevel, n8n, custom
   code, or a mix?"
2. "When an automation breaks for a client, how do you find out today?"
3. "How much of the work is building new flows versus maintaining existing ones?"
4. "Where does AI sit in your client work now: content, lead qualification, or agents?"

---

## 9. After the call: 2-minute self-score

- [ ] Did I avoid every unconfirmed claim from section 0?
- [ ] Each story under about 2 minutes?
- [ ] Named a real failure and what changed?
- [ ] Explained retries and duplicates clearly?
- [ ] Anything I should verify before a second round?
