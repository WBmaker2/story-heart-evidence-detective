import { ContentDomainError } from "../domain/errors.ts";
import type {
  EvidenceKind,
  ExplanationDefinition,
  ReviewedEvidencePair,
  ReviewedReading,
  StoryCase,
  StoryParagraph,
} from "../domain/types.ts";

interface RawEvidence { kind: EvidenceKind; paragraphIndex: number; quote: string }
interface RawPair { evidenceIndexes: readonly [number, number]; summary: string }
interface RawReading { mindId: string; summary: string; pairs: readonly [RawPair, RawPair, ...RawPair[]] }
export interface RawStory {
  id: string;
  order: number;
  title: string;
  focusCharacterName: string;
  targetMoment: string;
  prompt?: string;
  paragraphs: readonly [string, string, string, string, string?, string?];
  candidateMindIds: readonly [string, string, string, string];
  evidence: readonly [RawEvidence, RawEvidence, RawEvidence, RawEvidence, RawEvidence, RawEvidence?];
  readings: readonly [RawReading, RawReading] | readonly [RawReading, RawReading, RawReading];
}
export interface StoryBundle { story: StoryCase; explanations: ExplanationDefinition[] }

const CONTENT_VERSION = "1.0.0";
const REVIEW_CHECKLIST_ID = "editorial-draft-checklist-v1";

export function createStory(raw: RawStory): StoryBundle {
  const paragraphs = raw.paragraphs.filter((text): text is string => Boolean(text)).map<StoryParagraph>(
    (text, index) => ({ id: `${raw.id}-paragraph-${index + 1}`, text }),
  );
  const evidenceCards = raw.evidence.filter((item): item is RawEvidence => Boolean(item)).map((item, index) => {
    const paragraph = paragraphs[item.paragraphIndex];
    if (!paragraph) throw new ContentDomainError("invalid-content-reference", raw.id, `paragraph-${item.paragraphIndex}`);
    const startOffset = paragraph.text.indexOf(item.quote);
    if (startOffset < 0) throw new ContentDomainError("invalid-content-reference", raw.id, item.quote);
    return {
      id: `${raw.id}-evidence-${index + 1}`,
      kind: item.kind,
      anchor: {
        paragraphId: paragraph.id,
        startOffset,
        endOffset: startOffset + item.quote.length,
        exactQuote: item.quote,
      },
    };
  });
  const explanations: ExplanationDefinition[] = [];
  const reviewedReadings = raw.readings.filter((item): item is RawReading => Boolean(item)).map<ReviewedReading>(
    (reading, readingIndex) => {
      const readingId = `${raw.id}-reading-${readingIndex + 1}`;
      const interpretationSummaryId = `${readingId}-summary`;
      explanations.push({ id: interpretationSummaryId, kind: "interpretation-summary", text: reading.summary });
      const pairs = reading.pairs.map<ReviewedEvidencePair>((pair, pairIndex) => {
        const pairId = `${raw.id}-pair-${readingIndex + 1}-${pairIndex + 1}`;
        const [firstIndex, secondIndex] = pair.evidenceIndexes;
        const first = evidenceCards[firstIndex];
        const second = evidenceCards[secondIndex];
        if (!first || !second) throw new ContentDomainError("invalid-content-reference", raw.id, pairId);
        const firstRationaleId = `${pairId}-rationale-1`;
        const secondRationaleId = `${pairId}-rationale-2`;
        const pairSummaryId = `${pairId}-summary`;
        explanations.push(
          { id: firstRationaleId, kind: "evidence-rationale", text: `“${first.anchor.exactQuote}”는 마음을 짐작하는 데 도움이 되는 단서예요.` },
          { id: secondRationaleId, kind: "evidence-rationale", text: `“${second.anchor.exactQuote}”는 마음을 짐작하는 데 도움이 되는 단서예요.` },
          { id: pairSummaryId, kind: "evidence-pair-summary", text: pair.summary },
        );
        return {
          id: pairId,
          evidenceCardIds: [first.id, second.id],
          evidenceRationaleIds: [firstRationaleId, secondRationaleId],
          pairSummaryId,
        };
      }) as [ReviewedEvidencePair, ReviewedEvidencePair, ...ReviewedEvidencePair[]];
      return { id: readingId, mindId: reading.mindId, reviewedEvidencePairs: pairs, interpretationSummaryId };
    },
  ) as [ReviewedReading, ReviewedReading] | [ReviewedReading, ReviewedReading, ReviewedReading];
  return {
    story: {
      schemaVersion: 1,
      contentVersion: CONTENT_VERSION,
      id: raw.id,
      order: raw.order,
      title: raw.title,
      focusCharacterName: raw.focusCharacterName,
      targetMoment: raw.targetMoment,
      prompt: raw.prompt ?? `${raw.focusCharacterName}의 마음이나 생각을 두 단서로 짐작해 보세요.`,
      originality: {
        origin: "original-for-this-app",
        createdAt: "2026-07-15",
        externalSourceUrls: [],
        reviewChecklistId: REVIEW_CHECKLIST_ID,
      },
      paragraphs: paragraphs as unknown as StoryCase["paragraphs"],
      sceneAssetId: `scene-${raw.id}`,
      candidateMindIds: raw.candidateMindIds,
      evidenceCards,
      reviewedReadings,
    },
    explanations,
  };
}

export const contentRegistryIds = {
  reviewChecklistId: REVIEW_CHECKLIST_ID,
  contentVersion: CONTENT_VERSION,
} as const;
