import { canonicalizeEvidencePair } from "./evidence.ts";
import type {
  ExplanationDefinition,
  ReviewedContentRegistry,
  StoryBank,
  StoryCase,
  ValidationIssue,
} from "./types.ts";

const FIXED_IDS = [
  "tutorial-wet-invitation",
  "second-start-line",
  "window-paper-star",
  "stopped-robot",
  "waiting-flowerpot",
  "library-bookmark",
  "quiet-applause",
] as const;
const BANNED_FIELD_PATTERN = /^(correctMindId|answer|isCorrect|score|points|attempts|streak|random|timeLimit)$/i;

const issue = (caseId: string, rule: string, detail: string): ValidationIssue => ({ caseId, rule, detail });

function validateAnchors(caseData: StoryCase): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const card of caseData.evidenceCards) {
    const paragraph = caseData.paragraphs.find((item) => item.id === card.anchor.paragraphId);
    if (!paragraph) {
      issues.push(issue(caseData.id, "anchor-paragraph-reference", card.id));
      continue;
    }
    const { startOffset, endOffset, exactQuote } = card.anchor;
    if (startOffset < 0 || endOffset <= startOffset || endOffset > paragraph.text.length) {
      issues.push(issue(caseData.id, "anchor-range", card.id));
    } else if (paragraph.text.slice(startOffset, endOffset) !== exactQuote) {
      issues.push(issue(caseData.id, "anchor-exact-quote", card.id));
    }
  }
  return issues;
}

function explanationMatches(
  registry: ReviewedContentRegistry,
  id: string,
  kind: ExplanationDefinition["kind"],
) {
  return registry.explanations.some((item) => item.id === id && item.kind === kind);
}

function validateCase(caseData: StoryCase, registry: ReviewedContentRegistry): ValidationIssue[] {
  const issues = validateAnchors(caseData);
  if (caseData.schemaVersion !== 1 || !caseData.contentVersion) issues.push(issue(caseData.id, "case-version", "schema/content version"));
  if (caseData.paragraphs.length < 4 || caseData.paragraphs.length > 6) issues.push(issue(caseData.id, "paragraph-count", `${caseData.paragraphs.length}`));
  const wordCount = caseData.paragraphs.reduce((count, paragraph) => count + paragraph.text.trim().split(/\s+/u).length, 0);
  if (wordCount < 35 || wordCount > 70) issues.push(issue(caseData.id, "story-word-count", `${wordCount}`));
  if (caseData.candidateMindIds.length !== 4 || new Set(caseData.candidateMindIds).size !== 4) issues.push(issue(caseData.id, "candidate-mind-count", "4 unique candidates required"));
  if (caseData.evidenceCards.length < 5 || caseData.evidenceCards.length > 6) issues.push(issue(caseData.id, "evidence-count", `${caseData.evidenceCards.length}`));
  if (new Set(caseData.evidenceCards.map((card) => card.kind)).size < 2) issues.push(issue(caseData.id, "evidence-kind-count", "at least 2 kinds"));
  if (caseData.reviewedReadings.length < 2 || caseData.reviewedReadings.length > 3) issues.push(issue(caseData.id, "reading-count", `${caseData.reviewedReadings.length}`));
  const mindIds = new Set(registry.minds.map((mind) => mind.id));
  for (const mindId of caseData.candidateMindIds) {
    if (!mindIds.has(mindId)) issues.push(issue(caseData.id, "candidate-mind-reference", mindId));
  }
  if (new Set(caseData.reviewedReadings.map((reading) => reading.mindId)).size !== caseData.reviewedReadings.length) {
    issues.push(issue(caseData.id, "reviewed-mind-unique", "reviewed mind ids must be unique"));
  }
  const evidenceIds = caseData.evidenceCards.map((card) => card.id);
  const usedEvidence = new Set<string>();
  for (const reading of caseData.reviewedReadings) {
    if (!caseData.candidateMindIds.includes(reading.mindId)) issues.push(issue(caseData.id, "reviewed-mind-reference", reading.mindId));
    if (!explanationMatches(registry, reading.interpretationSummaryId, "interpretation-summary")) {
      issues.push(issue(caseData.id, "interpretation-summary-reference", reading.interpretationSummaryId));
    }
    if (reading.reviewedEvidencePairs.length < 2) issues.push(issue(caseData.id, "reviewed-pair-count", reading.id));
    const readingEvidence = new Set<string>();
    const normalizedPairs = new Set<string>();
    for (const pair of reading.reviewedEvidencePairs) {
      if (pair.evidenceCardIds.length !== 2 || pair.evidenceCardIds[0] === pair.evidenceCardIds[1]) {
        issues.push(issue(caseData.id, "pair-cardinality", pair.id));
        continue;
      }
      if (!pair.evidenceCardIds.every((id) => evidenceIds.includes(id))) {
        issues.push(issue(caseData.id, "pair-evidence-reference", pair.id));
        continue;
      }
      const canonical = canonicalizeEvidencePair(pair.evidenceCardIds, caseData);
      if (canonical[0] !== pair.evidenceCardIds[0] || canonical[1] !== pair.evidenceCardIds[1]) {
        issues.push(issue(caseData.id, "pair-order", pair.id));
      }
      const key = canonical.join("|");
      if (normalizedPairs.has(key)) issues.push(issue(caseData.id, "pair-unique-within-reading", pair.id));
      normalizedPairs.add(key);
      pair.evidenceCardIds.forEach((id) => { usedEvidence.add(id); readingEvidence.add(id); });
      pair.evidenceRationaleIds.forEach((id) => {
        if (!explanationMatches(registry, id, "evidence-rationale")) issues.push(issue(caseData.id, "evidence-rationale-reference", id));
      });
      if (pair.evidenceRationaleIds.length !== 2) issues.push(issue(caseData.id, "evidence-rationale-cardinality", pair.id));
      if (!explanationMatches(registry, pair.pairSummaryId, "evidence-pair-summary")) {
        issues.push(issue(caseData.id, "pair-summary-reference", pair.pairSummaryId));
      }
    }
    if (readingEvidence.size < 3) issues.push(issue(caseData.id, "reading-evidence-variety", reading.id));
  }
  if (usedEvidence.size === evidenceIds.length) issues.push(issue(caseData.id, "neutral-evidence-required", "at least one unused card"));
  if (!registry.reviewChecklistIds.includes(caseData.originality.reviewChecklistId)) issues.push(issue(caseData.id, "checklist-reference", caseData.originality.reviewChecklistId));
  if (!registry.sceneAssetIds.includes(caseData.sceneAssetId)) issues.push(issue(caseData.id, "scene-reference", caseData.sceneAssetId));
  if (caseData.originality.origin !== "original-for-this-app" || caseData.originality.externalSourceUrls.length !== 0 || !caseData.originality.createdAt) {
    issues.push(issue(caseData.id, "originality-metadata", "original static content required"));
  }
  return issues;
}

