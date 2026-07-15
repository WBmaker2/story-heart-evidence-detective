import { createStory } from "../story-factory.ts";

export const tutorialBundle = createStory({
  id: "tutorial-wet-invitation",
  order: 0,
  title: "젖은 초대장",
  focusCharacterName: "다온",
  targetMoment: "다온이가 초대장을 물에서 건져 책상에 펼친 바로 이때",
  paragraphs: [
    "다온이는 종이 초대장에 작은 별과 구름을 정성껏 그렸습니다.",
    "창가로 빗물이 들어와 초대장 한쪽이 흠뻑 젖었습니다.",
    "다온이는 초대장을 얼른 건져 마른 수건 위에 펼쳤습니다.",
    "입술을 꼭 다문 채 번진 글씨를 한 줄씩 살폈습니다.",
    "다온이는 “친구가 날짜를 알아볼 수 있어야 할 텐데.”라고 말하며 선풍기를 약하게 켰습니다.",
  ],
  candidateMindIds: ["upset", "worried", "help", "happy"],
  evidence: [
    { kind: "action", paragraphIndex: 2, quote: "초대장을 얼른 건져" },
    { kind: "expression", paragraphIndex: 3, quote: "입술을 꼭 다문 채" },
    { kind: "action", paragraphIndex: 3, quote: "번진 글씨를 한 줄씩 살폈습니다" },
    { kind: "dialogue", paragraphIndex: 4, quote: "친구가 날짜를 알아볼 수 있어야 할 텐데" },
    { kind: "action", paragraphIndex: 4, quote: "선풍기를 약하게 켰습니다" },
    { kind: "action", paragraphIndex: 1, quote: "초대장 한쪽이 흠뻑 젖었습니다" },
  ],
  readings: [
    {
      mindId: "upset",
      summary: "정성껏 만든 초대장이 젖은 모습을 보고 속상했을 수 있어요.",
      pairs: [
        { evidenceIndexes: [0, 1], summary: "빠르게 건지고 입술을 다문 모습을 함께 보면 속상한 마음을 짐작할 수 있어요." },
        { evidenceIndexes: [1, 2], summary: "표정과 번진 글씨를 살피는 행동이 초대장을 아끼는 마음과 이어져요." },
      ],
    },
    {
      mindId: "worried",
      summary: "친구가 초대 내용을 읽지 못할까 걱정했을 수 있어요.",
      pairs: [
        { evidenceIndexes: [2, 3], summary: "글씨를 살피고 친구가 읽을 수 있을지 말한 점이 걱정과 이어져요." },
        { evidenceIndexes: [3, 4], summary: "친구를 떠올린 말과 종이를 말리는 행동이 함께 보여요." },
      ],
    },
  ],
});

