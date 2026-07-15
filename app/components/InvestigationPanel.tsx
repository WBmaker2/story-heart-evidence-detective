import { buildInvestigationSentence } from "../domain/inference.ts";
import type {
  CompletedInference,
  ReviewedContentRegistry,
  StoryCase,
} from "../domain/types.ts";
import { evidenceKindLabels } from "../features/investigation/feedback.ts";
import type { InvestigationNotice, InvestigationStage } from "../features/investigation/state.ts";
import { ArrowIcon, SearchIcon } from "./Icons";

interface InvestigationPanelProps {
  story: StoryCase;
  registry: ReviewedContentRegistry;
  stage: InvestigationStage;
  run: "tutorial" | "case";
  caseIndex: number;
  mindId: string | null;
  evidenceCardIds: string[];
  notice: InvestigationNotice;
  onContinue: () => void;
  onMind: (mindId: string) => void;
  onEditMind: () => void;
  onEvidence: (evidenceId: string) => void;
  onSubmit: (inference: CompletedInference) => void;
}

function DraftSentence({
  story,
  registry,
  mindId,
  evidenceCardIds,
}: Pick<InvestigationPanelProps, "story" | "registry" | "mindId" | "evidenceCardIds">) {
  const mind = registry.minds.find((item) => item.id === mindId);
  const evidence = evidenceCardIds.map(
    (id) => story.evidenceCards.find((card) => card.id === id)?.anchor.exactQuote,
  );
  const complete = mind && evidence.length === 2 && evidence.every(Boolean);
  const sentence = complete
    ? buildInvestigationSentence(
        { mindId: mind.id, evidenceCardIds: [evidenceCardIds[0], evidenceCardIds[1]] },
        story,
        registry,
      )
    : `나는 ${story.focusCharacterName}이 ${mind?.sentenceForm ?? "______"} 수 있다고 생각해요. “${evidence[0] ?? "첫 번째 단서"}”, “${evidence[1] ?? "두 번째 단서"}”가 단서예요.`;
  return <p className="draft-sentence">{sentence}</p>;
}

export function InvestigationPanel(props: InvestigationPanelProps) {
  const {
    story,
    registry,
    stage,
    run,
    caseIndex,
    mindId,
    evidenceCardIds,
    notice,
    onContinue,
    onMind,
    onEditMind,
    onEvidence,
    onSubmit,
  } = props;
  const minds = story.candidateMindIds.map((id) => registry.minds.find((mind) => mind.id === id)!);
  const completed = Boolean(mindId && evidenceCardIds.length === 2);

  return (
    <section className="investigation-paper" aria-labelledby="investigation-title">
      <div className="case-heading">
        <span className="case-label">{run === "tutorial" ? "연습 사건" : `사건 ${caseIndex + 1} / 6`}</span>
        <h2 id="investigation-title">{story.prompt}</h2>
      </div>

      {stage === "reading" ? (
        <div className="step-intro">
          <SearchIcon size={48} />
          <h3 data-stage-heading tabIndex={-1}>먼저 이야기를 천천히 읽어 보세요</h3>
          <p>밑줄을 긋거나 따로 적지 않아도 괜찮아요. 왼쪽의 장면을 기억해 두면 돼요.</p>
          <button className="button button-primary" type="button" onClick={onContinue}>
            마음 살피러 가기 <ArrowIcon />
          </button>
        </div>
      ) : null}

      {stage === "mind" ? (
        <>
          <fieldset className="choice-fieldset mind-choices">
            <legend data-stage-heading tabIndex={-1}><span>1</span> 마음 고르기</legend>
            <p className="field-help">이 장면에서 {story.focusCharacterName}의 마음이나 생각을 하나 골라 보세요.</p>
            <div className="choice-grid">
              {minds.map((mind) => (
                <label className="mind-choice" key={mind.id}>
                  <input
                    type="radio"
                    name="mind-choice"
                    value={mind.id}
                    checked={mindId === mind.id}
                    onChange={() => onMind(mind.id)}
                  />
                  <span><strong>{mind.label}</strong><small>{mind.studentFriendlyMeaning}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
          <button className="button button-primary panel-action" type="button" onClick={onContinue} disabled={!mindId}>
            단서 찾으러 가기 <ArrowIcon />
          </button>
        </>
      ) : null}

      {stage === "evidence" ? (
        <>
          <div className="selected-mind">
            <div><span>고른 마음</span><strong>{minds.find((mind) => mind.id === mindId)?.label}</strong></div>
            <button className="text-button" type="button" onClick={onEditMind}>마음 다시 고르기</button>
          </div>
          <fieldset className="choice-fieldset evidence-choices">
            <legend data-stage-heading tabIndex={-1}><span>2</span> 단서 2개 고르기 <small>{evidenceCardIds.length} / 2</small></legend>
            <p className="field-help">행동, 표정, 대사에서 서로 다른 카드 두 장을 고르세요. 같은 종류끼리도 연결할 수 있어요.</p>
            <div className="evidence-grid">
              {story.evidenceCards.map((card) => {
                const checked = evidenceCardIds.includes(card.id);
                return (
                  <label className="evidence-choice" key={card.id}>
                    <input type="checkbox" checked={checked} onChange={() => onEvidence(card.id)} />
                    <span className={`clue-tag clue-${card.kind}`}>{evidenceKindLabels[card.kind]}</span>
                    <span className="evidence-quote">“{card.anchor.exactQuote}”</span>
                  </label>
                );
              })}
            </div>
            <p className="choice-notice" role="status" aria-live="polite">
              {notice === "max-two-evidence" ? "단서는 두 장까지 고를 수 있어요. 먼저 고른 두 장은 그대로 두었어요." : " "}
            </p>
          </fieldset>
          <div className="sentence-box">
            <h3><span>3</span> 수사 문장</h3>
            <DraftSentence story={story} registry={registry} mindId={mindId} evidenceCardIds={evidenceCardIds} />
          </div>
          <p className="submit-help" id="submit-help">
            {completed ? "마음 한 가지와 단서 두 장이 준비됐어요." : "마음 한 가지와 서로 다른 단서 카드 두 장이 필요해요."}
          </p>
          <button
            className="button button-primary panel-action"
            type="button"
            disabled={!completed}
            aria-describedby="submit-help"
            onClick={() => {
              if (!mindId || evidenceCardIds.length !== 2) return;
              onSubmit({ mindId, evidenceCardIds: [evidenceCardIds[0], evidenceCardIds[1]] });
            }}
          >
            <SearchIcon /> 검토하기
          </button>
        </>
      ) : null}
    </section>
  );
}
