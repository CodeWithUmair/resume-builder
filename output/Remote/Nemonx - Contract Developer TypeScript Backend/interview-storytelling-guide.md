# Interview Guide: Nemonx, Contract Developer (TypeScript Backend)

Round 1: 45 min project walkthrough with an engineer. Round 2: CEO conversation.
Formula: CHOICE (Context, Hard part, Options, I did, Consequence, Evolve).
Updated: 2026-09-17. Rebuilt from verified repo facts, no placeholders.

---

## 1. Read this 5 minutes before the call

- **Lead story:** Chiro360 billing model. Prisma + PostgreSQL schema design, a real
  migration, 76 E2E tests. Matches their day-to-day almost line for line.
- **Backup story:** DME, one codebase for two clients on separate databases. Answers
  "multi-tenant", "deploys", "production issues".
- **Ready if they ask about auth or data protection:** the production login bug (S2) and
  the forked config pointing at another client's live database (S3).

Three lines to remember:
1. "The unit of billing is the visit, not the order. That one choice shaped everything."
2. "I snapshot the charge at entry and compute the balance on read."
3. "Audit logging came too late. Today I would design it in on day one."

Do NOT say:
- "Multi-tenant platform with sub-500ms at production load" (RAG project, not verified).
- "I have SAML / OIDC experience." You have JWT, cookies, OAuth2, RBAC. Say exactly that.

---

## 2. What this interviewer is scoring

