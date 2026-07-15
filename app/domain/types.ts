export type EvidenceKind = "action" | "expression" | "dialogue";
export type MindKind = "feeling" | "thought-or-wish";
export type ReviewCode =
  | "supported"
  | "evidence-link-mismatch"
  | "partially-supported"
  | "insufficient-evidence";
export type CompletionIssueCode =
  | "mind-required"
  | "two-distinct-evidence-cards-required";

export interface MindDefinition {
  id: string;
  label: string;
  sentenceForm: string;
  kind: MindKind;
  studentFriendlyMeaning: string;
}

export interface StoryParagraph { id: string; text: string }
export interface TextAnchor {
  paragraphId: string;
  startOffset: number;
  endOffset: number;
  exactQuote: string;
}
export interface EvidenceCard { id: string; kind: EvidenceKind; anchor: TextAnchor }
export interface ExplanationDefinition {
  id: string;
  kind: "evidence-rationale" | "evidence-pair-summary" | "interpretation-summary";
  text: string;
}
export interface ReviewedEvidencePair {
  id: string;
  evidenceCardIds: readonly [string, string];
  evidenceRationaleIds: readonly [string, string];
  pairSummaryId: string;
}
export interface ReviewedReading {
  id: string;
  mindId: string;
  reviewedEvidencePairs: readonly [ReviewedEvidencePair, ReviewedEvidencePair, ...ReviewedEvidencePair[]];
  interpretationSummaryId: string;
}
export interface ReviewedContentRegistry {
  minds: readonly MindDefinition[];
  explanations: readonly ExplanationDefinition[];
  reviewChecklistIds: readonly string[];
  sceneAssetIds: readonly string[];
}
export interface OriginalityDeclaration {
  origin: "original-for-this-app";
  createdAt: string;
  externalSourceUrls: readonly [];
  reviewChecklistId: string;
}
export interface StoryCase {
  schemaVersion: 1;
  contentVersion: string;
  id: string;
  order: number;
  title: string;
  focusCharacterName: string;
  targetMoment: string;
  prompt: string;
  originality: OriginalityDeclaration;
  paragraphs:
    | readonly [StoryParagraph, StoryParagraph, StoryParagraph, StoryParagraph]
    | readonly [StoryParagraph, StoryParagraph, StoryParagraph, StoryParagraph, StoryParagraph]
    | readonly [StoryParagraph, StoryParagraph, StoryParagraph, StoryParagraph, StoryParagraph, StoryParagraph];
  sceneAssetId: string;
  candidateMindIds: readonly [string, string, string, string];
  evidenceCards: readonly EvidenceCard[];
  reviewedReadings:
    | readonly [ReviewedReading, ReviewedReading]
    | readonly [ReviewedReading, ReviewedReading, ReviewedReading];
}
export interface StoryBank {
  schemaVersion: 1;
  contentVersion: string;
  registry: ReviewedContentRegistry;
  tutorial: StoryCase;
  cases: readonly [StoryCase, StoryCase, StoryCase, StoryCase, StoryCase, StoryCase];
}
export interface InferenceDraft { mindId: string | null; evidenceCardIds: readonly string[] }
export interface CompletedInference { mindId: string; evidenceCardIds: readonly [string, string] }
export type CompletionResult =
  | { ok: true; inference: CompletedInference }
  | { ok: false; issue: CompletionIssueCode };
export interface ReadingPairMatch { readingId: string; evidencePairId: string }
export type InferenceReview =
  | { code: "supported" | "evidence-link-mismatch"; primaryMatch: ReadingPairMatch; allMatches: readonly [ReadingPairMatch, ...ReadingPairMatch[]]; rationaleIds: readonly [string, string, string] }
  | {
      code: "partially-supported";
      readingId: string;
      matchedEvidenceCardIds: readonly [string] | readonly [string, string];
      rationaleIds: readonly [string] | readonly [string, string];
    }
  | { code: "insufficient-evidence" };
export interface CaseRecord { caseId: string; inference: CompletedInference }
export interface SessionSummaryItem {
  caseId: string;
  title: string;
  mindId: string;
  evidenceCardIds: readonly [string, string];
  evidenceKinds: readonly EvidenceKind[];
  notices: readonly string[];
}
export interface ValidationIssue { caseId: string; rule: string; detail: string }
