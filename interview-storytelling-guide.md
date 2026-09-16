# Interview Storytelling Guide

Purpose: a reusable way to decide which project to walk through in an interview and how
to tell it, so this doesn't get re-derived from scratch every time. Update this file
when a new project ships or a new pattern gets confirmed to work well in a real
interview - don't let it go stale.

---

## The general framework: five beats, not a chronology

A "walk me through a project" round is not "tell me everything that happened in order."
The interviewer is trying to answer one question: **can this person make good decisions
under real constraints, and can they explain those decisions clearly?** Structure the
walkthrough around five beats, spending most of the time on beats 3 and 4:

1. **The real constraint** (30 seconds). Not "what the product does" - what made this
   hard. "This was a chiropractic billing system where one wrong CPT code costs the
   practice a rejected insurance claim, and I was designing the data model the rest of
   the system would depend on." One sentence. Skip company backstory unless asked.
2. **The shape of the system** (1-2 minutes). The pieces and how they connect. Draw it
   if a whiteboard/screen-share is available - a five-box diagram beats a paragraph.
3. **The decision that mattered** (3-5 minutes, the core of the answer). Pick ONE
   decision, not a list. State the options that were on the table, why the obvious
   choice was wrong or risky, what was chosen, and why. This is the part that separates
   "I used NestJS and Prisma" from "I can be trusted with your production system."
4. **What broke, or what you'd change** (1-2 minutes). Every real project has a scar.
   Naming it unprompted is a trust signal - it says the story hasn't been sanded down
   into a highlight reel. "The audit trail model was an afterthought in month one, and
   retrofitting it into every controller after the fact was more work than designing it
   in from the start" is a better answer than pretending nothing went wrong.
5. **The outcome, stated plainly** (30 seconds). Real, checkable numbers if they exist
   (76 Playwright tests, two client instances on one codebase, live user counts). No
   inflation - "it's in production and hasn't needed a schema migration since" is a
   fine outcome for a backend-modeling story; it doesn't need to sound like a unicorn
   exit.

**Rule of thumb:** if you're still talking at minute 8 and haven't hit beat 3 yet, stop
and skip to it. Interviewers remember the decision, not the timeline.

## Picking which project - match the story to the JD, not to what's most impressive

Don't lead with the most impressive project. Lead with the one whose **hard decision**
is the same shape as the hard decision in the job description. A blockchain project is
a worse Round 1 pick for a backend-CRUD SaaS role than a boring-sounding billing system,
because the interviewer is pattern-matching for "will this decision-making transfer to
our codebase," not "has this person done cool things."

Quick matching heuristic:
- JD talks about **data modeling, schemas, migrations, multi-tenancy** -> lead with
  Chiro360 (billing data model) or the multi-tenant RAG platform (tenant isolation).
- JD talks about **auth, RBAC, access control, sensitive data** -> lead with LightNX
  (server-side role enforcement) or Chiro360 (permission guards + audit trail).
- JD talks about **agents, LLM workflows, tool calling** -> lead with the AI SDR Agent
  (LangGraph) or the RAG platform.
- JD talks about **payments, webhooks, financial correctness** -> lead with the cruise
  booking platform's Stripe work (idempotent retries, replayable failed payouts).
- JD talks about **0-to-1, ambiguity, ownership** -> lead with whichever project had the
  least spec going in - check which one that actually was before claiming it.
- JD is blockchain/Web3-specific -> lead with Penthian, Rock Paper Scissors, or Crypto
  on Discount instead of any of the above.

Keep one backup project ready for "tell me about a different one" - don't walk in with
only one story rehearsed.

---

## Nemonx (2026-09-16) - Round 1 plan

JD emphasis: TypeScript + Prisma + PostgreSQL, multi-tenant data modeling, owning auth/
access-control/tenant-isolation/audit-trails end to end, small async team, "built
something 0->1."

**Lead with: Chiro360's billing data model.** It matches almost every JD line item
directly - Prisma + PostgreSQL schema design, multi-tenant-adjacent isolation between
practices, audit trail, and you designed the model rather than inheriting it, which
answers the 0->1/ownership angle without needing a separate story.

Five-beat draft:
1. **Constraint:** one wrong CPT/visit-billing entry means a rejected insurance claim
   for the practice - the data model had to make that hard to get wrong, not just
   possible to get right.
2. **Shape:** NestJS API, Prisma/PostgreSQL, ~31 screens - patients, appointments,
   CPT/ICD coding, insurance claims, attorney letters of protection, all resolving to a
   single visit-based billing ledger.
3. **The decision:** [Umair to fill in the actual schema tradeoff he made for the
   billing ledger - e.g. why visit-based rather than claim-based as the core entity, or
   how the ledger stays consistent when a claim gets amended after the fact. This is the
   one part of this file that needs Umair's real memory of the decision, not something
   to write from outside.]
2. **What broke / scar:** the audit trail model went in as a retrofit, not designed in
   from day one - naming this directly is stronger than pretending it was planned.
3. **Outcome:** live production system, 76 Playwright E2E tests over the billing
   workflow, real client using it.

**Backup if asked for a second project:** the multi-tenant RAG platform (NestJS,
pgvector, Supabase) - tenant isolation enforced at the data layer is the closest second
match to Nemonx's "multi-tenant data models" line.

**Before the call:** fill in beat 3 above with the actual schema/design decision from
memory - a real "the tradeoff I made and why" beats a generic description of what the
system does, and it's the one thing in this plan that can't be written from outside
Umair's own memory of building it.

---

## Open item

Umair told this session, in his own words, that Chiro360 and DME are his current work
during the Decrypted Labs period, and that NestJS/Prisma/PostgreSQL there are closer to
a year/three years/1-1.5 years of real use respectively, not "familiar, not primary."
`job-automation-routine.md`'s profile has been corrected to match. One thing still
unconfirmed: whether Chiro360/DME are formally Decrypted Labs work, freelance, or a
separate arrangement - worth nailing down once, since it decides how they're labeled on
every resume going forward, not just this one.