| JD signal | What they will probe | Your answer |
|---|---|---|
| Prisma + PostgreSQL schema, migrations | Why this model? How did you migrate? | Chiro360 Visit model, `migrate diff` removal migration |
| Multi-tenant data models, tenant isolation | Pooled vs separate DBs, how do you stop leaks? | DME silo tenancy + S3 story (other client's data) |
| Auth, access control, audit trails | Where is the check? Server or UI? | Guards per controller, role x module matrix, cookie bug |
| Tests, CI/CD, production issues | What do you test? What broke in prod? | 76 Playwright tests run twice, login bug, PM2/GitHub Actions |
| "Walk through a design and its tradeoffs" | Can you say the cost of your choice? | Snapshot duplication, computed balance cost |
| Small async team, contract | Do you need hand-holding? | Handoff docs, decisions written down, you run deploys yourself |

What makes me (the interviewer) write "strong yes": he says "I", names the option he did
not take, gives the cost of his choice without being asked, and admits one real mistake.
What makes me doubt: vague "robust scalable architecture", numbers with no source, every
story ends perfectly.

---

## 3. Opening: "Tell me about yourself" (about 60 seconds)

> I am a full-stack engineer with about four years of experience, mostly TypeScript.
> For the last two years my main work has been backend-heavy SaaS for US healthcare
> clients. NestJS, Prisma, PostgreSQL, deployed on AWS.
> The biggest one is a billing CRM for a chiropractic clinic. I designed the billing
> data model that the whole app depends on. I also run the deploys and migrations for a
> second product, one codebase serving two clients on separate databases.
> On the side I build AI products, like an outbound sales agent on LangGraph.
> Your role is very close to what I do every day: Prisma schemas, auth, tenant
> isolation, and shipping features end to end. That is why I applied.

CONFIRM before the call: whether to name Decrypted Labs as the employer for this work.

---

## 4. Lead story: Chiro360 billing model

### How to use the 45 minutes

- 2 min: intro (above).
- 3 min: system map (below). Say it, do not draw it perfectly.
- 2 min: the CHOICE story.
- 20 to 25 min: they drill. Use the ladder below.
- Last 10 min: your questions (section 8). Do not give these up.

System map, five boxes:

> Next.js 16 frontend on Vercel. The browser only calls a relative `/api`, and Next
> rewrites forward it to the backend. NestJS API on EC2 behind nginx, run by PM2.
> Prisma on PostgreSQL. S3 for documents. Auth is a JWT in an httpOnly cookie, checked
> at the edge and again server-side, with permission guards on every controller.

### The story (CHOICE, about 2 minutes)

> **C:** The client is a chiropractic clinic that treats car accident patients. The app
> handles patients, visits, CPT and ICD coding, insurance claims, attorney letters, and
> the billing ledger. About thirty screens.
>
> **H:** The codebase started as a fork of an older product, a medical equipment billing
> app. Its billing record was attached to an equipment order: one code per order. But
> chiropractic billing does not work like that. One visit, one date of service, has
> several CPT codes. And every report joined through that old order model.
>
> **O:** I had two options. Keep the old model and adapt it. That was faster and already
> tested. Or remove the old domain and design around the real unit of work, the visit.
> Adapting would make every future billing feature fight the data model. So I chose to
> remove it.
>
> **I:** I designed four models. `Visit` is one date of service. `VisitCptLine` holds
> each code with its units and charge, and I snapshot the charge when it is entered, so
> if someone edits the CPT price list later, old bills do not change. `BillingBatch`
> groups visits, and it refuses any visit that is not "Ready to Bill". `VisitPayment`
> records payments, and adding one moves the visit to Paid or Partial Pay automatically.
> The balance is never stored. It is charge total minus paid total, computed on read, so
> it cannot drift from the payments.
>
> **C:** After that, the dashboard, reports, attorney balances and legal cases all read
> from this one model with no extra billing tables. Thirty of thirty-one screens are on
> the real database, with 76 Playwright end-to-end tests. I run the full suite twice in a
> row before I call something done, because the second run catches test data problems.
>
> **E:** What I would change: audit logging. Right now only logins are logged. For a
> billing system, status changes and payments should be audited from day one.
>
> I can go deeper on the schema, the migration, or the permission system.

### The drill ladder (spoken answers)

**Level 1: "Show me the relationships."**
> Patient has many Visits. A Visit has many VisitCptLines and many VisitPayments, and
> optionally belongs to a BillingBatch. Provider name and NPI are also snapshotted on
> the Visit, for the same reason as the charge: the bill must show what was true on
> that day.

**Level 1: "How did you remove the old domain safely?"**
> Eight Prisma models had to go, plus their modules and reports. The interactive
> `migrate dev` data-loss prompt does not work in a non-interactive shell, so I generated
> the SQL with `prisma migrate diff`, committed it as a normal migration file, and applied
> it with `migrate deploy`. Then type check, build, and the full test suite. The compiler
> caught one real crash: a service method still referenced a deleted variable.

**Level 2: "Why snapshot instead of a foreign key to the CPT table?"**
> A bill is a historical document. If the clinic changes the price of a code next month,
> last month's claims must not change. The cost is duplicated data. If a description was
> typed wrong, it has to be fixed on each line. For billing, I accept that cost.

**Level 2: "Why compute the balance instead of storing it?"**
> A stored balance can drift if any code path forgets to update it. At clinic scale, a
> sum over a visit's payments is cheap. So correctness first.

**Level 3: "What bugs did you hit?"**
> The best one was a data modeling bug. `is_active` meant two things: "retired" and
> "soft deleted". The list query filtered on it. So when a user marked an ICD code as
> Retired, it disappeared and could not be recovered. Then I nearly made the same mistake
> with email templates, mapping "Draft" to is_active false. I caught that one by reading
> the service before running it. My rule now: one boolean, one meaning.

**Level 3: "What if two people post a payment at the same time?"**
> Because balance is computed from the payment rows, two payments cannot overwrite each
> other's balance. The status update is the weak point: two concurrent writes could set
> the status from stale totals. The fix is to create the payment and recompute the status
> inside one transaction.

**Level 4: "What changes at 100 clinics?"**
> Two things. Tenancy: today it is one clinic per deployment. For 100 clinics I would move
> to a shared database with a `clinic_id` on every tenant table, enforced below the
> application, with PostgreSQL row-level security or a Prisma extension that always adds
> the filter, so one forgotten `where` cannot leak data. And reporting: computed balances
> across thousands of visits get expensive, so I would store the balance, update it in
> the same transaction as the payment, and run a nightly reconciliation job.

**Level 4: "How would you add audit trails properly?"**
> An `AuditLog` table with actor, action, entity, entity id, before and after JSON, and a
> timestamp. Written inside the same transaction as the change, so there is no change
> without a log. For billing, only inserts, no updates or deletes on that table.

### Interviewer's notes

Strong: a real "why" for snapshotting and computed balance, a migration mechanism, and a
bug that shows data-modeling judgment. Risk: if you say "we" for design decisions, I
cannot tell what you did. If you get asked about Jest unit tests, see section 7.

---

## 5. Backup story: DME, one codebase, two clients

> **C:** A billing CRM for medical equipment suppliers. One NestJS and Next.js codebase,
> deployed as two separate instances for two different clients, each with its own
> database. I run the deploys and the migrations.
>
> **H:** Isolation is strong because the databases are separate. But everything else is
> shared: code, server, deploy pipeline. So the risks are config drift and one client's
> details showing up in the other client's app.
>
> **O:** For a move to a new server I recommended separate machines for staging and
> production. The client wanted one shared machine to save cost. That is a fair business
> choice, so I wrote down the risk and built it properly.
>
> **I:** Two PM2 processes, nginx routing by host name. Staging got its own empty database,
> after I explained that sharing one would mean every test edits real production data. I
> did not copy production data at all. I pointed the new server at the existing database,
> so nothing moved. The old server I stopped, not deleted, so rollback was one command.
>
> **C:** Both clients moved to the new server with staging and production.
>
> **E:** The DNS cutover caused a partial outage. The client added a second record instead
> of editing the existing one, so some users reached the old server and some the new one.
> Now I tell them exactly which row to edit and I check three public DNS resolvers before
> the next step.

**Level 2: "Why separate databases and not a tenant_id?"**
> Two clients, medical data, and each client wanted their own domain and their own data.
> Separate databases make a cross-client leak very unlikely. The cost is that every
> migration runs twice and brand-specific text leaks into shared code. A grep for the
> other brand's name once found the wrong client's name in a dashboard greeting and a
> print letterhead.

**Level 3: "Tell me about a time data isolation almost failed."** (use S3)
> When the chiropractic app was forked from this product, I found its production database
> URL was the exact same live database as the other client's app. I confirmed it by
> comparing the database project reference in three places. If I had run the new
> migrations, they would have deleted the other client's tables. I set up a dedicated
> PostgreSQL for the new app. Later I also found local uploads were going into the other
> client's production S3 bucket. Uploads work either way, so nothing looked wrong. Since
> then, the first thing I do on any fork is audit every env var, bucket, and credential.

---

## 6. Behavioral answers mapped to this JD

**Production issue / debugging (auth).**
> Login worked locally and failed in production. First bug: the API URL was `http`. nginx
> redirects to https with a 301, and the browser re-sends a POST as a GET, so login hit a
> 404. Second bug: login succeeded but the user was never logged in. The frontend called
> the backend domain directly, so the cookie belonged to the backend domain, and the
> frontend's server checks could not see it. That second one was my own config choice.
> The fix was a relative `/api` with Next rewrites, so the cookie is first-party.

**Disagreement with a client.**
> The client wanted one database for staging and production, to keep it simple. I did
> not argue about "best practice". I explained one concrete result: any test on staging
> changes real patient billing data, with no undo. They chose separate. When they chose
> one shared server to save money, I wrote the risk down and built that version properly.

**Failure with a real cost.**
> During a server migration I lost uncommitted work three times with `git reset --hard`.
> Each time I had to redo it. Now I commit before any reset, no exceptions.

**Owning something ambiguous / 0 to 1.** Use the lead story's H and O beats.

**Working async with a small team.**
> I keep a handoff document in every repo: what is done, what is broken, and why each
> decision was made. Anyone can pick up the project without a call. For a contract role
> across time zones, I think that matters more than being online at the same hour.

**"How do you use AI tools?"** (expect this in 2026)
> I use Claude Code every day. It writes a lot of code with me. But I make the design
> calls, I read what it changes, and nothing is done until type check, build, and tests
> pass. It once suggested a config that broke production login. I found the root cause
> myself, and that is the kind of review I think the job needs.

---

## 7. Gaps: honest answers

**SAML / institutional SSO.**
> I have not shipped SAML. My auth work is JWT in httpOnly cookies, sessions, OAuth2, and
> role-based permissions. I know the OIDC flow and I would expect to learn your identity
> provider setup quickly, but I will not claim direct SAML experience.

**Jest unit and integration tests.**
> My strongest testing is end-to-end with Playwright, 76 tests on the billing app.
> CONFIRM: your Jest/unit test experience, then say it plainly. If it is thin, say:
> "For backend services I would add Jest tests around the billing rules first, like batch
> validation and payment status, because that is where a bug costs money."

**Queues, Redis, background jobs.**
> I have run cron-based workers: a paced Pinterest publisher on node-cron with a status
> flow and an attempts table, and an hourly LinkedIn sequence job. I have not run BullMQ
> in production. I know the weak spot of my cron version: claiming a job is not atomic,
> so it depends on one instance. With BullMQ I would get locking, retries and a
> dead-letter queue.

**Terraform / AWS.**
> AWS I use in production: EC2, S3, Textract. Terraform is recent and not deep yet.

**Payments.**
> Stripe webhooks on a cruise booking platform I inherited and finished.
> CONFIRM the idempotency mechanism before going deeper than one sentence.

---

## 8. Questions to ask them

1. "How do you isolate tenants today: one database with row-level security, a
   tenant_id convention in Prisma, or separate schemas?"
2. "Which external systems cause the most production issues right now, identity
   providers or campus systems?"
3. "What does a feature look like from ticket to production here? Who reviews, and how
   do migrations get deployed?"
4. "What would a strong first month look like for a contractor in this role?"
5. For the CEO round: "What is the one thing the product must get right in the next
   six months?"

---

## 9. After the call: 2-minute self-score

- [ ] Each story under about 2 minutes before they interrupted?
- [ ] Said "I" for my decisions?
- [ ] Named the option I did not take, and the cost of mine?
- [ ] Named a real mistake without being asked?
- [ ] Left 10 minutes for my questions?
- [ ] Anything I said that I should verify before Round 2? Write it down now.
