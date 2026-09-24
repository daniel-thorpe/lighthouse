# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small browser text adventure set in a lighthouse. No package.json, no dependencies, no test suite, no bundler — six files at the repository root, opened directly in a browser.

## Build and run

`game.ts` compiles to `game.js`, and **the compiled `game.js` is committed** (it is not gitignored; `index.html` loads it via a plain `<script src>`). After editing `game.ts`, always recompile and commit both files, or the page will silently run stale code.

TypeScript is not installed locally, so compile via npx:

```bash
npx -p typescript tsc
```

`tsconfig.json` has `"files": ["game.ts"]`, `"module": "none"` and `"outDir": "."`, so that command emits `game.js` next to the source. There is no watch script; re-run it after each change.

To run the game, open `index.html` in a browser — there is no dev server, and `module: none` means no ES module loading, so `file://` works fine.

## Architecture

All game state and logic lives in [game.ts](game.ts), in three parts:

1. **The world data** — `rooms: Record<RoomId, Room>`. Four rooms laid out as a 2×2 grid (a comment above the literal draws the map). Each room carries `exits` (direction → `RoomId`) and `blocked` (direction → the prose shown when you try to walk that way). Every direction not in `exits` should have an entry in `blocked`; `move()` falls back to a generic "You cannot go that way." otherwise, which reads as a gap in the writing rather than a bug.

2. **Rendering** — `render(message)` rewrites the DOM from `current` on every move. It does not diff; there is no framework. The element ids it writes to (`room-name`, `description`, `exits`, `message`) are the entire contract with [index.html](index.html) — renaming one means editing both files. Exits are listed in the fixed `order` array (north, south, east, west), not in room-literal order.

3. **Input** — a single `keydown` listener maps arrow keys through `keys` to a `Direction`. Arrow keys are the only input; there is no text parser.

Adding a room means extending the `RoomId` union, adding the room literal, and adding the reciprocal exit from its neighbour — `strict` mode will flag a `RoomId` you declared but never defined, but nothing checks that exits are two-way.

Styling is in [style.css](style.css), themed through the CSS custom properties on `:root` (`--ink`, `--dim`, `--glow`, `--sea`, `--panel`). Prefer changing those variables over hardcoding new colours.

## Prose

Room descriptions and blocked-direction messages are written in a consistent voice: second person, present tense, concrete and slightly bleak, two sentences for descriptions and one for blocked directions. Blocked messages give a physical reason the way is shut rather than just refusing. Match that register when adding content.
