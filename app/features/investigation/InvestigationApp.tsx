"use client";

import { useEffect, useReducer, useRef } from "react";

import { AppHeader } from "../../components/AppHeader";
import { InvestigationPanel } from "../../components/InvestigationPanel";
import { ReviewPanel } from "../../components/ReviewPanel";
import { StartScreen } from "../../components/StartScreen";
import { StoryPanel } from "../../components/StoryPanel";
import { SummaryScreen } from "../../components/SummaryScreen";
import { storyBank } from "../../content/story-bank.ts";
import { completeInference, reviewInference } from "../../domain/inference.ts";
import type { CompletedInference } from "../../domain/types.ts";
import { getReadingSegments } from "./reading.ts";
import { createInitialInvestigationState, investigationReducer } from "./state.ts";

const stageLabels = [
  ["reading", "이야기 읽기"],
  ["mind", "마음 고르기"],
  ["evidence", "단서 연결"],
  ["review", "함께 검토"],
] as const;

export function InvestigationApp() {
  const [state, dispatch] = useReducer(
    investigationReducer,
    undefined,
    createInitialInvestigationState,
  );
  const previousStage = useRef(state.stage);
  const story = state.run === "tutorial" ? storyBank.tutorial : storyBank.cases[state.caseIndex];

  useEffect(() => {
    if (previousStage.current !== state.stage) {
      document
        .querySelector<HTMLElement>("[data-stage-heading]")
        ?.focus({ preventScroll: true });
      previousStage.current = state.stage;
    }
  }, [state.stage, state.caseIndex]);

  function submitInference(inference: CompletedInference) {
    if (!story) return;
    const completion = completeInference(inference, story);
    if (!completion.ok) return;
    dispatch({
      type: "submit-review",
      caseId: story.id,
      inference: completion.inference,
      review: reviewInference(completion.inference, story, storyBank.registry),
    });
  }

  const reset = () => dispatch({ type: "reset" });

  return (
    <div className="app-shell">
      <AppHeader onReset={reset} />
      <main id="main-content">
        {state.stage === "start" ? (
          <StartScreen
            onTutorial={() => dispatch({ type: "start-tutorial" })}
            onSkipTutorial={() => dispatch({ type: "skip-tutorial" })}
          />
        ) : null}

        {state.stage === "summary" ? (
          <SummaryScreen records={state.records} bank={storyBank} onReset={reset} />
        ) : null}

        {story && state.stage !== "start" && state.stage !== "summary" ? (
          <>
            <nav className="stage-rail" aria-label="사건 살펴보기 단계">
              <ol>
                {stageLabels.map(([stage, label], index) => {
                  const activeIndex = stageLabels.findIndex(([item]) => item === state.stage);
                  const status = index < activeIndex ? "done" : index === activeIndex ? "current" : "upcoming";
                  return (
                    <li className={status} key={stage} aria-current={status === "current" ? "step" : undefined}>
                      <span>{status === "done" ? "✓" : index + 1}</span>{label}
                    </li>
                  );
                })}
              </ol>
            </nav>
            <div className="case-workspace">
              <StoryPanel
                story={story}
                stage={state.stage}
                readingMode={state.readingMode}
                sentenceIndex={state.sentenceIndex}
                onReadingMode={(mode) => dispatch({ type: "set-reading-mode", mode })}
                onNextSentence={() => {
                  dispatch({
                    type: "next-sentence",
                    finalIndex: getReadingSegments(story).length - 1,
                  });
                }}
              />
              {state.stage === "review" && state.review && state.mindId && state.evidenceCardIds.length === 2 ? (
                <ReviewPanel
                  story={story}
                  registry={storyBank.registry}
                  inference={{
                    mindId: state.mindId,
                    evidenceCardIds: [state.evidenceCardIds[0], state.evidenceCardIds[1]],
                  }}
                  review={state.review}
                  run={state.run!}
                  caseIndex={state.caseIndex}
                  onRevise={() => dispatch({ type: "revise" })}
                  onNext={() => dispatch({ type: "next" })}
                />
              ) : (
                <InvestigationPanel
                  story={story}
                  registry={storyBank.registry}
                  stage={state.stage}
                  run={state.run!}
                  caseIndex={state.caseIndex}
                  mindId={state.mindId}
                  evidenceCardIds={state.evidenceCardIds}
                  notice={state.notice}
                  onContinue={() => dispatch({ type: "continue" })}
                  onMind={(mindId) => dispatch({ type: "choose-mind", mindId })}
                  onEditMind={() => dispatch({ type: "edit-mind" })}
                  onEvidence={(evidenceId) => dispatch({ type: "toggle-evidence", evidenceId })}
                  onSubmit={submitInference}
                />
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
