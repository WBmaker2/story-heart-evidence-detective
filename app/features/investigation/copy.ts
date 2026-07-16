import type { StoryCase } from "../../domain/types.ts";
import type { InvestigationStage } from "./state.ts";

export function getInvestigationStagePrompt(
  story: StoryCase,
  stage: InvestigationStage,
) {
  if (stage === "reading") {
    return `${story.focusCharacterName}의 마음이나 생각을 살필 장면을 천천히 읽어 보세요.`;
  }
  if (stage === "mind") {
    return `${story.focusCharacterName}의 마음이나 생각을 하나 골라 보세요.`;
  }
  if (stage === "evidence") {
    return "고른 마음과 이어지는 단서 두 개를 골라 보세요.";
  }
  return story.prompt;
}
