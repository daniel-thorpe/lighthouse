# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small browser text adventure set in a lighthouse, built as a Next.js app (App Router, TypeScript, `src/` layout, no Tailwind) and deployed to Cloudflare Workers through the OpenNext adapter.

It began as a single-file prototype — `index.html`, `style.css` and a hand-compiled `game.ts` at the repository root. That prototype was replaced by the Next app and now exists only in git history; the design carried over unchanged, and `src/app/globals.css` is still the prototype stylesheet verbatim.

## Build and run

```bash
npm install     # once
npm run dev     # dev server on http://localhost:3000
npm run build   # production Next build
npm run preview # OpenNext build, then serve the Worker bundle locally
npm run deploy  # OpenNext build, then deploy to Cloudflare
```

Node is **not** installed system-wide on the machine this was developed on. It lives at `~/.local/opt/node`, symlinked into `~/.local/bin` (which is on `PATH`). If `node` is missing, install it there rather than assuming a system package manager — there is no Homebrew either.

Note that `next dev` rewrites the `<!-- BEGIN:nextjs-agent-rules -->` block at the bottom of this file on every run. Leave it; edits above it are preserved. Set `agentRules: false` in `next.config.ts` to stop it.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`: `npm ci`, then `opennextjs-cloudflare build`, then `npx wrangler deploy`. It deliberately uses the wrangler pinned in `package-lock.json` rather than a separately installed one, so the deploy always matches the build.

`wrangler.toml` points `main` at `.open-next/worker.js` and serves `.open-next/assets`, with `nodejs_compat` enabled. Both are build output and gitignored.

**The Worker name must stay `lighthouse`.** It is what gives the site its hostname, so renaming it changes the live URL. Live at https://lighthouse.drummer-dan-t.workers.dev.

The workflow needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets. `scripts/set-cloudflare-secrets.sh` prompts for both and pipes them into `gh secret set` over stdin, so the token never lands in argv or shell history. Never pass a token as a command-line argument, and never paste one into a chat transcript.

## Architecture

**[src/lib/rooms.ts](src/lib/rooms.ts)** holds the world as plain data, no React. Four rooms on a 2×2 grid (a comment above the literal draws the map). Each room carries `exits` (direction → `RoomId`), `blocked` (direction → the prose shown when you try to walk that way), and `short`, a one-word label for the map tile. Every direction not in `exits` should have an entry in `blocked`; the fallback "You cannot go that way." reads as a gap in the writing rather than a bug. `order` fixes the display order of exits (north, south, east, west), `layout` fixes the reading order of map tiles, and `start` is where the player begins.

**[src/components/Game.tsx](src/components/Game.tsx)** is the only client component (`"use client"`) and holds all the state: `current` room, `message`, `blocked`, and `beat`, a counter bumped on every keypress. A single `keydown` listener maps arrow keys to a `Direction`. Arrow keys are the only input; there is no text parser.

Two things the prototype did by touching the DOM are done with React instead, and both matter if you change the rendering:

- **Animations replay via `key`.** `#stage` is keyed on `current`, so arriving in a room remounts it and re-runs the settle-in animation. `#message` is keyed on `beat`, so the message animates even when the text is identical. Remove the keys and the animations fire only once.
- **Theming goes through `document.body.dataset.room`**, set in an effect. [src/app/layout.tsx](src/app/layout.tsx) also renders `<body data-room={start}>` so the first paint is already themed and there is no flash before hydration.

Adding a room means extending the `RoomId` union, adding the room literal (including `short`), adding it to `layout` so it gets a map tile, and adding the reciprocal exit from its neighbour — `strict` mode will flag a `RoomId` you declared but never defined, but nothing checks that exits are two-way.

## Styling

[src/app/globals.css](src/app/globals.css) is plain CSS, imported once in the layout. There are no CSS modules and no utility framework; the class names in `Game.tsx` match it directly.

It is themed through CSS custom properties: `--ink`, `--dim`, `--glow`, `--sea`, `--panel`, `--edge`, `--beam` (strength of the sweeping light) and `--warm` (warmth of the background wash). Defaults live on `:root`, but **each room overrides them** in a `body[data-room="..."]` block, so editing `:root` alone will not change what you see in a room — change the room blocks too. Prefer adjusting these variables over hardcoding new colours.

Animation is driven by adding a class and letting CSS run the keyframes. All motion is disabled under `prefers-reduced-motion`, and any new animation should stay inside that guard.

## Prose

Room descriptions and blocked-direction messages are written in a consistent voice: second person, present tense, concrete and slightly bleak, two sentences for descriptions and one for blocked directions. Blocked messages give a physical reason the way is shut rather than just refusing. Match that register when adding content.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
