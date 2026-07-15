import { storyBank } from "../app/content/story-bank.ts";
import { validateStoryBank } from "../app/domain/story-validator.ts";

const issues = validateStoryBank(storyBank);
if (issues.length) {
  for (const item of issues) console.error(`${item.caseId}: ${item.rule} — ${item.detail}`);
  process.exitCode = 1;
} else {
  console.log("Story bank validation passed: tutorial + 6 fixed cases.");
}
