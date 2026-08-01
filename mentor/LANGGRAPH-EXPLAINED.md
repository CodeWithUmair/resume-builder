# LangGraph, Explained Through Your Own Code

You already built a LangGraph app — the **AI SDR agent** at `D:\mine\ai-sdr-agent`.
This doc explains how LangGraph works using *that* code, then shows how the **mentor**
in this repo reuses the exact same building blocks and adds one new idea:
**human-in-the-loop**.

Read this once, then open the two files side by side:

- `D:\mine\ai-sdr-agent\application\lib\langgraph\sdr-agent.ts` (your SDR agent)
- `d:\mine\resume-builder\mentor\graph.ts` (your new mentor)

---

## 1. The mental model (plain words)

LangGraph is a way to write a program as a **flowchart of steps** where a shared
**state object** flows from step to step.

- Each **node** is just an async function: `(state) => partialState`.
- **Edges** decide which node runs next.
- The **state** is a plain object; each node returns the fields it wants to change.
- You `compile()` the graph, then `invoke(initialState)` to run it.

That's it. Everything else is detail. It's a state machine where the transitions
are functions that can call an LLM.

**Why not just call functions in a `for` loop?** For a simple pipeline, you could.
LangGraph earns its place when you need: branching ("if the lead is qualified, email;
else discard"), loops, **pausing for human input**, streaming progress, retries, and
persistence (checkpointing) — without hand-rolling all that plumbing.

---

## 2. The four primitives

### (a) State — `Annotation.Root`

From **your SDR agent**:

```ts
const SDRStateAnnotation = Annotation.Root({
  config:   Annotation<AgentConfig>({ default: () => ({} as AgentConfig), reducer: replace }),
  leads:    Annotation<Lead[]>({ default: () => [], reducer: replace }),
  enriched: Annotation<EnrichedLead[]>({ default: () => [], reducer: replace }),
  drafts:   Annotation<EmailDraft[]>({ default: () => [], reducer: replace }),
  // ...
});
```

Each field ("channel") has:

- a **type** (`Annotation<Lead[]>`),
- a **default** (starting value), and
- a **reducer** — how a node's return value merges into existing state.

Your `replace` reducer means "last write wins":

```ts
function replace<T>(_existing: T, incoming: T): T {
  return incoming;
}
```

The other common reducer is **append** (used for chat history / message lists):

```ts
messages: Annotation<BaseMessage[]>({ reducer: (a, b) => a.concat(b) })
```

> The reducer is the one genuinely new concept vs normal functions. It's how
> LangGraph merges each node's partial output into the running state. Pick
> `replace` for "set this value", append for "add to a list".

### (b) Nodes — async functions

From **your SDR agent** — the research node:

```ts
async function researchLeadsNode(state: SDRState): Promise<Partial<SDRState>> {
  const enriched: EnrichedLead[] = [];
  for (let i = 0; i < state.leads.length; i++) {
    const research = await researchLead(state.leads[i]);   // ← call out to a tool/LLM
    enriched.push({ ...state.leads[i], research });
    sendEvent("lead_researched", { /* ... */ });           // ← stream progress
  }
  return { enriched };   // ← only the fields you changed
}
```

Key points:

- A node **reads** `state` and **returns a partial** state (`{ enriched }`).
- It can do anything: call an API, call the LLM, loop, log.
- `sendEvent(...)` is *your* function (SSE), not LangGraph's — that's how the SDR
  agent streams progress to the browser.

### (c) Edges — wiring the nodes

From **your SDR agent**:

```ts
const graph = new StateGraph(SDRStateAnnotation)
  .addNode("findLeads", findLeadsNode)
  .addNode("researchLeads", researchLeadsNode)
  .addNode("writeEmails", writeEmailsNode)
  .addEdge(START, "findLeads")
  .addEdge("findLeads", "researchLeads")
  .addEdge("researchLeads", "writeEmails")
  .addEdge("writeEmails", END);
```

This is a straight line: `START → findLeads → researchLeads → writeEmails → END`.
`START` and `END` are built-in markers.

**Conditional edges** (your SDR didn't use these, but you'll need them) let the graph
branch based on state:

```ts
.addConditionalEdges("qualify", (state) => {
  if (state.decision === "email") return "emailNode";
  if (state.decision === "task")  return "taskNode";
  return END;
})
```

### (d) compile + invoke

From **your SDR agent**:

```ts
return graph.compile();              // turns the definition into a runnable
// ...later...
const finalState = await agent.invoke({
  config, leads: [], enriched: [], drafts: [], /* ...initial state... */
});
return finalState.drafts;            // read the result off the final state
```

`compile()` validates the graph and returns something you can `.invoke()`.
`invoke(initialState)` runs it start to finish and returns the final state.

---

## 3. How the SDR graph is *driven* (the SSE route)

Your `app/api/agent/route.ts` wraps the whole run in a streaming HTTP response:

```ts
const stream = new ReadableStream({
  async start(controller) {
    function sendEvent(event, data) {
      controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
    }
    const drafts = await runSDRAgent(config, sendEvent, session?.user?.email);
    sendEvent("complete", { drafts });
    controller.close();
  },
});
return new Response(stream, { headers: { "Content-Type": "text/event-stream", /* ... */ } });
```

So the flow is: **browser → POST /api/agent → runSDRAgent → graph nodes call
`sendEvent` → SSE frames stream back to the browser** in real time. The graph itself
doesn't know about HTTP; the route injects `sendEvent` so nodes can report progress.
That separation (graph = logic, caller = transport) is the pattern to keep.

---

## 4. The new idea in the mentor: human-in-the-loop (`interrupt`)

Your SDR agent runs to completion with **no human in the loop** — it finds leads,
researches, writes emails, done. The mentor needs to **stop and wait for you to type
an answer**, then continue. That's what `interrupt()` is for.

From **your mentor** (`mentor/graph.ts`):

```ts
function askAndCollect(state) {
  const answer = interrupt({ type: "question", question: state.question });
  return { answer };
}
```

`interrupt()` **pauses the whole graph** and hands control back to whoever called
`invoke`. The graph's progress is saved by a **checkpointer**:

```ts
return graph.compile({ checkpointer: new MemorySaver() });
```

Then the CLI drives it in two steps (`mentor/cli.ts`):

```ts
const thread = { configurable: { thread_id: "q-123" } };

// 1) Run until the interrupt — the graph picks a question and pauses.
const paused = await app.invoke({ exclude: [...seen] }, thread);
console.log(paused.question);              // show the question

const answer = await lr.ask("your answer › ");

// 2) Resume the SAME thread, feeding the answer back into interrupt().
const done = await app.invoke(new Command({ resume: answer }), thread);
console.log(done.grade);                    // the LLM's grade
```

Two things make resume work:

1. **`thread_id`** — identifies which paused run to continue. Same id = same session.
2. **`MemorySaver`** — remembers the paused state between the two `invoke` calls.
   (Swap it for a Postgres/Redis checkpointer to survive restarts.)

`new Command({ resume: answer })` is the "here's the human's input, carry on" signal.
Execution picks up **right inside `interrupt()`**, which now returns `answer`.

---

## 5. Side by side

| Concept            | SDR agent (`sdr-agent.ts`)            | Mentor (`mentor/graph.ts`)              |
|--------------------|----------------------------------------|-----------------------------------------|
| State root         | `SDRStateAnnotation`                   | `InterviewState`                        |
| Reducer            | `replace` (last write wins)            | `replace` (same helper)                 |
| Nodes              | findLeads → researchLeads → writeEmails| selectQuestion → askAndCollect → grade  |
| Edges              | straight line                          | straight line                           |
| LLM call site      | inside nodes (`writeEmail`)            | inside `grade` node (`complete()`)      |
| Human in the loop  | none (fully autonomous)                | `interrupt()` + `MemorySaver`           |
| Driven by          | SSE route (`/api/agent`)               | CLI loop (`cli.ts`)                     |
| Output read from   | `finalState.drafts`                    | `done.grade`                            |

Same skeleton. The mentor just adds the pause/resume muscle.

---

## 6. Exercises (do these to actually learn it)

1. **Add a conditional edge.** In the mentor, after `grade`, branch: if `score < 5`,
   route to a new `explain` node that has the LLM teach the correct answer before
   ending. Use `.addConditionalEdges("gradeAnswer", ...)`.
2. **Add a loop.** Make the interviewer ask 5 questions in one graph run instead of
   one-per-invoke: after `grade`, loop back to `selectQuestion` until a counter in
   state hits 5, then `END`.
3. **Swap the checkpointer.** Replace `MemorySaver` with `PostgresSaver` so a session
   survives a restart. (This is exactly what you'd do to make the SDR agent resumable.)
4. **Port a node from the SDR agent.** Copy the `researchLeadsNode` streaming pattern
   (`sendEvent` per item) into a mentor "study plan" node that streams a day-by-day
   plan. This connects the two apps in your head.

---

## 7. One-paragraph summary to remember

> A LangGraph app is a **state object** (`Annotation.Root`) pushed through **nodes**
> (async `state => partialState` functions) along **edges** (fixed or conditional).
> You `compile()` then `invoke()`. Nodes call your LLM/tools and return only the fields
> they change; **reducers** merge those changes. Add a **checkpointer** + `interrupt()`
> when you need to pause for a human and `resume` later. Your SDR agent is the
> autonomous version; the mentor is the same thing with a human in the loop.
