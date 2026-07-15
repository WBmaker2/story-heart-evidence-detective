import { ContentDomainError } from "./errors.ts";
import type { StoryCase } from "./types.ts";

export function deriveEvidenceQuote(caseData: StoryCase, evidenceId: string) {
  const card = caseData.evidenceCards.find((item) => item.id === evidenceId);
  if (!card) throw new ContentDomainError("unknown-evidence-id", caseData.id, evidenceId);
  const paragraphIndex = caseData.paragraphs.findIndex((item) => item.id === card.anchor.paragraphId);
  if (paragraphIndex < 0) {
    throw new ContentDomainError("invalid-content-reference", caseData.id, card.anchor.paragraphId);
  }
  const paragraph = caseData.paragraphs[paragraphIndex];
  const quote = paragraph.text.slice(card.anchor.startOffset, card.anchor.endOffset);
  if (quote !== card.anchor.exactQuote) {
    throw new ContentDomainError("invalid-content-reference", caseData.id, card.id);
  }
  return { quote, paragraphNumber: paragraphIndex + 1, kind: card.kind } as const;
}

export function canonicalizeEvidencePair(ids: readonly string[], caseData: StoryCase): [string, string] {
  if (ids.length !== 2 || ids[0] === ids[1]) {
    throw new ContentDomainError("invalid-content-reference", caseData.id, ids.join(","));
  }
  const indexes = ids.map((id) => caseData.evidenceCards.findIndex((card) => card.id === id));
  const unknownIndex = indexes.findIndex((index) => index < 0);
  if (unknownIndex >= 0) {
    throw new ContentDomainError("unknown-evidence-id", caseData.id, ids[unknownIndex]);
  }
  return indexes[0] < indexes[1] ? [ids[0], ids[1]] : [ids[1], ids[0]];
}
