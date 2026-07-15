import type { StoryBank } from "../domain/types.ts";
import { minds } from "./minds.ts";
import { contentRegistryIds } from "./story-factory.ts";
import {
  libraryBookmarkBundle,
  quietApplauseBundle,
  waitingFlowerpotBundle,
} from "./stories/cases-4-6.ts";
import {
  secondStartLineBundle,
  stoppedRobotBundle,
  tutorialBundle,
  windowPaperStarBundle,
} from "./stories/tutorial-and-cases-1-3.ts";

const bundles = [
  tutorialBundle,
  secondStartLineBundle,
  windowPaperStarBundle,
  stoppedRobotBundle,
  waitingFlowerpotBundle,
  libraryBookmarkBundle,
  quietApplauseBundle,
] as const;

export const FIXED_STORY_IDS = [
  "tutorial-wet-invitation",
  "second-start-line",
  "window-paper-star",
  "stopped-robot",
  "waiting-flowerpot",
  "library-bookmark",
  "quiet-applause",
] as const;

export const storyBank: StoryBank = {
  schemaVersion: 1,
  contentVersion: contentRegistryIds.contentVersion,
  registry: {
    minds,
    explanations: bundles.flatMap((bundle) => bundle.explanations),
    reviewChecklistIds: [contentRegistryIds.reviewChecklistId],
    sceneAssetIds: bundles.map((bundle) => bundle.story.sceneAssetId),
  },
  tutorial: tutorialBundle.story,
  cases: [
    secondStartLineBundle.story,
    windowPaperStarBundle.story,
    stoppedRobotBundle.story,
    waitingFlowerpotBundle.story,
    libraryBookmarkBundle.story,
    quietApplauseBundle.story,
  ],
};
