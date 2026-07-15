import { createStory } from "../story-factory.ts";

export const waitingFlowerpotBundle = createStory({
  id: "waiting-flowerpot",
  order: 4,
  title: "기다리는 화분",
  focusCharacterName: "예준",
  targetMoment: "예준이가 두 화분을 살핀 뒤 관찰 날짜를 적는 바로 이때",
  paragraphs: [
    "창가에 예준이와 소라의 작은 화분이 나란히 놓여 있었습니다.",
    "소라의 화분에는 연두색 잎이 둘 나왔지만 예준이 화분은 흙만 보였습니다.",
    "예준이는 두 화분을 번갈아 보며 눈썹을 살짝 올렸습니다.",
    "흙 가까이 몸을 숙이고 작은 관찰표에 다음 날짜를 동그라미 쳤습니다.",
    "예준이는 “내일은 흙이 어떻게 달라질까?”라고 말하며 물뿌리개를 제자리에 놓았습니다.",
  ],
  candidateMindIds: ["hopeful", "curious", "disappointed", "happy"],
  evidence: [
    { kind: "action", paragraphIndex: 2, quote: "두 화분을 번갈아 보며" },
    { kind: "expression", paragraphIndex: 2, quote: "눈썹을 살짝 올렸습니다" },
    { kind: "action", paragraphIndex: 3, quote: "흙 가까이 몸을 숙이고" },
    { kind: "action", paragraphIndex: 3, quote: "다음 날짜를 동그라미 쳤습니다" },
    { kind: "dialogue", paragraphIndex: 4, quote: "내일은 흙이 어떻게 달라질까?" },
    { kind: "action", paragraphIndex: 4, quote: "물뿌리개를 제자리에 놓았습니다" },
  ],
  readings: [
    { mindId: "curious", summary: "자기 화분의 흙과 싹이 어떻게 달라질지 궁금했을 수 있어요.", pairs: [
      { evidenceIndexes: [0, 1], summary: "두 화분을 번갈아 보고 눈썹을 올린 모습이 차이를 살피는 마음과 이어져요." },
      { evidenceIndexes: [2, 4], summary: "흙 가까이 살펴보며 내일의 변화를 물은 점이 궁금한 마음을 보여요." },
    ] },
    { mindId: "disappointed", summary: "친구 화분과 달리 자기 화분에는 아직 잎이 없어 아쉬웠을 수 있어요.", pairs: [
      { evidenceIndexes: [0, 2], summary: "두 화분을 비교하고 자기 흙을 가까이 본 행동에서 아쉬움을 짐작할 수 있어요." },
      { evidenceIndexes: [1, 2], summary: "눈썹을 올리고 흙 가까이 몸을 숙인 모습이 아직 없는 싹을 살피는 모습이에요." },
    ] },
    { mindId: "hopeful", summary: "다음 관찰 때에는 자기 화분에도 변화가 생기기를 기대했을 수 있어요.", pairs: [
      { evidenceIndexes: [3, 4], summary: "다음 날짜를 표시하고 내일의 변화를 말한 점이 기다리는 마음과 이어져요." },
      { evidenceIndexes: [0, 3], summary: "두 화분을 살펴보고 다음 관찰 날짜를 정한 행동에서 변화를 기다리는 마음을 볼 수 있어요." },
    ] },
  ],
});

