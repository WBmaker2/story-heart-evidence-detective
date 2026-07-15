import assert from "node:assert/strict";
import test from "node:test";

import { storyBank } from "../../app/content/story-bank.ts";
import { deriveEvidenceQuote } from "../../app/domain/evidence.ts";
import { deriveSessionSummary } from "../../app/domain/session.ts";

test("deriveEvidenceQuote reads the exact paragraph slice", () => {
  const caseData = storyBank.tutorial;
  const card = caseData.evidenceCards[0];
  const quote = deriveEvidenceQuote(caseData, card.id);
  assert.equal(quote.quote, card.anchor.exactQuote);
  assert.equal(
    quote.paragraphNumber,
    caseData.paragraphs.findIndex((paragraph) => paragraph.id === card.anchor.paragraphId) + 1,
  );
});

test("session summary is scoreless and validates records", () => {
  const caseData = storyBank.cases[0];
  const reading = caseData.reviewedReadings[0];
  const summary = deriveSessionSummary(
    [{ caseId: caseData.id, inference: { mindId: reading.mindId, evidenceCardIds: reading.reviewedEvidencePairs[0].evidenceCardIds } }],
    storyBank,
  );
  assert.equal(summary.length, 1);
  assert.equal(summary[0].title, caseData.title);
  assert.deepEqual(summary[0].evidenceKinds, ["action", "dialogue"]);
  assert.equal("score" in summary[0], false);
  assert.equal("reviewCode" in summary[0], false);
  assert.equal("attempts" in summary[0], false);
});
