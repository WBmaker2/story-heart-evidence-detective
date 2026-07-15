import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appRoot = new URL("../../app/", import.meta.url);

test("phase changes target a visible programmatic heading instead of the outline-free main", async () => {
  const [app, investigation, review, summary] = await Promise.all([
    readFile(new URL("features/investigation/InvestigationApp.tsx", appRoot), "utf8"),
    readFile(new URL("components/InvestigationPanel.tsx", appRoot), "utf8"),
    readFile(new URL("components/ReviewPanel.tsx", appRoot), "utf8"),
    readFile(new URL("components/SummaryScreen.tsx", appRoot), "utf8"),
  ]);

  assert.match(app, /querySelector<HTMLElement>\("\[data-stage-heading\]"\)/);
  assert.doesNotMatch(app, /mainRef\.current\?\.focus/);
  assert.ok((investigation.match(/data-stage-heading/g) ?? []).length >= 3);
  assert.match(review, /data-stage-heading/);
  assert.match(summary, /data-stage-heading/);
});

test("mobile header targets keep a 48px touch area", async () => {
  const css = await readFile(new URL("styles/shell.css", appRoot), "utf8");
  assert.match(css, /\.brand\s*\{[^}]*min-height:\s*48px/s);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.utility-button\s*\{[^}]*width:\s*48px/s);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.utility-button\s*\{[^}]*min-width:\s*48px/s);
});

test("global CSS preserves keyboard, 320px, motion, color, and touch contracts", async () => {
  const [globals, shell, cases] = await Promise.all([
    readFile(new URL("globals.css", appRoot), "utf8"),
    readFile(new URL("styles/shell.css", appRoot), "utf8"),
    readFile(new URL("styles/case.css", appRoot), "utf8"),
  ]);

  assert.match(globals, /html\s*\{[^}]*min-width:\s*320px/s);
  assert.match(globals, /body\s*\{[^}]*min-width:\s*320px/s);
  assert.match(globals, /:focus-visible\s*\{[^}]*outline:\s*4px solid var\(--focus\)/s);
  assert.match(globals, /\.button\s*\{[^}]*min-height:\s*50px/s);
  assert.match(globals, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(globals, /@media \(forced-colors:\s*active\)/);
  assert.match(shell, /@media \(max-width:\s*640px\)/);
  assert.match(cases, /@media \(max-width:\s*700px\)[\s\S]*\.choice-grid, \.evidence-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
});