function collectEntityIds(bank: StoryBank) {
  const ids: string[] = [
    ...bank.registry.minds.map((item) => item.id),
    ...bank.registry.explanations.map((item) => item.id),
    ...bank.registry.reviewChecklistIds,
    ...bank.registry.sceneAssetIds,
  ];
  for (const item of [bank.tutorial, ...bank.cases]) {
    ids.push(item.id, ...item.paragraphs.map((entry) => entry.id), ...item.evidenceCards.map((entry) => entry.id));
    for (const reading of item.reviewedReadings) ids.push(reading.id, ...reading.reviewedEvidencePairs.map((pair) => pair.id));
  }
  return ids;
}

function findBannedFields(value: unknown, path = "bank"): string[] {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => [
    ...(BANNED_FIELD_PATTERN.test(key) ? [`${path}.${key}`] : []),
    ...findBannedFields(child, `${path}.${key}`),
  ]);
}

export function validateTextAnchors(caseData: StoryCase) { return validateAnchors(caseData); }

export function validateStoryBank(bank: StoryBank): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (bank.schemaVersion !== 1 || !bank.contentVersion) issues.push(issue("story-bank", "bank-version", "schema/content version"));
  if (bank.cases.length !== 6) issues.push(issue("story-bank", "case-count", `${bank.cases.length}`));
  if (bank.registry.minds.length < 12 || bank.registry.minds.length > 14) issues.push(issue("story-bank", "mind-count", `${bank.registry.minds.length}`));
  const allCases = [bank.tutorial, ...bank.cases];
  allCases.forEach((caseData) => issues.push(...validateCase(caseData, bank.registry)));
  const actualIds = allCases.map((item) => item.id);
  actualIds.forEach((id, index) => {
    if (id !== FIXED_IDS[index] || allCases[index].order !== index) issues.push(issue(id, "fixed-story-order", `expected ${FIXED_IDS[index]} at ${index}`));
  });
  const entityIds = collectEntityIds(bank);
  const duplicates = entityIds.filter((id, index) => entityIds.indexOf(id) !== index);
  for (const id of new Set(duplicates)) issues.push(issue("story-bank", "global-id-unique", id));
  for (const path of findBannedFields(bank)) issues.push(issue("story-bank", "forbidden-field", path));
  return issues;
}
