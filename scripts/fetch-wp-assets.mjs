/**
 * Download the OLD WordPress site's own files (logo, estate flyers, FAQ
 * PDFs, listed in `wpOriginals` in src/content/site.ts) into
 * public/wp-content/uploads/.
 *
 *   npm run fetch-wp-assets
 *
 * Only useful if the WordPress hosting (suspended in Nov 2026) is restored.
 * In a cloud sandbox, run with NODE_USE_ENV_PROXY=1 so Node's fetch uses the
 * HTTPS proxy. Set WP_ORIGIN to download from a restored copy elsewhere.
 * Afterwards, point images.logo / estate faqPdf in site.ts at the files.
 */
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const SOURCE = process.env.WP_ORIGIN ?? "https://trustpointrealty.ng";
const content = await readFile(new URL("../src/content/site.ts", import.meta.url), "utf8");
const paths = [...new Set([...content.matchAll(/wp\("([^"]+)"\)/g)].map((m) => m[1]))];

let ok = 0;
let failed = 0;
for (const path of paths) {
  const dest = join("public/wp-content/uploads", path);
  try {
    await stat(dest);
    console.log(`skip  ${path} (already downloaded)`);
    ok++;
    continue;
  } catch {}
  try {
    const res = await fetch(`${SOURCE}/wp-content/uploads/${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // A suspended or misconfigured host answers with an HTML page; never save that as an image.
    const type = res.headers.get("content-type") ?? "";
    if (!/^(image\/|application\/pdf)/.test(type)) {
      throw new Error(`got ${type || "unknown content"} from ${res.url} instead of an image/PDF`);
    }
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`saved ${path}`);
    ok++;
  } catch (e) {
    console.error(`FAIL  ${path}: ${e.message}`);
    failed++;
  }
}
console.log(`\n${ok}/${paths.length} files ready in public/wp-content/uploads.`);
if (failed) process.exit(1);
console.log("Now point images.logo and each estate's faqPdf in src/content/site.ts at these files.");
