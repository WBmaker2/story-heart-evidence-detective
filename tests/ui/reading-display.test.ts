import assert from "node:assert/strict";
import test from "node:test";

import { storyBank } from "../../app/content/story-bank.ts";
import { getReadingSegments } from "../../app/features/investigation/reading.ts";

test("quoted Korean questions stay with the closing quote and narration", () => {
  const robotStory = storyBank.cases.find((story) => story.id === "stopped-robot");
  assert.ok(robotStory);

  const segments = getReadingSegments(robotStory);
  assert.deepEqual(segments, robotStory.paragraphs.map((paragraph) => paragraph.text));
  assert.ok(
    segments.includes("하린이는 눈을 조금 크게 뜨고 “어느 표시에서 멈췄지?”라고 물었습니다."),
  );
  assert.equal(segments.some((segment) => segment.trimStart().startsWith("”")), false);
});
