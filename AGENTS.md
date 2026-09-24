# AGENTS.md

Working rules for AI agents in this repository. These are the user's standing
instructions; follow them unless the user says otherwise in the moment.

## Write a failing test first

Before changing behaviour, write a test that fails for the reason you are about
to fix. Watch it fail, then make it pass. This applies to behaviour changes, not
to formatting, comments or documentation.

> **Note:** this repository currently has no test runner and no `test` script.
> Until one is added, this rule cannot be satisfied. Adding a test framework
> means adding a library, so ask first (see below).

## Run every check before claiming a change is done

"Done" means all three of these have been run and pass:

```bash
npm test          # once a test runner exists
npm run lint      # eslint
npx tsc --noEmit  # type check
```

Run them, and report the actual output. Note that `next dev` uses Turbopack and
does **not** type-check, so a broken type will not show up in the dev server —
only `tsc` and `next build` catch it.

## A failing check blocks the push

If any check fails, do not push. Fix it, or report the failure and stop. Never
push in the hope that CI will pass, and never describe a change as working when
a check says otherwise.

## Commit after each small change

Prefer several small, self-contained commits over one large one. Each commit
should leave the checks passing and be understandable on its own.

## Ask before adding a library

Do not add a dependency without asking first, including dev dependencies and
test frameworks. Say what it is for and what the alternative is, then wait.

## Run the app locally before pushing, and wait

Before pushing, start the app and let the user look at it:

```bash
npm run dev   # http://localhost:3000
```

Wait for the user to confirm it looks right. Do not push on the assumption that
it is fine. Pushing to `main` deploys to production automatically, so an unseen
change goes live.
