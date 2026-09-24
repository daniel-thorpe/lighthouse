"use strict";
/*
  The 2x2 grid, read as a cross-section of the lighthouse:

      Spiral Stair | Lamp Room
      -------------+-----------
      Keeper's Kit | Rocks
*/
const rooms = {
    stair: {
        name: "Spiral Stair",
        short: "Stair",
        description: "Stone steps curl up the inside of the tower, worn hollow in the middle by a century of boots. " +
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
        description: "The great lens sits in its cradle of gears, throwing slow bars of light out across the water. " +
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
        description: "A kettle stands on the cold stove, and one chair is drawn up to a table scattered with logbooks. " +
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
        description: "Black wet rock slopes away into the surf, and the tower rises above you into the grey. " +
            "A low door stands open to the west, wedged with a stone so the wind cannot take it.",
        exits: { west: "kitchen" },
        blocked: {
            north: "The lamp room is a hundred feet straight up the wall. You are not a gull.",
            east: "East is open sea, and the tide is coming in.",
            south: "Behind you the rock drops away into deep water.",
        },
    },
};
const arrows = {
    north: "↑",
    south: "↓",
    east: "→",
    west: "←",
};
const keys = {
    ArrowUp: "north",
    ArrowDown: "south",
    ArrowRight: "east",
    ArrowLeft: "west",
};
const order = ["north", "south", "east", "west"];
/** Map tiles, in reading order across the 2x2 grid. */
const layout = ["stair", "lamp", "kitchen", "rocks"];
let current = "rocks";
function el(id) {
    const node = document.getElementById(id);
    if (!node)
        throw new Error("Missing element: " + id);
    return node;
}
/** Restart a CSS animation that is already on the element. */
function replay(node, className) {
    node.classList.remove(className);
    void node.offsetWidth;
    node.classList.add(className);
}
function buildMap() {
    const map = el("map");
    for (const id of layout) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.dataset.room = id;
        tile.innerHTML = '<span class="pip"></span><span class="label">' + rooms[id].short + "</span>";
        map.appendChild(tile);
    }
}
function paintMap() {
    const reachable = new Set(Object.values(rooms[current].exits));
    for (const tile of Array.from(el("map").children)) {
        const id = tile.dataset.room;
        tile.classList.toggle("here", id === current);
        tile.classList.toggle("near", reachable.has(id));
    }
}
function render(message, blocked) {
    const room = rooms[current];
    document.body.dataset.room = current;
    el("room-name").textContent = room.name;
    el("description").textContent = room.description;
    const exits = el("exits");
    exits.textContent = "";
    for (const dir of order) {
        const target = room.exits[dir];
        if (!target)
            continue;
        const item = document.createElement("li");
        item.innerHTML =
            '<kbd class="arrow">' + arrows[dir] + "</kbd>" +
                '<span class="dir">' + dir + "</span>" +
                '<span class="lead"></span>' +
                '<span class="place">' + rooms[target].name + "</span>";
        exits.appendChild(item);
    }
    paintMap();
    const note = el("message");
    note.textContent = message;
    note.classList.toggle("is-blocked", blocked);
    replay(note, blocked ? "shake" : "fade");
    if (!blocked)
        replay(el("stage"), "swap");
}
function move(dir) {
    const room = rooms[current];
    const target = room.exits[dir];
    if (target) {
        current = target;
        render("You go " + dir + ".", false);
        return;
    }
    render(room.blocked[dir] ?? "You cannot go that way.", true);
}
document.addEventListener("keydown", (event) => {
    const dir = keys[event.key];
    if (!dir)
        return;
    event.preventDefault();
    move(dir);
});
buildMap();
render("The arrow keys move you. Waves break somewhere below.", false);
