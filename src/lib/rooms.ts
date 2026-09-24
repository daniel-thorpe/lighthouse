export type Direction = "north" | "south" | "east" | "west";

export type RoomId = "stair" | "lamp" | "kitchen" | "rocks";

export interface Room {
  name: string;
  /** Short label for the map tile. */
  short: string;
  description: string;
  /** Rooms reachable from here. */
  exits: Partial<Record<Direction, RoomId>>;
  /** Why the remaining directions are not an option. */
  blocked: Partial<Record<Direction, string>>;
}

/*
  The 2x2 grid, read as a cross-section of the lighthouse:

      Spiral Stair | Lamp Room
      -------------+-----------
      Keeper's Kit | Rocks
*/
export const rooms: Record<RoomId, Room> = {
  stair: {
    name: "Spiral Stair",
    short: "Stair",
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
    short: "Lamp",
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
    short: "Kitchen",
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
    short: "Rocks",
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

export const arrows: Record<Direction, string> = {
  north: "↑",
  south: "↓",
  east: "→",
  west: "←",
};

export const keys: Record<string, Direction> = {
  ArrowUp: "north",
  ArrowDown: "south",
  ArrowRight: "east",
  ArrowLeft: "west",
};

export const order: Direction[] = ["north", "south", "east", "west"];

/** Map tiles, in reading order across the 2x2 grid. */
export const layout: RoomId[] = ["stair", "lamp", "kitchen", "rocks"];

/** Where the player begins. */
export const start: RoomId = "rocks";
