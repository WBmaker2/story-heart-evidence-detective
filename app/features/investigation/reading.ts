import type { StoryCase } from "../../domain/types.ts";

export function getReadingSegments(story: Pick<StoryCase, "paragraphs">) {
  return story.paragraphs.map((paragraph) => paragraph.text);
}
