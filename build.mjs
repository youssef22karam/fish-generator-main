// Rebuilds the single-file app: node build.mjs  ->  dist/Fish_generator_v10.html
import fs from "node:fs";
import path from "node:path";
const cfg = JSON.parse(fs.readFileSync("build.json", "utf8"));
const strip = f => { const b = fs.readFileSync(f); return b.subarray(b.indexOf(10) + 1); }; // drop "// @@PART" header line
const fill = (buf, key, val) => {
  const k = Buffer.from(key), i = buf.indexOf(k);
  if (i < 0) throw new Error("missing " + key);
  return Buffer.concat([buf.subarray(0, i), val, buf.subarray(i + k.length)]);
};
let out = fs.readFileSync(cfg.template);
out = fill(out, "{{CSS}}", fs.readFileSync(cfg.css));
out = fill(out, "{{APP}}", Buffer.concat(cfg.app.map(strip)));
fs.mkdirSync(path.dirname(cfg.output), { recursive: true });
fs.writeFileSync(cfg.output, out);
console.log("built", cfg.output, out.length, "bytes");
