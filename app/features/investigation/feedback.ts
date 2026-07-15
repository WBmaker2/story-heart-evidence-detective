import type {
  InferenceReview,
  ReviewedContentRegistry,
  StoryCase,
} from "../../domain/types.ts";

const reviewMessages: Record<InferenceReview["code"], { title: string; body: string }> = {
  supported: {
    title: "단서가 마음까지 길을 만들었어요",
    body: "고른 두 단서가 마음을 짐작하는 데 함께 힘을 보태고 있어요.",
  },
  "evidence-link-mismatch": {
    title: "단서가 다른 길도 보여줘요",
    body: "이 두 단서는 또 다른 마음과도 가까이 이어져요. 여러 길을 발견한 것도 멋진 수사예요.",
  },
  "partially-supported": {
    title: "단서 한 장이 길을 열었어요",
    body: "고른 단서 하나가 마음과 이어져요. 두 단서가 함께 만드는 장면도 천천히 살펴보세요.",
  },
  "insufficient-evidence": {
    title: "장면을 한 번 더 비춰 볼까요?",
    body: "두 단서가 고른 마음으로 가는 길을 아직 또렷하게 보여 주지는 않아요. 다른 연결도 찾아볼 수 있어요.",
  },
};

export function getReviewMessage(review: InferenceReview) {
  return reviewMessages[review.code];
}

export function getReviewDetails(review: InferenceReview, registry: ReviewedContentRegistry) {
  const ids =
    review.code === "supported" || review.code === "evidence-link-mismatch"
      ? review.rationaleIds
      : review.code === "partially-supported"
        ? [review.rationaleId]
        : [];
  return ids
    .map((id) => registry.explanations.find((item) => item.id === id)?.text)
    .filter((text): text is string => Boolean(text));
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
