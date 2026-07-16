import { canonicalizeEvidencePair } from "./evidence.ts";
import { ContentDomainError } from "./errors.ts";
import { getAlternativeReading, reviewInference } from "./inference.ts";
import type { CaseRecord, EvidenceKind, SessionSummaryItem, StoryBank } from "./types.ts";

const kindNotices: Record<EvidenceKind, string> = {
  action: "행동 단서를 찾아봄",
  expression: "표정 단서를 살펴봄",
  dialogue: "한 말 단서를 연결함",
};

export function deriveSessionSummary(records: readonly CaseRecord[], bank: StoryBank): SessionSummaryItem[] {
  return records.map((record) => {
    const caseData = bank.cases.find((item) => item.id === record.caseId);
    if (!caseData) throw new ContentDomainError("invalid-content-reference", record.caseId, record.caseId);
    if (!caseData.candidateMindIds.includes(record.inference.mindId)) {
      throw new ContentDomainError("unknown-mind-id", caseData.id, record.inference.mindId);
    }
    const mind = bank.registry.minds.find((item) => item.id === record.inference.mindId)!;
    const evidenceCardIds = canonicalizeEvidencePair(record.inference.evidenceCardIds, caseData);
    const evidenceCards = evidenceCardIds.map((id) =>
      caseData.evidenceCards.find((card) => card.id === id)!,
    );
    const evidenceKinds = [...new Set(evidenceCardIds.map((id) =>
      caseData.evidenceCards.find((card) => card.id === id)!.kind,
    ))];
    const review = reviewInference(record.inference, caseData, bank.registry);
    const alternative = getAlternativeReading(record.inference, review, caseData)
      ?? caseData.reviewedReadings.find((reading) => reading.mindId !== mind.id)
      ?? caseData.reviewedReadings[0];
    const alternativeMind = bank.registry.minds.find((item) => item.id === alternative.mindId)!;
    const alternativeSummary = bank.registry.explanations.find(
      (item) => item.id === alternative.interpretationSummaryId,
    )!;
    return {
      caseId: caseData.id,
      title: caseData.title,
      mindId: record.inference.mindId,
      mindLabel: mind.label,
      evidenceCardIds,
      evidenceQuotes: [evidenceCards[0].anchor.exactQuote, evidenceCards[1].anchor.exactQuote],
      evidenceKinds,
      alternativeMindLabel: alternativeMind.label,
      alternativeSummary: alternativeSummary.text,
      notices: [...evidenceKinds.map((kind) => kindNotices[kind]), "다른 생각을 확인함"],
    };
  });
}
