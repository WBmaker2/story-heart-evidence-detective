import type {
  CompletedInference,
  InferenceReview,
  ReviewedContentRegistry,
  StoryCase,
} from "../../domain/types.ts";

const reviewMessages: Record<Exclude<InferenceReview["code"], "partially-supported">, { title: string; body: string }> = {
  supported: {
    title: "단서가 마음까지 길을 만들었어요",
    body: "고른 두 단서가 마음을 짐작하는 데 함께 힘을 보태고 있어요.",
  },
  "evidence-link-mismatch": {
    title: "같은 단서에서 다른 마음도 보여요",
    body: "고른 두 단서를 함께 보면 다른 마음으로도 짐작할 수 있어요. 어떤 마음과 자연스럽게 이어지는지 장면을 다시 살펴보세요.",
  },
  "insufficient-evidence": {
    title: "장면을 한 번 더 비춰 볼까요?",
    body: "고른 두 단서만으로는 이 마음을 짐작하기 어려워요. 말과 행동, 표정 가운데 더 자연스럽게 이어지는 단서를 찾아보세요.",
  },
};

export function getReviewMessage(review: InferenceReview) {
  if (review.code === "partially-supported") {
    return review.matchedEvidenceCardIds.length === 2
      ? {
          title: "두 단서가 각각 마음과 이어져요",
          body: "고른 두 단서 모두 이 마음을 짐작하는 데 도움이 돼요. 두 단서를 함께 보았을 때도 자연스럽게 이어지는지 살펴보세요.",
        }
      : {
          title: "한 단서가 마음과 이어져요",
          body: "고른 두 단서 중 하나가 이 마음을 짐작하는 데 도움이 돼요. 나머지 단서도 같은 마음을 보여 주는지 살펴보세요.",
        };
  }
  return reviewMessages[review.code];
}

function mindLabel(mindId: string, registry: ReviewedContentRegistry) {
  return registry.minds.find((mind) => mind.id === mindId)?.label ?? "고른 마음";
}

function evidenceQuote(evidenceCardId: string, story: StoryCase) {
  return story.evidenceCards.find((card) => card.id === evidenceCardId)?.anchor.exactQuote ?? "고른 단서";
}

export function getReviewDetails(
  review: InferenceReview,
  story: StoryCase,
  inference: CompletedInference,
  registry: ReviewedContentRegistry,
) {
  const selectedMindLabel = mindLabel(inference.mindId, registry);

  if (review.code === "supported") {
    const pairSummary = registry.explanations.find((item) => item.id === review.rationaleIds[2])?.text;
    return [
      `고른 두 단서는 모두 ‘${selectedMindLabel}’을 짐작하는 데 도움이 돼요.`,
      ...(pairSummary ? [pairSummary] : []),
    ];
  }

  if (review.code === "evidence-link-mismatch") {
    const alternative = story.reviewedReadings.find((reading) => reading.id === review.primaryMatch.readingId);
    const alternativeMindLabel = alternative ? mindLabel(alternative.mindId, registry) : "다른 마음";
    return [`고른 두 단서를 함께 보면 ‘${alternativeMindLabel}’이라는 다른 해석도 가능해요.`];
  }

  if (review.code === "partially-supported") {
    if (review.matchedEvidenceCardIds.length === 2) {
      return [`고른 두 단서는 각각 ‘${selectedMindLabel}’과 이어져요.`];
    }
    const matchedId = review.matchedEvidenceCardIds[0];
    const unmatchedId = inference.evidenceCardIds.find((id) => id !== matchedId)!;
    return [
      `“${evidenceQuote(matchedId, story)}”는 ‘${selectedMindLabel}’을 짐작하는 데 도움이 돼요.`,
      `나머지 단서 “${evidenceQuote(unmatchedId, story)}”가 이 마음과 자연스럽게 이어지는지 장면에서 다시 살펴보세요.`,
    ];
  }

  return [`고른 두 단서를 함께 보았을 때 ‘${selectedMindLabel}’으로 이어지는 모습은 아직 뚜렷하지 않아요.`];
}

export function getReadingSummary(
  readingId: string,
  story: StoryCase,
  registry: ReviewedContentRegistry,
) {
  const reading = story.reviewedReadings.find((item) => item.id === readingId);
  if (!reading) return null;
  const mind = registry.minds.find((item) => item.id === reading.mindId);
  const explanation = registry.explanations.find(
    (item) => item.id === reading.interpretationSummaryId,
  );
  if (!mind || !explanation) return null;
  return { mind, explanation };
}

export const evidenceKindLabels = {
  action: "행동",
  expression: "표정",
  dialogue: "대사",
} as const;
