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
