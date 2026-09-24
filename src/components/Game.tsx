"use client";

import { useCallback, useEffect, useState } from "react";
import {
  arrows,
  keys,
  layout,
  order,
  rooms,
  start,
  type Direction,
  type RoomId,
} from "@/lib/rooms";

export default function Game() {
  const [current, setCurrent] = useState<RoomId>(start);
  const [message, setMessage] = useState(
    "The arrow keys move you. Waves break somewhere below."
  );
  const [blocked, setBlocked] = useState(false);
  // Bumped on every keypress so the message animation replays even when
  // the text is unchanged; the prototype did this by re-adding the class.
  const [beat, setBeat] = useState(0);

  // Drives the per-room theming in CSS.
  useEffect(() => {
    document.body.dataset.room = current;
  }, [current]);

  const move = useCallback(
    (dir: Direction) => {
      const room = rooms[current];
      const target = room.exits[dir];
      setBeat((b) => b + 1);

      if (target) {
        setCurrent(target);
        setMessage(`You go ${dir}.`);
        setBlocked(false);
        return;
      }

      setMessage(room.blocked[dir] ?? "You cannot go that way.");
      setBlocked(true);
    },
    [current]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const dir = keys[event.key];
      if (!dir) return;
      event.preventDefault();
      move(dir);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [move]);

  const room = rooms[current];
  const reachable = new Set<RoomId>(Object.values(room.exits));

  const exits = order
    .map((dir) => ({ dir, target: room.exits[dir] }))
    .filter((exit): exit is { dir: Direction; target: RoomId } =>
      exit.target !== undefined
    );

  return (
    <main>
      <p className="eyebrow">
        <span className="spark" aria-hidden="true" /> A small adventure
      </p>

      {/* Keyed on the room so arriving replays the settle-in animation. */}
      <div id="stage" key={current} className="swap">
        <h1 id="room-name">{room.name}</h1>
        <p id="description">{room.description}</p>
      </div>

      <div className="columns">
        <section className="exits">
          <h2>You can go</h2>
          <ul id="exits">
            {exits.map(({ dir, target }) => (
              <li key={`${current}-${dir}`}>
                <kbd className="arrow">{arrows[dir]}</kbd>
                <span className="dir">{dir}</span>
                <span className="lead" />
                <span className="place">{rooms[target].name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mapwrap">
          <h2>The tower</h2>
          <div id="map" className="map">
            {layout.map((id) => (
              <div
                key={id}
                data-room={id}
                className={[
                  "tile",
                  id === current ? "here" : "",
                  reachable.has(id) ? "near" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="pip" />
                <span className="label">{rooms[id].short}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p
        id="message"
        key={`beat-${beat}`}
        className={[
          "message",
          blocked ? "is-blocked" : "",
          blocked ? "shake" : "fade",
        ]
          .filter(Boolean)
          .join(" ")}
        role="status"
        aria-live="polite"
      >
        {message}
      </p>

      <footer>Arrow keys to move</footer>
    </main>
  );
}