export const secondStartLineBundle = createStory({
  id: "second-start-line",
  order: 1,
  title: "두 번째 출발선",
  focusCharacterName: "우진",
  targetMoment: "우진이가 떨어진 바통을 주워 다시 출발하는 바로 이때",
  paragraphs: [
    "이어달리기 연습에서 우진이 차례가 되자 친구들이 손을 모았습니다.",
    "우진이가 달리기 시작하자 바통이 손에서 바닥으로 떨어졌습니다.",
    "우진이는 바통을 얼른 주웠습니다. 그리고 친구들을 바라보며 입술을 꼭 다물었습니다.",
    "우진이는 “괜찮아, 다시 갈게!”라고 말하고 출발선으로 두 걸음 돌아갔습니다.",
    "바통을 가슴 높이 들고 운동장 끝을 보며 달리기 시작했습니다.",
  ],
  candidateMindIds: ["worried", "retry", "persevere", "upset"],
  evidence: [
    { kind: "action", paragraphIndex: 2, quote: "바통을 얼른 주웠습니다" },
    { kind: "dialogue", paragraphIndex: 3, quote: "괜찮아, 다시 갈게!" },
    { kind: "expression", paragraphIndex: 2, quote: "친구들을 바라보며 입술을 꼭 다물었습니다" },
    { kind: "action", paragraphIndex: 3, quote: "출발선으로 두 걸음 돌아갔습니다" },
    { kind: "action", paragraphIndex: 4, quote: "바통을 가슴 높이 들고" },
    { kind: "expression", paragraphIndex: 4, quote: "운동장 끝을 보며" },
  ],
  readings: [
    {
      mindId: "worried",
      summary: "기다리는 친구들에게 연습을 잘 이어 주고 싶은 마음이 있었을 수 있어요.",
      pairs: [
        { evidenceIndexes: [0, 1], summary: "바통을 곧바로 줍고 다시 가겠다고 말한 점에서 친구들을 생각했음을 짐작할 수 있어요." },
        { evidenceIndexes: [0, 2], summary: "바통을 주운 뒤 친구들을 바라본 행동이 친구들을 마음에 두고 있음을 보여요." },
      ],
    },
    {
      mindId: "retry",
      summary: "실수 뒤에도 처음 자리로 돌아가 다시 해 보고 싶었을 수 있어요.",
      pairs: [
        { evidenceIndexes: [0, 1], summary: "바통을 줍고 다시 가겠다는 말은 한 번 더 해 보려는 생각과 이어져요." },
        { evidenceIndexes: [1, 3], summary: "다시 가겠다고 말하며 출발선으로 돌아간 행동이 재도전을 보여요." },
      ],
    },
    {
      mindId: "persevere",
      summary: "연습을 멈추지 않고 마지막까지 이어 가고 싶었을 수 있어요.",
      pairs: [
        { evidenceIndexes: [0, 1], summary: "바통을 주워 다시 가겠다는 선택이 연습을 계속하려는 마음과 이어져요." },
        { evidenceIndexes: [2, 4], summary: "친구들을 본 뒤 바통을 들고 달린 모습에서 끝까지 하려는 마음을 짐작할 수 있어요." },
      ],
    },
  ],
});

export const windowPaperStarBundle = createStory({
  id: "window-paper-star",
  order: 2,
  title: "창가의 종이별",
  focusCharacterName: "서윤",
  targetMoment: "서윤이가 친구 작품을 축하한 뒤 자기 종이별을 바라보는 바로 이때",
  paragraphs: [
    "교실 작품판 가운데 자리에 민호의 커다란 종이별이 붙었습니다.",
    "서윤이는 두 손을 모아 세 번 크게 박수를 쳤습니다.",
    "민호에게 “가운데에서 반짝이니 정말 눈에 잘 보여.”라고 말했습니다.",
    "서윤이는 자기의 작은 종이별을 들고 잠시 창가를 바라보았습니다.",
    "입꼬리를 살짝 올리며 “내 별도 그 옆에 붙여도 될까?”라고 물었습니다.",
  ],
  candidateMindIds: ["disappointed", "happy", "together", "worried"],
  evidence: [
    { kind: "action", paragraphIndex: 1, quote: "두 손을 모아 세 번 크게 박수를 쳤습니다" },
    { kind: "dialogue", paragraphIndex: 2, quote: "가운데에서 반짝이니 정말 눈에 잘 보여" },
    { kind: "action", paragraphIndex: 3, quote: "자기의 작은 종이별을 들고" },
    { kind: "expression", paragraphIndex: 3, quote: "잠시 창가를 바라보았습니다" },
    { kind: "dialogue", paragraphIndex: 4, quote: "내 별도 그 옆에 붙여도 될까?" },
    { kind: "expression", paragraphIndex: 4, quote: "입꼬리를 살짝 올리며" },
  ],
  readings: [
    { mindId: "happy", summary: "친구 작품이 잘 보이는 자리에 붙어 기뻤을 수 있어요.", pairs: [
      { evidenceIndexes: [0, 1], summary: "박수와 칭찬하는 말을 함께 보면 친구의 작품을 반기는 마음이 보여요." },
      { evidenceIndexes: [0, 2], summary: "친구에게 박수친 뒤 자기 별도 든 모습에서 전시를 함께 반기는 마음을 볼 수 있어요." },
    ] },
    { mindId: "disappointed", summary: "자기 작품은 가운데 자리가 아니어서 조금 아쉬웠을 수 있어요.", pairs: [
      { evidenceIndexes: [2, 3], summary: "자기 별을 들고 창가를 바라본 행동에서 아쉬움을 짐작할 수 있어요." },
      { evidenceIndexes: [3, 4], summary: "잠시 바라본 뒤 자기 별의 자리도 물어본 점이 아쉬움과 이어져요." },
    ] },
    { mindId: "together", summary: "두 작품을 나란히 전시하고 싶었을 수 있어요.", pairs: [
      { evidenceIndexes: [0, 4], summary: "친구에게 박수치고 옆자리를 물은 점에서 함께 전시하려는 바람이 보여요." },
      { evidenceIndexes: [1, 4], summary: "친구 작품을 칭찬하고 옆에 붙여도 되는지 물은 말이 함께하고 싶은 마음과 이어져요." },
    ] },
  ],
});

