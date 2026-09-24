type Direction = "north" | "south" | "east" | "west";

interface Room {
  name: string;
  description: string;
  /** Rooms reachable from here. */
  exits: Partial<Record<Direction, RoomId>>;
  /** Why the remaining directions are not an option. */
  blocked: Partial<Record<Direction, string>>;
}

type RoomId = "stair" | "lamp" | "kitchen" | "rocks";

/*
  The 2x2 grid, read as a cross-section of the lighthouse:

      Spiral Stair | Lamp Room
      -------------+-----------
      Keeper's Kit | Rocks
*/
const rooms: Record<RoomId, Room> = {
  stair: {
    name: "Spiral Stair",
    description:
      "Stone steps curl up the inside of the tower, worn hollow in the middle by a century of boots. " +
      "A cold draught comes down from above, carrying the smell of hot brass.",
    exits: { east: "lamp", south: "kitchen" },
    blocked: {
      north: "The stair turns back on itself here. There is nothing above you but cold stone.",
      west: "Only wall that way, and beyond it a long drop to the water.",
    },
  },
  lamp: {
    name: "Lamp Room",
    description:
      "The great lens sits in its cradle of gears, throwing slow bars of light out across the water. " +
      "Salt has crusted the seaward windows, and the floor hums faintly under your feet.",
    exits: { west: "stair" },
    blocked: {
      north: "The gallery rail is rusted through on that side. You think better of it.",
      east: "The glass is fixed fast, and past it there is only air.",
      south: "You would have to step out of the window and fall to reach the rocks.",
    },
  },
  kitchen: {
    name: "Keeper's Kitchen",
    description:
      "A kettle stands on the cold stove, and one chair is drawn up to a table scattered with logbooks. " +
      "The door to the rocks bangs gently in its frame, never quite shut.",
    exits: { north: "stair", east: "rocks" },
    blocked: {
      south: "That wall is three feet of granite with a cupboard pushed against it.",
      west: "The seaward wall has no door, only a small window painted shut.",
    },
  },
  rocks: {
    name: "The Rocks",
    description:
      "Black wet rock slopes away into the surf, and the tower rises above you into the grey. " +
      "A low door stands open to the west, wedged with a stone so the wind cannot take it.",
    exits: { west: "kitchen" },
    blocked: {
      north: "The lamp room is a hundred feet straight up the wall. You are not a gull.",
      east: "East is open sea, and the tide is coming in.",
      south: "Behind you the rock drops away into deep water.",
    },
  },
};

const arrows: Record<Direction, string> = {
  north: "↑",
  south: "↓",
  east: "→",
  west: "←",
};

const keys: Record<string, Direction> = {
  ArrowUp: "north",
  ArrowDown: "south",
  ArrowRight: "east",
  ArrowLeft: "west",
};

const order: Direction[] = ["north", "south", "east", "west"];

let current: RoomId = "rocks";

function el(id: string): HTMLElement {
  const node = document.getElementById(id);
  if (!node) throw new Error("Missing element: " + id);
  return node;
}

function render(message: string): void {
  const room = rooms[current];

  el("room-name").textContent = room.name;
  el("description").textContent = room.description;

  const exits = el("exits");
  exits.textContent = "";
  for (const dir of order) {
    const target = room.exits[dir];
    if (!target) continue;
    const item = document.createElement("li");
    item.innerHTML =
      '<span class="arrow">' + arrows[dir] + "</span> " +
      '<span class="dir">' + dir + "</span> to the " +
      '<span class="place">' + rooms[target].name + "</span>";
    exits.appendChild(item);
  }

  el("message").textContent = message;
}

function move(dir: Direction): void {
  const room = rooms[current];
  const target = room.exits[dir];

  if (target) {
    current = target;
    render("You go " + dir + ".");
    return;
  }

  render(room.blocked[dir] ?? "You cannot go that way.");
}

document.addEventListener("keydown", (event: KeyboardEvent) => {
  const dir = keys[event.key];
  if (!dir) return;
  event.preventDefault();
  move(dir);
});

render("The arrow keys move you. Waves break somewhere below.");
