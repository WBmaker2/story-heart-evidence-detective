export interface UpdateHistoryEntry {
  date: string;
  version: string;
  kind: "개발" | "개선";
  summary: string;
}

export const updateHistory: readonly UpdateHistoryEntry[] = [
  {
    date: "2026-07-15",
    version: "1.1.2",
    kind: "개선",
    summary: "개인정보·표현·파일 길이·접근성 계약을 확인하는 출시 전 자동 점검을 보강했어요.",
  },
  {
    date: "2026-07-15",
    version: "1.1.1",
    kind: "개선",
    summary: "인용 문장 읽기, 단계 이동 초점, 모바일 머리말 터치 영역을 더 편하게 다듬었어요.",
  },
  {
    date: "2026-07-15",
    version: "1.1.0",
    kind: "개선",
    summary: "읽기 방식 선택, 단서 연결, 여러 해석 검토, 여섯 사건 기록 화면을 완성했어요.",
  },
  {
    date: "2026-07-15",
    version: "1.0.0",
    kind: "개발",
    summary: "이야기 7편과 근거 기반 복수 해석 판정 자료를 처음 만들었어요.",
  },
];
