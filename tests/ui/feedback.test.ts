import assert from "node:assert/strict";
import test from "node:test";

import { storyBank } from "../../app/content/story-bank.ts";
import { reviewInference } from "../../app/domain/inference.ts";
import {
  getReviewDetails,
  getReviewMessage,
} from "../../app/features/investigation/feedback.ts";

const runningStory = storyBank.cases.find((story) => story.id === "second-start-line")!;

test("two individually related clues receive a clear two-clue explanation", () => {
  const inference = {
    mindId: "persevere",
    evidenceCardIds: [runningStory.evidenceCards[1].id, runningStory.evidenceCards[2].id],
  } as const;
  const review = reviewInference(inference, runningStory, storyBank.registry);
  const message = getReviewMessage(review);
  const details = getReviewDetails(review, runningStory, inference, storyBank.registry);

  assert.match(message.title, /두 단서/);
  assert.match(message.body, /모두/);
  assert.match(details.join(" "), /각각.*끝까지 이어 가고 싶은 마음/);
  assert.doesNotMatch(details.join(" "), /함께 살펴볼 수 있어요|이 해석/);
});

test("one related clue names both the connected clue and the clue to reconsider", () => {
  const inference = {
    mindId: "worried",
    evidenceCardIds: [runningStory.evidenceCards[0].id, runningStory.evidenceCards[5].id],
  } as const;
  const review = reviewInference(inference, runningStory, storyBank.registry);
  const details = getReviewDetails(review, runningStory, inference, storyBank.registry).join(" ");

  assert.equal(review.code, "partially-supported");
  assert.match(details, /바통을 얼른 주웠습니다.*걱정하는 마음/);
  assert.match(details, /운동장 끝을 보며.*다시 살펴보세요/);
});

test("mismatched evidence names the alternative mind instead of saying this interpretation", () => {
  const inference = {
    mindId: "worried",
    evidenceCardIds: [runningStory.evidenceCards[1].id, runningStory.evidenceCards[3].id],
  } as const;
  const review = reviewInference(inference, runningStory, storyBank.registry);
  const details = getReviewDetails(review, runningStory, inference, storyBank.registry).join(" ");

  assert.equal(review.code, "evidence-link-mismatch");
  assert.match(details, /다시 해 보고 싶은 마음.*다른 해석/);
  assert.doesNotMatch(details, /이 해석/);
});

test("all generated review details avoid recommending an already selected clue", () => {
  for (const story of [storyBank.tutorial, ...storyBank.cases]) {
    for (const mindId of story.candidateMindIds) {
      for (let first = 0; first < story.evidenceCards.length; first += 1) {
        for (let second = first + 1; second < story.evidenceCards.length; second += 1) {
          const inference = {
            mindId,
            evidenceCardIds: [story.evidenceCards[first].id, story.evidenceCards[second].id],
          } as const;
          const review = reviewInference(inference, story, storyBank.registry);
          const details = getReviewDetails(review, story, inference, storyBank.registry).join(" ");
          assert.doesNotMatch(details, /함께 살펴볼 수 있어요|이 해석/);
        }
      }
    }
  }
});
