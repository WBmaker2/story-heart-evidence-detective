export interface UpdateHistoryEntry {
  date: string;
  version: string;
  kind: "개발" | "개선";
  summary: string;
}

export const updateHistory: readonly UpdateHistoryEntry[] = [
  {
    date: "2026-07-15",
    version: "1.0.0",
    kind: "개발",
    summary: "이야기 7편과 근거 기반 복수 해석 판정 자료를 처음 만들었어요.",
  },
];
