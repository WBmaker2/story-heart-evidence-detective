import { getAlternativeReading } from "../domain/inference.ts";
import type {
  CompletedInference,
  InferenceReview,
  ReviewedContentRegistry,
  StoryCase,
} from "../domain/types.ts";
import {
  evidenceKindLabels,
  getReadingSummary,
  getReviewDetails,
  getReviewMessage,
} from "../features/investigation/feedback.ts";
import { ArrowIcon, SearchIcon } from "./Icons";

interface ReviewPanelProps {
  story: StoryCase;
  registry: ReviewedContentRegistry;
  inference: CompletedInference;
  review: InferenceReview;
  run: "tutorial" | "case";
  caseIndex: number;
  onRevise: () => void;
  onNext: () => void;
}

export function ReviewPanel({
  story,
  registry,
  inference,
  review,
  run,
  caseIndex,
  onRevise,
  onNext,
}: ReviewPanelProps) {
  const message = getReviewMessage(review);
  const details = getReviewDetails(review, registry);
  const selectedMind = registry.minds.find((mind) => mind.id === inference.mindId)!;
  const selectedEvidence = inference.evidenceCardIds.map((id) =>
    story.evidenceCards.find((card) => card.id === id)!,
  );
  const alternative = getAlternativeReading(inference, review, story);
  const alternativeSummary = alternative
    ? getReadingSummary(alternative.id, story, registry)
    : null;

  return (
    <section className="investigation-paper review-paper" aria-labelledby="review-title">
      <div className="case-heading">
        <span className="case-label">{run === "tutorial" ? "연습 사건" : `사건 ${caseIndex + 1} / 6`}</span>
        <h2 id="review-title">{message.title}</h2>
      </div>

      <div className="review-stamp" aria-hidden="true"><SearchIcon size={36} /><span>살펴봄</span></div>
      <p className="review-message">{message.body}</p>

      <div className="selection-review">
        <h3>내가 연결한 마음과 단서</h3>
        <p className="selected-mind-line"><span>마음</span><strong>{selectedMind.label}</strong></p>
        <ul>
          {selectedEvidence.map((card) => (
            <li key={card.id}>
              <span className={`clue-tag clue-${card.kind}`}>{evidenceKindLabels[card.kind]}</span>
              <span>“{card.anchor.exactQuote}”</span>
            </li>
          ))}
        </ul>
        {details.length ? (
          <div className="review-details">
            {details.map((detail) => <p key={detail}>{detail}</p>)}
          </div>
        ) : null}
      </div>

      <aside className="alternative-reading">
        <h3>다른 해석도 살펴봤어요</h3>
        {alternativeSummary ? (
          <>
            <strong>{alternativeSummary.mind.label}</strong>
            <p>{alternativeSummary.explanation.text}</p>
          </>
        ) : (
          <p>같은 장면을 다른 단서와 이어 보는 방법도 있어요.</p>
        )}
      </aside>

      <div className="review-actions">
        <button className="button button-secondary" type="button" onClick={onRevise}>
          다시 살펴보기
        </button>
        <button className="button button-primary" type="button" onClick={onNext}>
          {run === "tutorial" ? "첫 사건 시작" : caseIndex === 5 ? "수사 기록 보기" : "다음 사건"}
          <ArrowIcon />
        </button>
      </div>
    </section>
  );
}