export const stoppedRobotBundle = createStory({
  id: "stopped-robot",
  order: 3,
  title: "로봇이 멈춘 순간",
  focusCharacterName: "하린",
  targetMoment: "하린이가 점검표를 펼쳐 멈춘 까닭을 살피기 시작하는 바로 이때",
  paragraphs: [
    "모둠 발표에서 하린이가 만든 바퀴 로봇이 파란 선을 따라갔습니다.",
    "로봇은 책상 모서리 앞에서 불빛만 깜빡이고 멈추었습니다.",
    "하린이는 눈을 조금 크게 뜨고 “어느 표시에서 멈췄지?”라고 물었습니다.",
    "곧바로 점검표를 펼쳐 전선과 바퀴 칸을 손가락으로 짚었습니다.",
    "친구에게 “여기부터 함께 보고 다시 움직여 보자.”라고 말했습니다.",
  ],
  candidateMindIds: ["solve", "upset", "curious", "persevere"],
  evidence: [
    { kind: "expression", paragraphIndex: 2, quote: "눈을 조금 크게 뜨고" },
    { kind: "dialogue", paragraphIndex: 2, quote: "어느 표시에서 멈췄지?" },
    { kind: "action", paragraphIndex: 3, quote: "점검표를 펼쳐" },
    { kind: "action", paragraphIndex: 3, quote: "전선과 바퀴 칸을 손가락으로 짚었습니다" },
    { kind: "dialogue", paragraphIndex: 4, quote: "여기부터 함께 보고 다시 움직여 보자" },
    { kind: "action", paragraphIndex: 1, quote: "불빛만 깜빡이고 멈추었습니다" },
  ],
  readings: [
    { mindId: "curious", summary: "로봇이 왜 그 자리에서 멈췄는지 궁금했을 수 있어요.", pairs: [
      { evidenceIndexes: [0, 1], summary: "눈이 커진 모습과 멈춘 위치를 묻는 말이 궁금한 마음과 이어져요." },
      { evidenceIndexes: [1, 2], summary: "질문한 뒤 점검표를 펼친 행동은 까닭을 알아보려는 모습이에요." },
    ] },
    { mindId: "solve", summary: "멈춘 로봇을 고쳐 다시 움직이게 하고 싶었을 수 있어요.", pairs: [
      { evidenceIndexes: [2, 3], summary: "점검표를 펼치고 두 곳을 짚은 행동에서 문제를 찾으려는 마음이 보여요." },
      { evidenceIndexes: [3, 4], summary: "부품을 살피며 다시 움직이자고 말한 점이 해결하려는 바람과 이어져요." },
    ] },
    { mindId: "persevere", summary: "발표를 멈추지 않고 로봇을 다시 움직여 이어 가고 싶었을 수 있어요.", pairs: [
      { evidenceIndexes: [2, 4], summary: "점검표를 펴고 다시 움직이자고 한 점이 발표를 이어 가려는 마음과 이어져요." },
      { evidenceIndexes: [3, 4], summary: "살필 곳을 짚고 다시 해 보자는 말에서 계속하려는 마음을 짐작할 수 있어요." },
    ] },
  ],
});
