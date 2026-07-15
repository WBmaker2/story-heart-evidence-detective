import type { StoryCase } from "../domain/types.ts";
import { getReadingSegments } from "../features/investigation/reading.ts";
import type { InvestigationStage, ReadingMode } from "../features/investigation/state.ts";
import { BookIcon } from "./Icons";

interface StoryPanelProps {
  story: StoryCase;
  stage: InvestigationStage;
  readingMode: ReadingMode;
  sentenceIndex: number;
  onReadingMode: (mode: ReadingMode) => void;
  onNextSentence: () => void;
}

export function StoryPanel({
  story,
  stage,
  readingMode,
  sentenceIndex,
  onReadingMode,
  onNextSentence,
}: StoryPanelProps) {
  const isReading = stage === "reading";
  const sentences = getReadingSegments(story);
  const showSingleSentence = isReading && readingMode === "sentence";

  return (
    <article className="story-paper" aria-labelledby="story-title">
      <div className="paper-tab"><BookIcon /> 이야기 읽기</div>
      <h1 id="story-title">{story.title}</h1>
      <div className="story-text" aria-live={showSingleSentence ? "polite" : "off"}>
        {showSingleSentence ? (
          <p className="single-sentence">{sentences[sentenceIndex]}</p>
        ) : (
          story.paragraphs.map((paragraph) => <p key={paragraph.id}>{paragraph.text}</p>)
        )}
      </div>

      {showSingleSentence ? (
        <div className="sentence-controls">
          <span>{sentenceIndex + 1} / {sentences.length}</span>
          <button
            className="button button-small button-secondary"
            type="button"
            onClick={onNextSentence}
            disabled={sentenceIndex >= sentences.length - 1}
          >
            다음 문장
          </button>
        </div>
      ) : null}

      <aside className="target-moment" aria-label="마음을 살필 장면">
        <span aria-hidden="true">◎</span>
        <div><strong>마음을 살필 장면</strong><p>{story.targetMoment}</p></div>
      </aside>

      {isReading ? (
        <fieldset className="reading-mode">
          <legend>읽기 방식</legend>
          <label>
            <input
              type="radio"
              name="reading-mode"
              checked={readingMode === "sentence"}
              onChange={() => onReadingMode("sentence")}
            />
            문장별 읽기
          </label>
          <label>
            <input
              type="radio"
              name="reading-mode"
              checked={readingMode === "all"}
              onChange={() => onReadingMode("all")}
            />
            한 번에 읽기
          </label>
        </fieldset>
      ) : null}
    </article>
  );
}
