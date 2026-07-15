import type { MindDefinition } from "../domain/types.ts";

export const minds = [
  { id: "upset", label: "속상한 마음", sentenceForm: "속상할", kind: "feeling", studentFriendlyMeaning: "바라던 대로 되지 않아 마음이 좋지 않은 느낌이에요." },
  { id: "worried", label: "걱정하는 마음", sentenceForm: "걱정하고 있을", kind: "thought-or-wish", studentFriendlyMeaning: "어떤 일이 잘되지 않을까 마음을 쓰는 생각이에요." },
  { id: "retry", label: "다시 해 보고 싶은 마음", sentenceForm: "다시 해 보고 싶을", kind: "thought-or-wish", studentFriendlyMeaning: "멈추지 않고 한 번 더 해 보려는 바람이에요." },
  { id: "persevere", label: "끝까지 이어 가고 싶은 마음", sentenceForm: "끝까지 이어 가고 싶을", kind: "thought-or-wish", studentFriendlyMeaning: "시작한 일을 마지막까지 계속하려는 바람이에요." },
  { id: "happy", label: "기쁜 마음", sentenceForm: "기쁠", kind: "feeling", studentFriendlyMeaning: "좋은 일이 있어 마음이 즐겁고 밝은 느낌이에요." },
  { id: "disappointed", label: "아쉬운 마음", sentenceForm: "아쉬울", kind: "feeling", studentFriendlyMeaning: "조금 더 잘되기를 바랐지만 모자라다고 느끼는 마음이에요." },
  { id: "together", label: "함께하고 싶은 마음", sentenceForm: "함께하고 싶을", kind: "thought-or-wish", studentFriendlyMeaning: "다른 사람과 곁에서 같이하려는 바람이에요." },
  { id: "curious", label: "궁금한 마음", sentenceForm: "궁금할", kind: "thought-or-wish", studentFriendlyMeaning: "모르는 것을 더 알아보고 싶은 생각이에요." },
  { id: "solve", label: "해결하고 싶은 마음", sentenceForm: "해결하고 싶을", kind: "thought-or-wish", studentFriendlyMeaning: "문제의 까닭을 찾아 잘되게 만들려는 바람이에요." },
  { id: "hopeful", label: "기대하는 마음", sentenceForm: "기대하고 있을", kind: "feeling", studentFriendlyMeaning: "앞으로 좋은 일이 생기기를 기다리는 마음이에요." },
  { id: "help", label: "도와주고 싶은 마음", sentenceForm: "도와주고 싶을", kind: "thought-or-wish", studentFriendlyMeaning: "다른 사람에게 필요한 힘을 보태려는 바람이에요." },
  { id: "support", label: "응원하고 싶은 마음", sentenceForm: "응원하고 싶을", kind: "thought-or-wish", studentFriendlyMeaning: "다른 사람이 힘내도록 마음을 보내고 싶은 바람이에요." },
  { id: "respect", label: "선택을 존중하고 싶은 마음", sentenceForm: "선택을 존중하고 싶을", kind: "thought-or-wish", studentFriendlyMeaning: "다른 사람이 고른 방법을 소중히 받아들이려는 생각이에요." },
] as const satisfies readonly MindDefinition[];
