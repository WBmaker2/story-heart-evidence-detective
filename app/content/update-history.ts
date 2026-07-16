export interface UpdateHistoryEntry {
  date: string;
  version: string;
  kind: "개발" | "개선";
  summary: string;
}

export const updateHistory: readonly UpdateHistoryEntry[] = [
  {
    date: "2026-07-16",
    version: "1.1.8",
    kind: "개선",
    summary: "모바일 사건 이동과 문장 다시 읽기를 고치고, 쉬운 말과 자세한 활동 기록을 더했어요.",
  },
  {
    date: "2026-07-15",
    version: "1.1.7",
    kind: "개선",
    summary: "단계 수와 질문, 선택 안내를 서로 맞추고 모바일 이야기 화면의 큰 빈 공간을 고쳤어요.",
  },
  {
    date: "2026-07-15",
    version: "1.1.6",
    kind: "개선",
    summary: "결과 화면에서 고른 단서와 다른 생각의 관계를 헷갈리지 않도록 설명을 더 분명하게 바꿨어요.",
  },
  {
    date: "2026-07-15",
    version: "1.1.5",
    kind: "개선",
    summary: "인터넷에서 바로 이용할 수 있도록 GitHub Pages 자동 배포를 연결했어요.",
  },
  {
    date: "2026-07-15",
    version: "1.1.4",
    kind: "개선",
    summary: "수사 문장을 자연스럽게 다듬고 문장별 읽기와 워커 요청 점검을 더 정확하게 했어요.",
  },
  {
    date: "2026-07-15",
    version: "1.1.3",
    kind: "개선",
    summary: "사용하지 않는 저장소 예제를 걷어 내고 서버 쿠키와 워커 외부 요청 점검을 더 촘촘하게 했어요.",
  },
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
    summary: "읽기 방식 선택, 단서 연결, 여러 생각 살펴보기, 여섯 사건 기록 화면을 완성했어요.",
  },
  {
    date: "2026-07-15",
    version: "1.0.0",
    kind: "개발",
    summary: "이야기 7편과 근거 기반 복수 해석 판정 자료를 처음 만들었어요.",
  },
];
