import { auditProductSource, collectReleaseFiles, printAuditIssues } from "./release-audit.ts";

const files = (await collectReleaseFiles(process.cwd())).filter((file) =>
  /^(?:app|public|worker|build|db|examples\/d1|drizzle|types)\//.test(file.path)
  || /^(?:drizzle|next|vite)\.config\./.test(file.path)
  || /^(?:package(?:-lock)?\.json|\.openai\/hosting\.json)$/.test(file.path),
);
const issues = auditProductSource(files);

if (issues.length) {
  printAuditIssues(issues);
  process.exitCode = 1;
} else {
  console.log("Static release validation passed: privacy, network, wording, and starter constraints are clean.");
}
