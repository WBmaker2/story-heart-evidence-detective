import { deriveSessionSummary } from "../domain/session.ts";
import type { CaseRecord, StoryBank } from "../domain/types.ts";
import { evidenceKindLabels } from "../features/investigation/feedback.ts";
import { summaryLanguage } from "../features/investigation/state.ts";
import { ResetIcon, SearchIcon } from "./Icons";

interface SummaryScreenProps {
  records: CaseRecord[];
  bank: StoryBank;
  onReset: () => void;
}

export function SummaryScreen({ records, bank, onReset }: SummaryScreenProps) {
  const summary = deriveSessionSummary(records, bank);

  return (
    <section className="summary-screen" aria-labelledby="summary-title">
      <div className="summary-heading">
        <SearchIcon size={54} />
        <div>
          <h1 id="summary-title" data-stage-heading tabIndex={-1}>여섯 편의 사건을 모두 살펴봤어요!</h1>
          <p>{summaryLanguage(summary.length)}</p>
        </div>
      </div>

      <ol className="summary-list">
        {summary.map((item, index) => (
          <li key={item.caseId}>
            <span className="summary-number">{index + 1}</span>
            <div className="summary-story">
              <strong>{item.title}</strong>
              <dl className="summary-details">
                <div>
                  <dt>내가 고른 마음</dt>
                  <dd>{item.mindLabel}</dd>
                </div>
                <div>
                  <dt>대표 단서</dt>
                  <dd>“{item.evidenceQuotes[0]}”</dd>
                </div>
                <div>
                  <dt>다른 생각</dt>
                  <dd><strong>{item.alternativeMindLabel}</strong> — {item.alternativeSummary}</dd>
                </div>
              </dl>
            </div>
            <div className="summary-kinds" aria-label={`사용한 단서 종류: ${item.evidenceKinds.map((kind) => evidenceKindLabels[kind]).join(", ")}`}>
              {item.evidenceKinds.map((kind) => (
                <span className={`clue-tag clue-${kind}`} key={kind}>{evidenceKindLabels[kind]}</span>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <div className="summary-note">
        <strong>수사대가 발견한 것</strong>
        <p>인물의 마음은 이야기 속 여러 단서로 짐작할 수 있고, 같은 장면에도 다른 생각이 이어질 수 있어요.</p>
      </div>
      <button className="button button-secondary summary-reset" type="button" onClick={onReset}>
        <ResetIcon /> 처음부터
      </button>
    </section>
  );
}
