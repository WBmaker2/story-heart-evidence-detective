import { canonicalizeEvidencePair } from "./evidence.ts";
import { ContentDomainError } from "./errors.ts";
import type { CaseRecord, EvidenceKind, SessionSummaryItem, StoryBank } from "./types.ts";

const kindNotices: Record<EvidenceKind, string> = {
  action: "행동 단서를 찾아봄",
  expression: "표정 단서를 살펴봄",
  dialogue: "대사 단서를 연결함",
};

export function deriveSessionSummary(records: readonly CaseRecord[], bank: StoryBank): SessionSummaryItem[] {
  return records.map((record) => {
    const caseData = bank.cases.find((item) => item.id === record.caseId);
    if (!caseData) throw new ContentDomainError("invalid-content-reference", record.caseId, record.caseId);
    if (!caseData.candidateMindIds.includes(record.inference.mindId)) {
      throw new ContentDomainError("unknown-mind-id", caseData.id, record.inference.mindId);
    }
    const evidenceCardIds = canonicalizeEvidencePair(record.inference.evidenceCardIds, caseData);
    const evidenceKinds = [...new Set(evidenceCardIds.map((id) =>
      caseData.evidenceCards.find((card) => card.id === id)!.kind,
    ))];
    return {
      caseId: caseData.id,
      title: caseData.title,
      mindId: record.inference.mindId,
      evidenceCardIds,
      evidenceKinds,
      notices: [...evidenceKinds.map((kind) => kindNotices[kind]), "다른 해석을 확인함"],
    };
  });
}
