import assert from "node:assert/strict";
import test from "node:test";

import {
  createInitialInvestigationState,
  investigationReducer,
  summaryLanguage,
} from "../../app/features/investigation/state.ts";
import type { InvestigationState } from "../../app/features/investigation/state.ts";
import type { CompletedInference, InferenceReview, ReviewCode } from "../../app/domain/types.ts";

const inference: CompletedInference = {
  mindId: "retry",
  evidenceCardIds: ["evidence-1", "evidence-2"],
};

function reviewFor(code: ReviewCode): InferenceReview {
  if (code === "supported" || code === "evidence-link-mismatch") {
    return {
      code,
      primaryMatch: { readingId: "reading-1", evidencePairId: "pair-1" },
      allMatches: [{ readingId: "reading-1", evidencePairId: "pair-1" }],
      rationaleIds: ["why-1", "why-2", "pair-summary"],
    };
  }
  if (code === "partially-supported") {
    return {
      code,
      readingId: "reading-1",
      matchedEvidenceCardId: "evidence-1",
      rationaleId: "why-1",
    };
  }
  return { code };
}

test("moves through the requested start, reading, mind, evidence flow", () => {
  let state = createInitialInvestigationState();
  assert.equal(state.stage, "start");

  state = investigationReducer(state, { type: "start-tutorial" });
  assert.equal(state.stage, "reading");
  assert.equal(state.run, "tutorial");

  state = investigationReducer(state, { type: "continue" });
  assert.equal(state.stage, "mind");
  state = investigationReducer(state, { type: "choose-mind", mindId: "upset" });
  state = investigationReducer(state, { type: "continue" });
  assert.equal(state.stage, "evidence");
});

test("a third evidence attempt preserves the first two and announces the limit", () => {
  let state: InvestigationState = {
    ...createInitialInvestigationState(),
    stage: "evidence" as const,
    run: "case" as const,
    mindId: "retry",
  };
  state = investigationReducer(state, { type: "toggle-evidence", evidenceId: "evidence-1" });
  state = investigationReducer(state, { type: "toggle-evidence", evidenceId: "evidence-2" });
  state = investigationReducer(state, { type: "toggle-evidence", evidenceId: "evidence-3" });

  assert.deepEqual(state.evidenceCardIds, ["evidence-1", "evidence-2"]);
  assert.equal(state.notice, "max-two-evidence");
});

test("tutorial submission is never added to the six case records", () => {
  let state: InvestigationState = {
    ...createInitialInvestigationState(),
    stage: "evidence" as const,
    run: "tutorial" as const,
    mindId: inference.mindId,
    evidenceCardIds: [...inference.evidenceCardIds],
  };
  state = investigationReducer(state, {
    type: "submit-review",
    caseId: "tutorial-wet-invitation",
    inference,
    review: reviewFor("supported"),
  });
  assert.equal(state.stage, "review");
  assert.deepEqual(state.records, []);

  state = investigationReducer(state, { type: "next" });
  assert.equal(state.run, "case");
  assert.equal(state.caseIndex, 0);
  assert.deepEqual(state.records, []);
});

for (const code of [
  "supported",
  "evidence-link-mismatch",
  "partially-supported",
  "insufficient-evidence",
] as const) {
  test(`${code} review can advance and records the case only once`, () => {
    let state: InvestigationState = {
      ...createInitialInvestigationState(),
      stage: "evidence" as const,
      run: "case" as const,
      mindId: inference.mindId,
      evidenceCardIds: [...inference.evidenceCardIds],
    };
    const action = {
      type: "submit-review" as const,
      caseId: "second-start-line",
      inference,
      review: reviewFor(code),
    };
    state = investigationReducer(state, action);
    state = investigationReducer({ ...state, stage: "evidence" }, action);
    assert.equal(state.records.length, 1);

    state = investigationReducer(state, { type: "next" });
    assert.equal(state.stage, "reading");
    assert.equal(state.caseIndex, 1);
  });
}

test("summary language celebrates completion without score or attempt wording", () => {
  const text = summaryLanguage(6);
  assert.match(text, /6편/);
  assert.match(text, /다른 해석/);
  assert.doesNotMatch(text, /점수|정답|오답|시도|코드/);
});
