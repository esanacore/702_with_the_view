/**
 * Measured code coverage for site/app.js.
 *
 * Runs the page in Chromium under V8's coverage profiler and replays the
 * same interactions tests/test_interactions.sh performs, then reports both
 * line coverage and never-executed block ranges (branch coverage). Coverage
 * is merged across the main page and the fixture variants, because several
 * branches only exist on a page whose APIs or markup differ (no
 * IntersectionObserver, reduced motion, dark system theme, figures with no
 * caption, a site with no photos yet).
 *
 * This is a LOCAL developer tool, not part of the deployed site and not a
 * CI dependency: it borrows Playwright from the gstack skill install rather
 * than adding a package.json (site/ stays dependency-free — see
 * docs/adr/0002 and docs/OTS_SOFTWARE.md). Run it via:
 *
 *   bash tests/test_coverage.sh
 *
 * Exit status: 0 when both line and block coverage are complete, 1 otherwise.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");

const PLAYWRIGHT = process.env.PLAYWRIGHT_PATH;
const { chromium } = require(PLAYWRIGHT);

const ROOT = path.resolve(__dirname, "..");
const SITE_DIR = path.join(ROOT, "site");
const APP = path.join(SITE_DIR, "app.js");
const fileUrl = (p) => "file:///" + p.replace(/\\/g, "/");

// ---------------------------------------------------------------- fixtures
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "702-coverage-"));
const indexHtml = fs.readFileSync(path.join(SITE_DIR, "index.html"), "utf8");

/** Write a variant page whose relative URLs resolve to a chosen base. */
function variant(name, { stub = "", transform = (h) => h, base = SITE_DIR } = {}) {
  let html = indexHtml
    .replace("<head>", `<head><base href="${fileUrl(base)}/">`)
    .replace('<script src="app.js"></script>', `<script>${stub}</script><script src="${fileUrl(APP)}"></script>`);
  html = transform(html);
  const file = path.join(workDir, name + ".html");
  fs.writeFileSync(file, html);
  return fileUrl(file);
}

// A directory with no photos, so every slot stays a placeholder.
const emptyAssets = path.join(workDir, "empty-site");
fs.mkdirSync(path.join(emptyAssets, "assets", "photos"), { recursive: true });

const PAGES = {
  main: fileUrl(path.join(SITE_DIR, "index.html")),
  noIntersectionObserver: variant("no-io", { stub: "delete window.IntersectionObserver;" }),
  reducedMotion: variant("reduced-motion", {
    stub: "var _mm = window.matchMedia; window.matchMedia = function (q) { return q.indexOf('reduced-motion') >= 0 ? { matches: true, addEventListener: function () {} } : _mm.call(window, q); };",
  }),
  darkSystem: variant("dark-system", {
    stub: "var _mm = window.matchMedia; window.matchMedia = function (q) { return q.indexOf('color-scheme') >= 0 ? { matches: true, addEventListener: function () {} } : _mm.call(window, q); };",
  }),
  bareFigures: variant("bare-figures", {
    transform: (h) => h.replace(/ data-alt="[^"]*"/g, "").replace(/<figcaption>[^<]*<\/figcaption>/g, ""),
  }),
  noPhotos: variant("no-photos", { base: emptyAssets }),
};

// ------------------------------------------------------------- interactions
async function replayMain(page) {
  // Theme: no stored preference -> system followed (covers storedTheme's
  // null return and applyTheme's light branch)
  await page.evaluate(() => localStorage.removeItem("702-theme"));
  await page.evaluate(() => window.__702test.onSystemThemeChange(true));
  await page.evaluate(() => window.__702test.onSystemThemeChange(false));
  // Toggle both directions (persists a preference)
  await page.click("#themeToggle");
  await page.click("#themeToggle");
  // Stored preference wins over a system change
  await page.evaluate(() => {
    localStorage.setItem("702-theme", "dark");
    window.__702test.onSystemThemeChange(false);
  });
  // Storage throwing (private mode) must not break either path
  await page.evaluate(() => {
    const g = Storage.prototype.getItem, s = Storage.prototype.setItem;
    Storage.prototype.getItem = () => { throw new Error("blocked"); };
    Storage.prototype.setItem = () => { throw new Error("blocked"); };
    document.getElementById("themeToggle").click();
    try { window.__702test.onSystemThemeChange(true); } catch (e) { /* must not throw */ }
    Storage.prototype.getItem = g; Storage.prototype.setItem = s;
  });
  // A real OS theme flip drives the media listener. The change event is
  // delivered asynchronously, so each flip needs a tick to land.
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForTimeout(250);
  await page.emulateMedia({ colorScheme: "light" });
  await page.waitForTimeout(250);

  // Reveal + scrollspy
  await page.evaluate(() => document.getElementById("community").scrollIntoView({ block: "center" }));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  // Lightbox: open, wrap backwards, arrows, every close path, keyboard open
  await page.evaluate(() => document.querySelector(".ph img").click());
  await page.evaluate(() => document.getElementById("lightboxPrev").click());
  await page.evaluate(() => document.getElementById("lightboxNext").click());
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    document.querySelector(".ph img").click();
    document.getElementById("lightbox").click();       // backdrop
    document.querySelector(".ph img").click();
    document.getElementById("lightboxClose").click();  // close button
    const img = document.querySelectorAll(".ph img")[1];
    img.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    document.getElementById("lightboxClose").click();
    img.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    document.getElementById("lightboxClose").click();
    img.dispatchEvent(new KeyboardEvent("keydown", { key: "x", bubbles: true })); // ignored key
    document.querySelector(".footer").click();                                    // non-photo click
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));      // keydown while closed
    document.dispatchEvent(new MouseEvent("click"));   // target without .closest
  });
  await page.waitForTimeout(200);
}

