import assert from "node:assert/strict";
import test from "node:test";

import { storyBank } from "../../app/content/story-bank.ts";
import { ContentDomainError } from "../../app/domain/errors.ts";
import {
  buildInvestigationSentence,
  completeInference,
  getAlternativeReading,
  reviewInference,
} from "../../app/domain/inference.ts";

const caseData = storyBank.cases[0];

test("completeInference reports incomplete choices without reviewing", () => {
  assert.deepEqual(
    completeInference({ mindId: null, evidenceCardIds: [] }, caseData),
    { ok: false, issue: "mind-required" },
  );
  assert.deepEqual(
    completeInference(
      { mindId: caseData.candidateMindIds[0], evidenceCardIds: [caseData.evidenceCards[0].id] },
      caseData,
    ),
    { ok: false, issue: "two-distinct-evidence-cards-required" },
  );
  assert.deepEqual(
    completeInference(
      {
        mindId: caseData.candidateMindIds[0],
        evidenceCardIds: [caseData.evidenceCards[0].id, caseData.evidenceCards[0].id],
      },
      caseData,
    ),
    { ok: false, issue: "two-distinct-evidence-cards-required" },
  );
});

test("review precedence returns all four deterministic codes", () => {
  const firstReading = caseData.reviewedReadings[0];
  const secondReading = caseData.reviewedReadings[1];
  const supportedPair = firstReading.reviewedEvidencePairs[1].evidenceCardIds;
  const mismatchPair = secondReading.reviewedEvidencePairs[1].evidenceCardIds;

  const supported = reviewInference(
    { mindId: firstReading.mindId, evidenceCardIds: supportedPair },
    caseData,
    storyBank.registry,
  );
  assert.equal(supported.code, "supported");

  const shared = reviewInference(
    {
      mindId: firstReading.mindId,
      evidenceCardIds: firstReading.reviewedEvidencePairs[0].evidenceCardIds,
    },
    caseData,
    storyBank.registry,
  );
  assert.equal(shared.code, "supported");
  if (shared.code === "supported") {
    assert.equal(shared.primaryMatch.readingId, firstReading.id);
    assert.equal(shared.allMatches.length, 3);
  }

  const mismatch = reviewInference(
    { mindId: firstReading.mindId, evidenceCardIds: mismatchPair },
    caseData,
    storyBank.registry,
  );
  assert.equal(mismatch.code, "evidence-link-mismatch");
  assert.equal(getAlternativeReading({ mindId: firstReading.mindId, evidenceCardIds: mismatchPair }, mismatch, caseData)?.id, secondReading.id);

  const partial = reviewInference(
    {
      mindId: firstReading.mindId,
      evidenceCardIds: [supportedPair[0], caseData.evidenceCards[5].id],
    },
    caseData,
    storyBank.registry,
  );
  assert.equal(partial.code, "partially-supported");

  const insufficient = reviewInference(
    {
      mindId: caseData.candidateMindIds[3],
      evidenceCardIds: [caseData.evidenceCards[4].id, caseData.evidenceCards[5].id],
    },
    caseData,
    storyBank.registry,
  );
  assert.equal(insufficient.code, "insufficient-evidence");
});

test("student evidence order does not change review or sentence order", () => {
  const reading = caseData.reviewedReadings[0];
  const pair = reading.reviewedEvidencePairs[1].evidenceCardIds;
  const forward = { mindId: reading.mindId, evidenceCardIds: pair } as const;
  const reversed = { mindId: reading.mindId, evidenceCardIds: [pair[1], pair[0]] } as const;

  assert.deepEqual(
    reviewInference(forward, caseData, storyBank.registry),
    reviewInference(reversed, caseData, storyBank.registry),
  );
  assert.equal(
    buildInvestigationSentence(forward, caseData, storyBank.registry),
    buildInvestigationSentence(reversed, caseData, storyBank.registry),
  );
});

test("investigation sentence joins quoted clues without a hard-coded particle", () => {
  const reading = caseData.reviewedReadings[0];
  const pair = reading.reviewedEvidencePairs[0].evidenceCardIds;
  const sentence = buildInvestigationSentence(
    { mindId: reading.mindId, evidenceCardIds: pair },
    caseData,
    storyBank.registry,
  );

  assert.match(sentence, /” 두 가지가 단서예요\.$/u);
  assert.doesNotMatch(sentence, /”과 “/u);
});

for (const focusCharacterName of ["지호", "민준"]) {
  test(`investigation sentence stays particle-neutral for ${focusCharacterName}`, () => {
    const reading = caseData.reviewedReadings[0];
    const pair = reading.reviewedEvidencePairs[0].evidenceCardIds;
    const sentence = buildInvestigationSentence(
      { mindId: reading.mindId, evidenceCardIds: pair },
      { ...caseData, focusCharacterName },
      storyBank.registry,
    );

    assert.match(sentence, new RegExp(`^나는 ${focusCharacterName}의 마음이 `, "u"));
    assert.doesNotMatch(sentence, new RegExp(`${focusCharacterName}이 `, "u"));
  });
}

test("two different evidence cards of the same kind can be completed", () => {
  const sameKindCards = caseData.evidenceCards.filter((card) => card.kind === "action");
  assert.ok(sameKindCards.length >= 2);
  const result = completeInference(
    {
      mindId: caseData.candidateMindIds[0],
      evidenceCardIds: [sameKindCards[0].id, sameKindCards[1].id],
    },
    caseData,
  );
  assert.equal(result.ok, true);
});

test("unknown mind and evidence references throw named domain errors", () => {
  for (const draft of [
    { mindId: "unknown-mind", evidenceCardIds: [caseData.evidenceCards[0].id, caseData.evidenceCards[1].id] },
    { mindId: caseData.candidateMindIds[0], evidenceCardIds: [caseData.evidenceCards[0].id, "unknown-evidence"] },
  ]) {
    assert.throws(
      () => completeInference(draft, caseData),
      (error: unknown) => error instanceof ContentDomainError && error.name === "ContentDomainError",
    );
  }
});
