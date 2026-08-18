# AI Usage Log

## Tools Used

- **Gemini** (Google) — primary pair-programming tool for this build. Used to scaffold the Express/MongoDB backend, the pricing calculation engine, the public and admin REST APIs, the React/Vite frontend, the dynamic `QuestionField` renderer, the multi-step estimator wizard, and the owner panel (login, config editor, leads table).
- **Claude** (Anthropic) — used in parallel to draft an alternative high-level execution roadmap (commit sequencing, architectural framing like the "Three Layers of Truth" model) that was compared against Gemini's plan and merged into the final approach actually followed.

AI was used for first-draft generation of almost every file in this repository. Every generated file was run, tested against real requests (curl, browser network tab, manual form submissions), and iterated on when it broke or when it didn't match the assignment's constraints — not committed on faith.

## Where AI Got It Wrong (and What I Did)

**1. Destructive database seeding.**
The first version of `seed.js` called `Config.deleteMany()` and `Lead.deleteMany()` before inserting the seed data, on every run. I caught that this was dangerous — running the seed script against a populated database (accidentally, or in a shared environment) would silently destroy real leads and any pricing changes already made through the owner panel. I rejected that approach and required a non-destructive version instead. The corrected script now checks `countDocuments()` first and aborts with a clear log message if the database already has data, only seeding on a genuinely empty database.

**2. A silent frontend failure caused by an incomplete API contract.**
After wiring up the public estimator, the page rendered nothing — no error, just a blank form area. I traced it by inspecting the actual network response from `GET /api/config` and noticed the returned question objects had no `active` field, even though the `QuestionField` component's first line was `if (!question.active) return null`. Because `active` was `undefined`, every single question silently failed to render. The backend's `configController.js` was already filtering to active-only questions before sending the response, which made the frontend's own `active` check both redundant and — because the field was stripped from the payload — actively broken. The fix was to delete that check entirely and let the frontend trust the backend's filtering, which is also the more correct architectural boundary (the server owns "what's active," not the client).

**3. Hardcoded `localhost:5000` URLs baked into production code paths.**
Both `client/src/services/api.js` and the admin `Dashboard.jsx` component were generated with the API base URL hardcoded to `http://localhost:5000`. This would have passed every local test and then failed completely the moment the frontend was deployed to Vercel/Netlify — the live estimator would try to call a developer's own laptop. This was caught in a pre-deployment review pass, not by running the app locally, which is exactly the kind of bug that's invisible until it's too late. Fixed by routing both files through `import.meta.env.VITE_API_URL`.

**4. Frontend built ahead of a backend that didn't fully exist yet.**
At one point the `Login.jsx` and `Dashboard.jsx` components were fully wired to call `/api/auth/login`, `/api/admin/config`, and `/api/admin/leads` — but a review of the actual backend showed only `publicRoutes` was mounted in `index.js`; the auth middleware, admin controller, and admin routes hadn't been created yet. AI had generated frontend code assuming backend surface area that didn't exist. This was caught by explicitly re-checking the backend file tree against what the frontend was calling, rather than assuming the two sides were in sync just because both had been "built" in earlier turns.

**5. Missing `mongoose` import causing a `ReferenceError` on the health check.**
The `/health` endpoint referenced `mongoose.connection.readyState` to report database status, but `mongoose` was never imported at the top of `index.js`. This would have crashed the exact endpoint a reviewer is likely to hit first when checking whether the deployment is alive. Caught in the same pre-deployment review pass as the routing gap above, not by manual testing.

## What I Wrote or Reworked Myself

- **The non-destructive seeding requirement** — the safety check on `seed.js` was my explicit correction to an AI-generated approach I judged unsafe for a database holding real leads.
- **All environment and tooling debugging** — Windows/PowerShell `curl` and `npx` failures, the Tailwind v4 → `@tailwindcss/postcss` breaking change, and repeated JSX-tag corruption from the chat interface's text parser were all diagnosed from my own terminal/browser output and fed back for targeted fixes, rather than accepted as generated.
- **Every verification step** — the `GET /api/config` and `POST /api/estimate` curl tests, the empty-database repro, the blank-screen network-tab investigation, and the pre-deployment gap review (hardcoded URLs, missing admin routes, missing `mongoose` import, incomplete docs) were driven by manually running the app and reading the actual output, not by assuming generated code worked.
- **Architectural decisions recorded in `DECISIONS.md`** — including the choice of immutable `config_version` snapshots over in-place mutation, and how legacy leads with fields outside the current schema (`chimney_count`, `gutter_replace`) are stored via a flexible `Mixed` answers type — were decisions I made and directed AI to implement, not the other way around.

## How I Generally Worked With It

AI was used to produce fast first drafts of boilerplate and standard patterns (schemas, CRUD controllers, form components). Every draft was run against real data and real requests before being trusted, and several bugs — a destructive script, a silently broken render, hardcoded URLs, an incomplete backend surface, a missing import — were only caught because I checked actual behavior instead of assuming the generated code matched the assignment's constraints on the first pass.


