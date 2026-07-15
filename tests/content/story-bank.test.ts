import assert from "node:assert/strict";
import test from "node:test";

import { FIXED_STORY_IDS, storyBank } from "../../app/content/story-bank.ts";
import { updateHistory } from "../../app/content/update-history.ts";
import { validateStoryBank } from "../../app/domain/story-validator.ts";

test("the static story bank passes all automated validation", () => {
  assert.deepEqual(validateStoryBank(storyBank), []);
  assert.deepEqual(
    [storyBank.tutorial.id, ...storyBank.cases.map((item) => item.id)],
    FIXED_STORY_IDS,
  );
});

test("invalid text anchors and fixed ordering fail validation", () => {
  const broken = structuredClone(storyBank);
  broken.tutorial.evidenceCards[0].anchor.exactQuote = "본문에 없는 문구";
  broken.cases[0].order = 99;
  const issues = validateStoryBank(broken);
  assert.ok(issues.some((issue) => issue.rule === "anchor-exact-quote"));
  assert.ok(issues.some((issue) => issue.rule === "fixed-story-order"));
});

test("every case meets the public content counts and metadata contract", () => {
  for (const item of [storyBank.tutorial, ...storyBank.cases]) {
    assert.ok(item.paragraphs.length >= 4 && item.paragraphs.length <= 6);
    assert.equal(item.candidateMindIds.length, 4);
    assert.ok(item.evidenceCards.length >= 5 && item.evidenceCards.length <= 6);
    assert.ok(item.reviewedReadings.length >= 2 && item.reviewedReadings.length <= 3);
    assert.equal(item.originality.origin, "original-for-this-app");
    assert.deepEqual(item.originality.externalSourceUrls, []);
  }
});

test("update history records the first development release", () => {
  assert.deepEqual(updateHistory[0], {
    date: "2026-07-15",
    version: "1.0.0",
    kind: "개발",
    summary: "이야기 7편과 근거 기반 복수 해석 판정 자료를 처음 만들었어요.",
  });
});
