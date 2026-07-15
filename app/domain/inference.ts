import { canonicalizeEvidencePair, deriveEvidenceQuote } from "./evidence.ts";
import { ContentDomainError } from "./errors.ts";
import type {
  CompletedInference,
  CompletionResult,
  InferenceDraft,
  InferenceReview,
  ReadingPairMatch,
  ReviewedContentRegistry,
  ReviewedEvidencePair,
  ReviewedReading,
  StoryCase,
} from "./types.ts";

const samePair = (left: readonly string[], right: readonly string[]) =>
  left[0] === right[0] && left[1] === right[1];

function requireMind(caseData: StoryCase, mindId: string) {
  if (!caseData.candidateMindIds.includes(mindId)) {
    throw new ContentDomainError("unknown-mind-id", caseData.id, mindId);
  }
}

export function deriveReviewedMindIds(caseData: StoryCase): string[] {
  return [...new Set(caseData.reviewedReadings.map((reading) => reading.mindId))];
}

export function getReviewedEvidencePairsForMind(caseData: StoryCase, mindId: string) {
  requireMind(caseData, mindId);
  return caseData.reviewedReadings.find((reading) => reading.mindId === mindId)?.reviewedEvidencePairs ?? [];
}

export function completeInference(draft: InferenceDraft, caseData: StoryCase): CompletionResult {
  if (draft.mindId === null) return { ok: false, issue: "mind-required" };
  requireMind(caseData, draft.mindId);
  for (const evidenceId of draft.evidenceCardIds) {
    if (!caseData.evidenceCards.some((card) => card.id === evidenceId)) {
      throw new ContentDomainError("unknown-evidence-id", caseData.id, evidenceId);
    }
  }
  if (draft.evidenceCardIds.length !== 2 || draft.evidenceCardIds[0] === draft.evidenceCardIds[1]) {
    return { ok: false, issue: "two-distinct-evidence-cards-required" };
  }
  return {
    ok: true,
    inference: {
      mindId: draft.mindId,
      evidenceCardIds: canonicalizeEvidencePair(draft.evidenceCardIds, caseData),
    },
  };
}

function exactMatches(pair: readonly [string, string], caseData: StoryCase) {
  const matches: Array<{ reading: ReviewedReading; evidencePair: ReviewedEvidencePair }> = [];
  for (const reading of caseData.reviewedReadings) {
    for (const evidencePair of reading.reviewedEvidencePairs) {
      if (samePair(pair, evidencePair.evidenceCardIds)) matches.push({ reading, evidencePair });
    }
  }
  return matches;
}

function matchPayload(
  code: "supported" | "evidence-link-mismatch",
  matches: Array<{ reading: ReviewedReading; evidencePair: ReviewedEvidencePair }>,
): InferenceReview {
  const allMatches = matches.map<ReadingPairMatch>(({ reading, evidencePair }) => ({
    readingId: reading.id,
    evidencePairId: evidencePair.id,
  })) as [ReadingPairMatch, ...ReadingPairMatch[]];
  const pair = matches[0].evidencePair;
  return {
    code,
    primaryMatch: allMatches[0],
    allMatches,
    rationaleIds: [pair.evidenceRationaleIds[0], pair.evidenceRationaleIds[1], pair.pairSummaryId],
  };
}

export function reviewInference(
  inference: CompletedInference,
  caseData: StoryCase,
  registry: ReviewedContentRegistry,
): InferenceReview {
  requireMind(caseData, inference.mindId);
  const pair = canonicalizeEvidencePair(inference.evidenceCardIds, caseData);
  const matches = exactMatches(pair, caseData);
  const selectedMatches = matches.filter(({ reading }) => reading.mindId === inference.mindId);
  if (selectedMatches.length) {
    const selectedReadingIds = new Set(selectedMatches.map(({ reading }) => reading.id));
    const orderedMatches = [
      ...selectedMatches,
      ...matches.filter(({ reading }) => !selectedReadingIds.has(reading.id)),
    ];
    return validateRationales(matchPayload("supported", orderedMatches), caseData, registry);
  }
  if (matches.length) return validateRationales(matchPayload("evidence-link-mismatch", matches), caseData, registry);

  const reading = caseData.reviewedReadings.find((item) => item.mindId === inference.mindId);
  if (reading) {
    const overlaps = pair.flatMap((evidenceCardId) => {
      const evidencePair = reading.reviewedEvidencePairs.find((item) =>
        item.evidenceCardIds.includes(evidenceCardId),
      );
      if (!evidencePair) return [];
      const index = evidencePair.evidenceCardIds.indexOf(evidenceCardId);
      const rationaleId = evidencePair.evidenceRationaleIds[index];
      if (!registry.explanations.some((item) => item.id === rationaleId && item.kind === "evidence-rationale")) {
        throw new ContentDomainError("invalid-content-reference", caseData.id, rationaleId);
      }
      return [{ evidenceCardId, rationaleId }];
    });
    if (overlaps.length) {
      return {
        code: "partially-supported",
        readingId: reading.id,
        matchedEvidenceCardIds: overlaps.map((item) => item.evidenceCardId) as [string] | [string, string],
        rationaleIds: overlaps.map((item) => item.rationaleId) as [string] | [string, string],
      };
    }
  }
  return { code: "insufficient-evidence" };
}

function validateRationales(review: InferenceReview, caseData: StoryCase, registry: ReviewedContentRegistry) {
  if (review.code !== "supported" && review.code !== "evidence-link-mismatch") return review;
  const expectedKinds = ["evidence-rationale", "evidence-rationale", "evidence-pair-summary"];
  review.rationaleIds.forEach((id, index) => {
    if (!registry.explanations.some((item) => item.id === id && item.kind === expectedKinds[index])) {
      throw new ContentDomainError("invalid-content-reference", caseData.id, id);
    }
  });
  return review;
}

export function buildInvestigationOpening(
  focusCharacterName: string,
  sentenceForm: string,
) {
  return `나는 ${focusCharacterName}의 마음이 ${sentenceForm} 수 있다고 생각해요.`;
}

export function buildInvestigationSentence(
  inference: CompletedInference,
  caseData: StoryCase,
  registry: ReviewedContentRegistry,
) {
  requireMind(caseData, inference.mindId);
  const mind = registry.minds.find((item) => item.id === inference.mindId);
  if (!mind) throw new ContentDomainError("invalid-content-reference", caseData.id, inference.mindId);
  const [firstId, secondId] = canonicalizeEvidencePair(inference.evidenceCardIds, caseData);
  const first = deriveEvidenceQuote(caseData, firstId).quote;
  const second = deriveEvidenceQuote(caseData, secondId).quote;
  return `${buildInvestigationOpening(caseData.focusCharacterName, mind.sentenceForm)} “${first}”, “${second}” 두 가지가 단서예요.`;
}

export function getAlternativeReading(
  inference: CompletedInference,
  review: InferenceReview,
  caseData: StoryCase,
) {
  if (review.code === "evidence-link-mismatch") {
    return caseData.reviewedReadings.find((reading) => reading.id === review.primaryMatch.readingId) ?? null;
  }
  return caseData.reviewedReadings.find((reading) => reading.mindId !== inference.mindId) ?? null;
}
