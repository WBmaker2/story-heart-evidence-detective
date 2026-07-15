import { auditProductSource, collectSourceFiles, printAuditIssues } from "./release-audit.ts";

const files = (await collectSourceFiles(process.cwd())).filter((file) =>
  /^(?:app|public|worker)\//.test(file.path) || /^(?:next|vite)\.config\./.test(file.path),
);
const issues = auditProductSource(files);

if (issues.length) {
  printAuditIssues(issues);
  process.exitCode = 1;
} else {
  console.log("Static release validation passed: privacy, network, wording, and starter constraints are clean.");
}
