import assert from "node:assert/strict";
import test from "node:test";

import { storyBank } from "../../app/content/story-bank.ts";
import {
  getReadingSegments,
  segmentKoreanSentences,
} from "../../app/features/investigation/reading.ts";

test("quoted Korean questions stay with the closing quote and narration", () => {
  const robotStory = storyBank.cases.find((story) => story.id === "stopped-robot");
  assert.ok(robotStory);

  const segments = getReadingSegments(robotStory);
  assert.ok(
    segments.includes("하린이는 눈을 조금 크게 뜨고 “어느 표시에서 멈췄지?”라고 물었습니다."),
  );
  assert.equal(segments.some((segment) => segment.trimStart().startsWith("”")), false);
});

test("two narrative sentences in one paragraph become two reading steps", () => {
  const runningStory = storyBank.cases.find((story) => story.id === "second-start-line");
  assert.ok(runningStory);
  assert.deepEqual(
    segmentKoreanSentences("우진이는 바통을 얼른 주웠습니다. 그리고 친구들을 바라보며 입술을 꼭 다물었습니다."),
    [
      "우진이는 바통을 얼른 주웠습니다.",
      "그리고 친구들을 바라보며 입술을 꼭 다물었습니다.",
    ],
  );
  assert.equal(getReadingSegments(runningStory).length, runningStory.paragraphs.length + 1);
});

test("quoted questions and exclamations keep their following Korean narration", () => {
  assert.deepEqual(
    segmentKoreanSentences("하린이는 “어디에서 멈췄지?”라고 물었습니다. 우진이는 “괜찮아, 다시 갈게!”라고 말했습니다."),
    [
      "하린이는 “어디에서 멈췄지?”라고 물었습니다.",
      "우진이는 “괜찮아, 다시 갈게!”라고 말했습니다.",
    ],
  );
});

test("reading segments reconstruct every paragraph and the full story with single spaces", () => {
  for (const story of [storyBank.tutorial, ...storyBank.cases]) {
    const expected = story.paragraphs.map((paragraph) => paragraph.text.trim()).join(" ");
    assert.equal(getReadingSegments(story).join(" "), expected);
  }
});
