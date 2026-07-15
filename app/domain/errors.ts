export type ContentDomainErrorCode =
  | "unknown-mind-id"
  | "unknown-evidence-id"
  | "invalid-content-reference";

export class ContentDomainError extends Error {
  override readonly name = "ContentDomainError";
  readonly code: ContentDomainErrorCode;
  readonly caseId: string;
  readonly referenceId: string;

  constructor(
    code: ContentDomainErrorCode,
    caseId: string,
    referenceId: string,
  ) {
    super(`학습 자료 오류: ${caseId}에서 ${referenceId} 참조를 확인해 주세요. (${code})`);
    this.code = code;
    this.caseId = caseId;
    this.referenceId = referenceId;
  }
}
