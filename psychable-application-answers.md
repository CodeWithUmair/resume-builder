# Psychable — Senior Full Stack Developer

Application answers. Drafted 2026-09-03.

> **Status:** Q1, Q4, Q7 are ready. Q2, Q3, Q5, Q6 need your real details before they
> can be written. Q8 is a script outline for the video.
>
> They said: *"We read applications for how you think."* Every answer below is written
> to show reasoning, not to list credentials.

---

## Q1. The inherited branch

*You inherit a branch that is thousands of lines ahead of production, written mostly
with AI assistance. The full test suite passes. Nobody has verified any of it in a
browser. A data migration must run before the deploy, and the hosting platform deploys
automatically the moment the merge completes. How do you get this to production safely?
What do you do first, what do you need to know before touching anything, and what could
go wrong?*

**First, before reading a single line of the diff: break the link between merge and
deploy.** Right now the review has no safety net. One click ships thousands of
unverified lines and fires an irreversible migration at the same time. So I disable
auto-deploy on that branch, or point the merge at staging instead of production. Nothing
else I do matters until that is done, because until then a teammate merging something
unrelated can ship this by accident.

**What I need to know before touching anything:**

1. **Is the migration reversible?** Is there a down migration, or does it drop, rename,
   or overwrite fields? This is the question that decides everything else.
2. **Can the migration run separately from the deploy, and is it idempotent?** If it
   half-fails, can I run it again safely, and do I know which documents it already
   converted?
3. **Does old code work with new data, and does new code work with old data?** During
   any deploy both exist at once, even if only for a minute.
4. **What is the rollback story specifically?** Rolling back code is easy. If the
   migration already ran and is one-way, rolling back the code leaves production broken
   against a schema it does not understand. That is the trap in this scenario.
5. **Is there a fresh production backup, and has a restore actually been tested?** An
   untested backup is a guess.
6. **What actually changed?** I want a real map of the diff, not a line count. Which
   parts touch authentication, authorization, payments, or data access.
7. **Do the tests assert behavior, or do they assert that the code does what it does?**
   This matters more than usual here. Tests written alongside AI-generated code tend to
   encode the same misunderstanding as the implementation, so they pass while the
   feature is wrong.

**How I would get it to production:**

1. Kill auto-deploy on merge, as above.
2. Restore a production snapshot into staging. Run the migration there and **time it**.
   I want to know how long it takes on real data volume and whether it locks anything.
3. Deploy the branch to staging against that migrated data and **actually use it in a
   browser**. Sign up, log in, book, pay, and check what a logged-out user can reach.
   A passing suite is not evidence that anybody has seen the feature work.
4. Review the diff **in order of risk, not top to bottom**: authorization first, then
   anything touching money, then queries and indexes, then UI.
5. **Test the tests.** Pick the three most important ones, deliberately break the code
   they cover, and confirm they fail. If they still pass, the suite is decoration.
6. **Split the deploy.** Migration as its own verified step, then the code. Never one
   atomic merge that does both.
7. If the schema change is large, prefer **expand and contract**: migrate to a shape both
   old and new code can read, deploy the code, then remove the old shape in a later
   change. It costs one extra deploy and it buys a working rollback.
8. Ship in a low-traffic window, with someone watching error rates and the rollback
   command already written out, not improvised.

**What could go wrong:**

- The migration runs fine on staging and takes far longer on production data, locking a
  collection while people are mid-booking.
- The migration is one-way, so the moment it runs, rollback stops being an option. This
  is the worst case and the reason I front-load that question.
- Tests pass because they were written from the same wrong assumption as the code.
- A new query path has no supporting index. Fast on staging's small dataset, collection
  scan in production.
- Authorization regressions, because almost nobody writes a test for "a logged-out user
  must not be able to reach this."
- Partial migration failure leaving documents in two different shapes with no record of
  which is which.
- Someone merges an unrelated PR and auto-deploy ships this branch mid-review.

**In plain language, for a non-technical teammate:** the tests only prove the code does
what its author expected. Nobody has checked that what they expected is what we actually
want. And the database change cannot be undone, so if we are wrong, we cannot simply put
it back.

---

## Q2. A code review where you stopped something shipping

*Tell us about a time you reviewed someone else's code and stopped it from shipping.
What did you find, and how did you handle the conversation?*

**NEEDS YOUR INPUT.** You said you have done this. I need the specifics:

