import { auditFileLengths, collectSourceFiles, printAuditIssues } from "./release-audit.ts";

const files = await collectSourceFiles(process.cwd());
const issues = auditFileLengths(files);

if (issues.length) {
  printAuditIssues(issues);
  process.exitCode = 1;
} else {
  console.log(`File-length validation passed: ${files.length} source/style/script/SVG files are under 500 lines.`);
}
