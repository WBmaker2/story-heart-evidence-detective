import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { storyBank } from "../../app/content/story-bank.ts";
import { getInvestigationStagePrompt } from "../../app/features/investigation/copy.ts";

test("each investigation stage asks only for the action available on that screen", () => {
  const story = storyBank.cases[0];

  assert.equal(
    getInvestigationStagePrompt(story, "reading"),
    "우진의 마음이나 생각을 살필 장면을 천천히 읽어 보세요.",
  );
  assert.equal(
    getInvestigationStagePrompt(story, "mind"),
    "우진의 마음이나 생각을 하나 골라 보세요.",
  );
  assert.equal(
    getInvestigationStagePrompt(story, "evidence"),
    "고른 마음과 이어지는 단서 두 개를 골라 보세요.",
  );
});

test("the start guide and progress rail use the same four step names", async () => {
  const [startScreen, investigationApp] = await Promise.all([
    readFile(new URL("../../app/components/StartScreen.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../app/features/investigation/InvestigationApp.tsx", import.meta.url), "utf8"),
  ]);
  const labels = ["이야기 읽기", "마음 고르기", "단서 연결", "같이 살펴보기"];

  assert.match(startScreen, /aria-label="수사 방법 네 단계"/);
  for (const label of labels) {
    assert.match(startScreen, new RegExp(`<strong>${label}</strong>`));
    assert.match(investigationApp, new RegExp(`"${label}"`));
  }
});

test("student-facing activity labels use second-grade-friendly words", async () => {
  const files = await Promise.all([
    "../../app/components/StartScreen.tsx",
    "../../app/components/ReviewPanel.tsx",
    "../../app/components/InvestigationPanel.tsx",
    "../../app/components/SummaryScreen.tsx",
    "../../app/features/investigation/InvestigationApp.tsx",
    "../../app/features/investigation/feedback.ts",
  ].map((path) => readFile(new URL(path, import.meta.url), "utf8")));
  const copy = files.join("\n");

  assert.match(copy, /한 말/);
  assert.match(copy, /다른 생각/);
  assert.match(copy, /같이 살펴보기/);
  assert.match(copy, /내가 살핀 기록/);
  assert.doesNotMatch(copy, /대사|다른 해석|함께 검토|수사 기록/);
});

test("the work panel does not introduce a second set of step numbers", async () => {
  const panel = await readFile(
    new URL("../../app/components/InvestigationPanel.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(panel, /<legend[^>]*><span>\d<\/span>/);
  assert.doesNotMatch(panel, /<h3><span>\d<\/span>/);
  assert.match(panel, /지금은 마음이나 생각 하나만 고르면 돼요/);
  assert.match(panel, /단서는 다음 화면에서 두 장 고를 거예요/);
});
