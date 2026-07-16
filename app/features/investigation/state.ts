import type {
  CaseRecord,
  CompletedInference,
  InferenceReview,
} from "../../domain/types.ts";

export type InvestigationStage =
  | "start"
  | "reading"
  | "mind"
  | "evidence"
  | "review"
  | "summary";
export type InvestigationRun = "tutorial" | "case" | null;
export type ReadingMode = "all" | "sentence";
export type InvestigationNotice = "max-two-evidence" | null;

export interface InvestigationState {
  stage: InvestigationStage;
  run: InvestigationRun;
  caseIndex: number;
  readingMode: ReadingMode;
  sentenceIndex: number;
  mindId: string | null;
  evidenceCardIds: string[];
  notice: InvestigationNotice;
  review: InferenceReview | null;
  records: CaseRecord[];
}

export type InvestigationAction =
  | { type: "start-tutorial" }
  | { type: "skip-tutorial" }
  | { type: "continue" }
  | { type: "choose-mind"; mindId: string }
  | { type: "edit-mind" }
  | { type: "toggle-evidence"; evidenceId: string }
  | {
      type: "submit-review";
      caseId: string;
      inference: CompletedInference;
      review: InferenceReview;
    }
  | { type: "revise" }
  | { type: "next" }
  | { type: "set-reading-mode"; mode: ReadingMode }
  | { type: "previous-sentence" }
  | { type: "next-sentence"; finalIndex: number }
  | { type: "reset" };

export function createInitialInvestigationState(): InvestigationState {
  return {
    stage: "start",
    run: null,
    caseIndex: 0,
    readingMode: "all",
    sentenceIndex: 0,
    mindId: null,
    evidenceCardIds: [],
    notice: null,
    review: null,
    records: [],
  };
}

function beginCase(
  state: InvestigationState,
  run: Exclude<InvestigationRun, null>,
  caseIndex: number,
): InvestigationState {
  return {
    ...state,
    stage: "reading",
    run,
    caseIndex,
    sentenceIndex: 0,
    mindId: null,
    evidenceCardIds: [],
    notice: null,
    review: null,
  };
}

function upsertRecord(records: CaseRecord[], next: CaseRecord) {
  const index = records.findIndex((record) => record.caseId === next.caseId);
  if (index < 0) return [...records, next];
  return records.map((record, recordIndex) => (recordIndex === index ? next : record));
}

export function investigationReducer(
  state: InvestigationState,
  action: InvestigationAction,
): InvestigationState {
  switch (action.type) {
    case "start-tutorial":
      return beginCase(state, "tutorial", 0);
    case "skip-tutorial":
      return beginCase(state, "case", 0);
    case "continue":
      if (state.stage === "reading") return { ...state, stage: "mind" };
      if (state.stage === "mind" && state.mindId) return { ...state, stage: "evidence" };
      return state;
    case "choose-mind":
      return { ...state, mindId: action.mindId };
    case "edit-mind":
      return { ...state, stage: "mind", notice: null };
    case "toggle-evidence": {
      if (state.evidenceCardIds.includes(action.evidenceId)) {
        return {
          ...state,
          evidenceCardIds: state.evidenceCardIds.filter((id) => id !== action.evidenceId),
          notice: null,
        };
      }
      if (state.evidenceCardIds.length >= 2) {
        return { ...state, notice: "max-two-evidence" };
      }
      return {
        ...state,
        evidenceCardIds: [...state.evidenceCardIds, action.evidenceId],
        notice: null,
      };
    }
    case "submit-review":
      if (state.stage !== "evidence") return state;
      return {
        ...state,
        stage: "review",
        review: action.review,
        records:
          state.run === "case"
            ? upsertRecord(state.records, {
                caseId: action.caseId,
                inference: action.inference,
              })
            : state.records,
      };
    case "revise":
      return state.stage === "review"
        ? { ...state, stage: "evidence", review: null, notice: null }
        : state;
    case "next":
      if (state.stage !== "review") return state;
      if (state.run === "tutorial") return beginCase(state, "case", 0);
      if (state.caseIndex >= 5) return { ...state, stage: "summary", review: null };
      return beginCase(state, "case", state.caseIndex + 1);
    case "set-reading-mode":
      return { ...state, readingMode: action.mode, sentenceIndex: 0 };
    case "previous-sentence":
      return {
        ...state,
        sentenceIndex: Math.max(state.sentenceIndex - 1, 0),
      };
    case "next-sentence":
      return {
        ...state,
        sentenceIndex: Math.min(state.sentenceIndex + 1, action.finalIndex),
      };
    case "reset":
      return createInitialInvestigationState();
  }
}

export function summaryLanguage(completedCount: number) {
  return `${completedCount}편의 이야기를 살펴보고, 단서를 모아 다른 생각도 확인했어요.`;
}
