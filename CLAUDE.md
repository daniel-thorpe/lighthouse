# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small browser text adventure set in a lighthouse. No package.json, no dependencies, no test suite, no bundler — a handful of files at the repository root, opened directly in a browser or served as static assets.

## Build and run

`game.ts` compiles to `game.js`, and **the compiled `game.js` is committed** (it is not gitignored; `index.html` loads it via a plain `<script src>`). After editing `game.ts`, always recompile and commit both files, or the page will silently run stale code.

TypeScript is not installed locally. Where Node is available, compile with:

```bash
npx -p typescript tsc
```

Note that some machines this repo is worked on have **no Node, npm or npx at all**. In that case the build has to be done with a Node fetched into a temporary directory first; check before assuming `npx` exists. CI does not have this problem — the workflow installs Node 22.

`tsconfig.json` has `"files": ["game.ts"]`, `"module": "none"` and `"outDir": "."`, so that command emits `game.js` next to the source. There is no watch script; re-run it after each change.

To run the game, open `index.html` in a browser — there is no dev server, and `module: none` means no ES module loading, so `file://` works fine.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which compiles `game.ts`, copies `index.html`, `style.css` and `game.js` into `dist/`, and deploys that directory to Cloudflare Workers with `cloudflare/wrangler-action`. `wrangler.toml` declares an assets-only Worker — there is no server-side script, so Wrangler just serves `dist/`.

`dist/` is gitignored and assembled in CI only; the root `game.js` stays committed so `file://` still works. Live at https://lighthouse.drummer-dan-t.workers.dev.

The workflow needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets. `scripts/set-cloudflare-secrets.sh` prompts for both and pipes them into `gh secret set` over stdin, so the token never lands in argv or shell history. Never pass a token as a command-line argument, and never paste one into a chat transcript.

## Architecture

All game state and logic lives in [game.ts](game.ts), in four parts:

1. **The world data** — `rooms: Record<RoomId, Room>`. Four rooms laid out as a 2×2 grid (a comment above the literal draws the map). Each room carries `exits` (direction → `RoomId`), `blocked` (direction → the prose shown when you try to walk that way), and `short`, a one-word label for the map tile. Every direction not in `exits` should have an entry in `blocked`; `move()` falls back to a generic "You cannot go that way." otherwise, which reads as a gap in the writing rather than a bug.

2. **Rendering** — `render(message, blocked)` rewrites the DOM from `current` on every move. It does not diff; there is no framework. The element ids it writes to (`room-name`, `description`, `exits`, `message`, `stage`, `map`) are the entire contract with [index.html](index.html) — renaming one means editing both files. Exits are listed in the fixed `order` array (north, south, east, west), not in room-literal order. `render()` also sets `document.body.dataset.room`, which is what drives per-room theming in CSS.

3. **The map** — `buildMap()` creates the four tiles once at startup, in the reading order given by `layout`; `paintMap()` then marks the current room `here` and its reachable neighbours `near` on each render.

4. **Input** — a single `keydown` listener maps arrow keys through `keys` to a `Direction`. Arrow keys are the only input; there is no text parser.

Adding a room means extending the `RoomId` union, adding the room literal (including `short`), adding it to `layout` so it gets a map tile, and adding the reciprocal exit from its neighbour — `strict` mode will flag a `RoomId` you declared but never defined, but nothing checks that exits are two-way.

## Styling

[style.css](style.css) is themed through CSS custom properties: `--ink`, `--dim`, `--glow`, `--sea`, `--panel`, `--edge`, `--beam` (strength of the sweeping light) and `--warm` (warmth of the background wash).

Defaults live on `:root`, but **each room overrides them** in a `body[data-room="..."]` block, so editing `:root` alone will not change what you see in a room — change the room blocks too. Prefer adjusting these variables over hardcoding new colours.

Animation is driven by adding a class and letting CSS run the keyframes; `replay()` removes, reflows and re-adds a class so an animation can fire twice in a row. All motion is disabled under `prefers-reduced-motion`, and any new animation should stay inside that guard.

## Prose

Room descriptions and blocked-direction messages are written in a consistent voice: second person, present tense, concrete and slightly bleak, two sentences for descriptions and one for blocked directions. Blocked messages give a physical reason the way is shut rather than just refusing. Match that register when adding content.