- What was the project and roughly when?
- What did you find? (You mentioned authorization gaps and non-indexed queries. Which
  one, concretely? e.g. "an endpoint that took a userId from the request body and
  trusted it" or "a `$regex` search with no anchor on a collection of N documents")
- How did you raise it? Comment on the PR, message, call?
- How did the other developer react, and how did it end?

This is their number one requirement and they will ask about it again in the call, so it
has to be true and it has to have detail. Tell me roughly what happened and I will write
it.

---

## Q3. A security issue you found and fixed

*Describe a security issue you found and fixed in a real project. What was it, how did
you find it, and what did you change?*

**NEEDS YOUR INPUT.** Same as above. What I need:

- What was the vulnerability? (exposed endpoint, missing auth check, secret in the repo,
  session that never expired, IDOR where changing an ID in the URL showed someone else's
  data, etc.)
- How did you notice it? Reviewing code, testing, a report, an incident?
- What did you change, and did you check whether it had already been exploited?

The last part is worth including if true. Checking the logs after a fix is the kind of
detail that separates a real story from a rehearsed one.

---

## Q4. AI tools: how you use them, where you do not trust them

*How do you use AI tools in your work, and where do you not trust them?*

I use them every working day and they make me meaningfully faster. Mostly for scaffolding
that I already know the shape of, first drafts of tests, working through an unfamiliar
API, and as a fast reviewer on my own code before a human sees it. I also build with
these APIs directly rather than only consuming them, which is a large part of why I am
skeptical of them: I have written the retrieval layer that stops an agent from inventing
detail, so I know exactly how confidently a model will state something it has no basis
for.

Where I do not trust them:

- **Anything touching authorization or money.** These tools produce code that looks
  correct and reads fluently. That is precisely the failure mode: plausible is not the
  same as correct, and in an auth check the difference is invisible on the page.
- **Tests they wrote for code they also wrote.** The test tends to encode the same
  assumption as the implementation, so it passes and proves nothing. I break the code on
  purpose to see whether the test notices.
- **Database queries and indexes.** A model will produce a query that returns the right
  rows and will not tell you it cannot use an index. I read the execution plan.
- **Claims about what the code does.** I verify behavior in the browser and in the
  database, not in the summary the model gives me of its own work.
- **Anything I could not explain line by line if someone asked.** If I cannot defend it
  in review, I do not ship it. That rule has never cost me much time and has caught real
  problems.

The short version: I am faster with them and I assume they are wrong until I have seen
the behavior myself.

> **Check this against your own habits before sending.** It should sound like you. If
> there is a specific time an AI tool gave you something wrong and you caught it, say so
> here, that is the strongest possible version of this answer.

---

## Q5. Inheriting an architecture you would not have chosen

*You inherit a codebase with an architecture you would not have chosen, but it is
consistent and enforced throughout. What do you do?*

**PARTLY NEEDS YOUR INPUT.** The stance below is defensible on its own, but it is much
stronger with one real example. Have you ever joined a project and had to work inside a
pattern you disagreed with? Even a small one.

Draft stance:

I work inside it, and I find out why it is that way before I form an opinion worth
acting on. Consistency has real value that a better pattern applied to sixty percent of a
codebase does not. Every exception makes the next person slower, because now they have to
know which half of the code they are in.

Their posting says architecture violations are currently at zero and enforced by tooling.
That number only stays at zero because people respect it, including new people, and
especially new people who think they know better. If I genuinely believed something was
wrong, I would write up the case, the cost of changing it, and what it would break, and
let the team decide. Not decide unilaterally inside a pull request.

The only thing I would push back on immediately is a pattern that is actively unsafe, for
example authorization checked in one layer that some paths can bypass. That is not taste,
that is a defect.

---

## Q6. Years of production Next.js

**NEEDS YOUR CONFIRMATION.** From your CV, Next.js in production runs from Decrypted Labs
(June 2024) to now, which is **2 years 3 months**. Ecommerce Inside (2022 to 2024) was
React, not Next.js, on your CV.

If your freelance Next.js work (Penthian, Crypto on Discount, Degen Forest) was
production and predates June 2024, the honest number is closer to **3 years**.

Pick the one that is true and say it plainly. Do not round up. They have a paid trial and
will find out.

---

## Q7. Part-time, 10 to 20 hours per week

Yes. I am in Karachi, UTC+5, nine hours ahead of US Eastern. Working my evenings gives a
consistent block of overlap with your mornings, roughly 9am to 2pm Eastern, every working
day. I am set up to contract directly, no agency and no subcontracting.

---

## Q8. Video introduction (script outline)

Keep it to **2 to 3 minutes**. Talk to the camera, no slides. They will be listening for
whether you sound like the person who wrote the answers.

**Open (15s).** Name, where you are, what you do in one sentence. No CV recital, they
have the CV.

**1) Why Psychable (30-40s).** The honest version, not flattery. Something like: it is a
marketplace where the trust matters more than usual, because of who the users are and
what they are looking for. And the posting is unusually specific about how the team works
(7,500 tests, decision records, zero architecture violations, review as the core of the
role). Say that this is the first posting in a while that described a codebase you would
want to work in rather than one you would have to rescue.

**2) Why you are right for the role (45-60s).** Two things only:
   - You have built and still run the exact system they are about to build: booking,
     Stripe payments, payouts, the edge cases around money.
     One concrete sentence about webhook retries or replayable payouts.
   - You review other people's code and have stopped things from shipping. Give the
     one-line version of your Q2 story.

**3) Coolest thing built with AI (40-50s).** The SDR agent. Say what it does, then say
the interesting part: it is a LangGraph state machine with human checkpoints, and you put
retrieval in front of it specifically so it answers from real account data instead of
inventing plausible detail. That last point ties straight back to their "healthy
skepticism" requirement, so land it deliberately.

**Close (10s).** You have read the codebase description, you are ready for the paid
trial, and you would rather be judged on that than on a call.

**Practical:** film in landscape, quiet room, decent light on your face, phone camera is
fine. Upload unlisted to YouTube or Google Drive and check the link works logged out
before you send it.

---

## Before you submit

- [ ] Q2, Q3, Q5, Q6 filled in with real detail
- [ ] Q4 adjusted so it sounds like you
- [ ] Video recorded, link tested while logged out
- [ ] Resume PDF exported from `Umair-Resume-Psychable.docx`
- [ ] Every question answered. They said applications missing answers are not reviewed.