export const libraryBookmarkBundle = createStory({
  id: "library-bookmark",
  order: 5,
  title: "도서관 책갈피",
  focusCharacterName: "지호",
  targetMoment: "지호가 발견한 책갈피를 안전하게 보관하는 바로 이때",
  paragraphs: [
    "지호는 도서관 반납함의 책을 한 권씩 책상에 올렸습니다.",
    "초록 표지 책을 펼치자 손으로 그린 고래 책갈피가 바닥에 떨어졌습니다.",
    "지호는 눈을 조금 크게 뜨고 “누가 만든 걸까?”라고 말했습니다.",
    "책갈피의 구겨진 모서리를 펴서 투명 보관 봉투에 조심히 넣었습니다.",
    "봉투에 책 번호를 적으며 “주인이 찾으러 오면 바로 줄 수 있겠다.”라고 말했습니다.",
  ],
  candidateMindIds: ["worried", "help", "happy", "curious"],
  evidence: [
    { kind: "expression", paragraphIndex: 2, quote: "눈을 조금 크게 뜨고" },
    { kind: "dialogue", paragraphIndex: 2, quote: "누가 만든 걸까?" },
    { kind: "action", paragraphIndex: 3, quote: "구겨진 모서리를 펴서" },
    { kind: "action", paragraphIndex: 3, quote: "투명 보관 봉투에 조심히 넣었습니다" },
    { kind: "action", paragraphIndex: 4, quote: "봉투에 책 번호를 적으며" },
    { kind: "dialogue", paragraphIndex: 4, quote: "주인이 찾으러 오면 바로 줄 수 있겠다" },
  ],
  readings: [
    { mindId: "curious", summary: "고래 책갈피를 누가 만들었는지 궁금했을 수 있어요.", pairs: [
      { evidenceIndexes: [1, 2], summary: "만든 사람을 묻고 책갈피를 자세히 다룬 점이 궁금한 마음과 이어져요." },
      { evidenceIndexes: [1, 3], summary: "누가 만들었는지 말하며 책갈피를 보관한 점이 관심을 보여요." },
    ] },
    { mindId: "worried", summary: "책갈피를 잃어버린 주인이 찾고 있을까 걱정했을 수 있어요.", pairs: [
      { evidenceIndexes: [2, 3], summary: "구겨진 부분을 펴고 안전한 봉투에 넣은 행동이 물건을 걱정하는 마음과 이어져요." },
      { evidenceIndexes: [3, 5], summary: "안전하게 보관하고 주인이 올 때를 말한 점에서 주인을 생각했음을 알 수 있어요." },
    ] },
    { mindId: "help", summary: "책갈피 주인이 쉽게 되찾도록 도와주고 싶었을 수 있어요.", pairs: [
      { evidenceIndexes: [3, 4], summary: "봉투에 넣고 책 번호를 적은 행동은 주인을 찾는 데 도움을 주려는 모습이에요." },
      { evidenceIndexes: [4, 5], summary: "책 번호를 적으며 바로 돌려줄 수 있다고 말한 점이 돕고 싶은 마음과 이어져요." },
    ] },
  ],
});

export const quietApplauseBundle = createStory({
  id: "quiet-applause",
  order: 6,
  title: "조용한 박수",
  focusCharacterName: "나린",
  targetMoment: "발표가 끝나고 나린이가 발표자가 고른 방법으로 축하하는 바로 이때",
  paragraphs: [
    "발표 전 민재는 큰 소리 대신 손 흔들기로 축하받고 싶다고 말했습니다.",
    "민재는 종이 다리 실험에서 다리가 무너지지 않은 까닭을 설명했습니다.",
    "발표가 끝나자 나린이는 두 손을 어깨 높이에서 천천히 흔들었습니다.",
    "눈을 반달처럼 접고 민재 쪽으로 몸을 돌렸습니다.",
    "나린이는 “종이를 여러 겹 접은 부분이 기억에 남았어.”라고 또렷하게 말했습니다.",
  ],
  candidateMindIds: ["respect", "happy", "support", "curious"],
  evidence: [
    { kind: "dialogue", paragraphIndex: 0, quote: "손 흔들기로 축하받고 싶다고 말했습니다" },
    { kind: "action", paragraphIndex: 2, quote: "두 손을 어깨 높이에서 천천히 흔들었습니다" },
    { kind: "expression", paragraphIndex: 3, quote: "눈을 반달처럼 접고" },
    { kind: "action", paragraphIndex: 3, quote: "민재 쪽으로 몸을 돌렸습니다" },
    { kind: "dialogue", paragraphIndex: 4, quote: "종이를 여러 겹 접은 부분이 기억에 남았어" },
    { kind: "dialogue", paragraphIndex: 4, quote: "또렷하게 말했습니다" },
  ],
  readings: [
    { mindId: "happy", summary: "민재의 발표를 재미있고 인상 깊게 보아 기뻤을 수 있어요.", pairs: [
      { evidenceIndexes: [2, 4], summary: "밝은 표정과 기억에 남은 내용을 말한 점에서 발표를 반긴 마음이 보여요." },
      { evidenceIndexes: [1, 2], summary: "축하 손짓과 밝은 표정을 함께 보면 기쁜 마음을 짐작할 수 있어요." },
    ] },
    { mindId: "support", summary: "발표를 마친 민재에게 힘을 보내며 응원하고 싶었을 수 있어요.", pairs: [
      { evidenceIndexes: [1, 3], summary: "민재가 고른 축하 동작을 하며 몸을 돌린 행동이 응원과 이어져요." },
      { evidenceIndexes: [3, 4], summary: "민재를 향해 몸을 돌리고 기억에 남은 점을 말한 모습이 힘을 보태요." },
    ] },
    { mindId: "respect", summary: "민재가 부탁한 축하 방법을 소중히 따르고 싶었을 수 있어요.", pairs: [
      { evidenceIndexes: [0, 1], summary: "민재가 손 흔들기를 부탁했고 나린이가 그대로 행동한 점이 선택을 존중하는 모습이에요." },
      { evidenceIndexes: [1, 4], summary: "원한 방식으로 축하하고 발표 내용을 말한 점이 민재의 선택을 살핀 행동이에요." },
    ] },
  ],
});