async function replayBareFigures(page) {
  // Figures with neither data-alt nor caption: alt and lightbox caption
  // both fall back.
  await page.evaluate(() => document.querySelector(".ph img").click());
  await page.evaluate(() => document.getElementById("lightboxClose").click());
}

async function replayNoPhotos(page) {
  // Nothing loaded: the viewer must no-op rather than throw.
  await page.evaluate(() => document.getElementById("lightboxNext").click());
}

// ------------------------------------------------------------------- runner
(async () => {
  const browser = await chromium.launch();
  const merged = [];

  for (const [name, url] of Object.entries(PAGES)) {
    const page = await browser.newPage();
    await page.coverage.startJSCoverage();
    await page.goto(url);
    await page.waitForTimeout(1000);
    if (name === "main") await replayMain(page);
    else if (name === "bareFigures") await replayBareFigures(page);
    else if (name === "noPhotos") await replayNoPhotos(page);
    const cov = await page.coverage.stopJSCoverage();
    const entry = cov.find((e) => e.url.endsWith("/app.js"));
    if (entry) merged.push(entry);
    await page.close();
  }
  await browser.close();
  fs.rmSync(workDir, { recursive: true, force: true });

  const src = fs.readFileSync(APP, "utf8");

  // Merge byte-wise. V8 emits explicit ranges only for regions it did NOT
  // execute (an executed block is implied by its enclosing range), so a
  // block covered on one page produces no matching range on another —
  // range keys can't be compared across pages, bytes can.
  //
  // Per page: paint executed ranges, then un-paint the count===0 holes
  // inside them. Across pages: OR the results together.
  const coveredBytes = new Array(src.length).fill(false);
  for (const entry of merged) {
    const pageBytes = new Array(src.length).fill(false);
    for (const fn of entry.functions) {
      for (const r of fn.ranges) {
        if (r.count > 0) {
          for (let i = r.startOffset; i < r.endOffset && i < pageBytes.length; i++) pageBytes[i] = true;
        }
      }
    }
    for (const fn of entry.functions) {
      for (const r of fn.ranges) {
        if (r.count === 0) {
          for (let i = r.startOffset; i < r.endOffset && i < pageBytes.length; i++) pageBytes[i] = false;
        }
      }
    }
    for (let i = 0; i < coveredBytes.length; i++) if (pageBytes[i]) coveredBytes[i] = true;
  }

  const lines = src.split("\n");
  let offset = 0, totalLines = 0, hitLines = 0;
  const missedLines = [];
  lines.forEach((line, idx) => {
    const t = line.trim();
    const isCode = t && !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*");
    if (isCode) {
      totalLines++;
      let any = false;
      for (let i = offset; i < offset + line.length; i++) if (coveredBytes[i]) { any = true; break; }
      if (any) hitLines++; else missedLines.push(`${idx + 1}: ${t.slice(0, 70)}`);
    }
    offset += line.length + 1;
  });

  // A block is genuinely uncovered only when no page executed any of its
  // bytes.
  const missedBlocks = [];
  for (const entry of merged) {
    for (const fn of entry.functions) {
      for (const r of fn.ranges) {
        if (r.count !== 0) continue;
        const key = r.startOffset + ":" + r.endOffset;
        if (missedBlocks.some((m) => m.key === key)) continue;
        let anyCovered = false;
        for (let i = r.startOffset; i < r.endOffset && i < coveredBytes.length; i++) {
          if (coveredBytes[i]) { anyCovered = true; break; }
        }
        if (anyCovered) continue;
        const text = src.slice(r.startOffset, r.endOffset).trim();
        const line = src.slice(0, r.startOffset).split("\n").length;
        if (text) missedBlocks.push({ key, text: `line ${line}: ${text.replace(/\s+/g, " ").slice(0, 90)}` });
      }
    }
  }

  const linePct = ((hitLines / totalLines) * 100).toFixed(1);
  console.log("app.js coverage (merged across " + merged.length + " page loads)");
  console.log("------------------------------------------------------");
  console.log(`  Lines   ${hitLines}/${totalLines} = ${linePct}%`);
  missedLines.forEach((m) => console.log("    MISSED line " + m));
  console.log(`  Blocks  ${missedBlocks.length} never-executed range(s)`);
  missedBlocks.forEach((m) => console.log("    MISSED " + m.text));

  const ok = missedLines.length === 0 && missedBlocks.length === 0;
  console.log("------------------------------------------------------");
  console.log(ok ? "  100% line and block coverage." : "  Coverage incomplete.");
  process.exit(ok ? 0 : 1);
})();
