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

test("a smaller referenced mind registry is not rejected solely for its count", () => {
  const smaller = structuredClone(storyBank);
  smaller.registry.minds = smaller.registry.minds.slice(0, 4);
  const mindIds = smaller.registry.minds.map((mind) => mind.id);
  assert.equal(mindIds.length, 4);

  for (const item of [smaller.tutorial, ...smaller.cases]) {
    item.candidateMindIds = [mindIds[0], mindIds[1], mindIds[2], mindIds[3]];
    item.reviewedReadings.forEach((reading, index) => {
      reading.mindId = mindIds[index];
    });
  }

  assert.equal(
    validateStoryBank(smaller).some((issue) => issue.rule === "mind-count"),
    false,
  );
});

test("update history keeps the development release and leads with the newest improvement", () => {
  assert.deepEqual(updateHistory.at(-1), {
    date: "2026-07-15",
    version: "1.0.0",
    kind: "개발",
    summary: "이야기 7편과 근거 기반 복수 해석 판정 자료를 처음 만들었어요.",
  });
  assert.deepEqual(updateHistory[0], {
    date: "2026-07-15",
    version: "1.1.6",
    kind: "개선",
    summary: "결과 화면에서 고른 단서와 다른 해석의 관계를 헷갈리지 않도록 설명을 더 분명하게 바꿨어요.",
  });
});
