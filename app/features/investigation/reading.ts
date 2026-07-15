import type { StoryCase } from "../../domain/types.ts";

const TERMINAL_MARKS = new Set([".", "?", "!"]);
const CLOSING_MARKS = new Set(["”", "’", "\"", "'", "」", "』", "》", ")", "]", "}"]);
const QUOTED_NARRATION_PREFIX = /^(?:라고|라며|라는|하고|하며|고)/u;

function isDecimalPoint(text: string, index: number) {
  return text[index] === "." && /\d/u.test(text[index - 1] ?? "") && /\d/u.test(text[index + 1] ?? "");
}

export function segmentKoreanSentences(text: string): string[] {
  const segments: string[] = [];
  let segmentStart = 0;

  for (let index = 0; index < text.length; index += 1) {
    if (!TERMINAL_MARKS.has(text[index]) || isDecimalPoint(text, index)) continue;

    let boundaryEnd = index + 1;
    while (TERMINAL_MARKS.has(text[boundaryEnd])) boundaryEnd += 1;

    const quoteStart = boundaryEnd;
    while (CLOSING_MARKS.has(text[boundaryEnd])) boundaryEnd += 1;
    const closedQuote = boundaryEnd > quoteStart;
    if (closedQuote && QUOTED_NARRATION_PREFIX.test(text.slice(boundaryEnd))) {
      index = boundaryEnd - 1;
      continue;
    }

    const segment = text.slice(segmentStart, boundaryEnd).trim();
    if (segment) segments.push(segment);
    segmentStart = boundaryEnd;
    index = boundaryEnd - 1;
  }

  const remainder = text.slice(segmentStart).trim();
  if (remainder) segments.push(remainder);
  return segments;
}

export function getReadingSegments(story: Pick<StoryCase, "paragraphs">) {
  return story.paragraphs.flatMap((paragraph) => segmentKoreanSentences(paragraph.text));
}
