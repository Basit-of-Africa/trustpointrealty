// Generates public/images/world-map.svg (the footer's "Our Reach" map).
//   node scripts/gen-world-map.mjs
import DottedMap from "dotted-map";
import { writeFileSync } from "node:fs";

const map = new DottedMap({ height: 60, grid: "diagonal" });
const svg = map.getSVG({ radius: 0.22, color: "#c9cfdd", shape: "circle", backgroundColor: "transparent" });
writeFileSync("public/images/world-map.svg", svg);
console.log(`wrote public/images/world-map.svg (${svg.length} bytes)`);
