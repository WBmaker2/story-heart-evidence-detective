import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";

export interface TextSourceFile {
  path: string;
  text: string;
}

export interface AuditIssue {
  path: string;
  rule: "file-length" | "privacy-storage" | "external-runtime-request" | "forbidden-student-wording" | "starter-marker";
  detail: string;
}

const SOURCE_EXTENSIONS = new Set([".cjs", ".css", ".cts", ".js", ".jsx", ".mjs", ".mts", ".svg", ".ts", ".tsx"]);
const SKIPPED_DIRECTORIES = new Set([".git", ".next", ".wrangler", "dist", "node_modules"]);
const STORAGE_PATTERN = /\b(?:localStorage|sessionStorage|indexedDB|cookieStore)\b|document\s*\.\s*cookie|\bSet-Cookie\b/i;
const NETWORK_PATTERN = /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*(?:\(|\.)|navigator\s*\.\s*sendBeacon|https?:\/\/(?!app\.local\b)/i;
const STUDENT_WORDING_PATTERN = /정답|오답|점수|정답률|성공률|correct\s+answer|wrong\s+answer|\bscore\b/iu;
const STARTER_PATTERN = /codex-preview|react-loading-skeleton|Your site is taking shape|vinext-starter template|oai-authenticated-user|signin-with-chatgpt|signout-with-chatgpt/i;
const STARTER_ASSET_PATTERN = /(?:^|\/)(?:file|globe|window)\.svg$/i;

function sourceLineCount(text: string): number {
  if (!text) return 0;
  return text.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").length;
}

export function auditFileLengths(files: readonly TextSourceFile[], limit = 500): AuditIssue[] {
  return files.flatMap((file) => {
    const lines = sourceLineCount(file.text);
    return lines >= limit
      ? [{ path: file.path, rule: "file-length" as const, detail: `${lines} lines; expected fewer than ${limit}` }]
      : [];
  });
}

export function auditProductSource(files: readonly TextSourceFile[]): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const file of files) {
    const isAppSource = file.path.startsWith("app/");
    const isStudentCopy = /^app\/(?:components|content|features)\//.test(file.path);
    if (isAppSource && STORAGE_PATTERN.test(file.text)) {
      issues.push({ path: file.path, rule: "privacy-storage", detail: "browser storage or cookie API" });
    }
    if (isAppSource && NETWORK_PATTERN.test(file.text)) {
      issues.push({ path: file.path, rule: "external-runtime-request", detail: "network API or external URL" });
    }
    if (isStudentCopy && STUDENT_WORDING_PATTERN.test(file.text)) {
      issues.push({ path: file.path, rule: "forbidden-student-wording", detail: "score or correct-answer wording" });
    }
    if (STARTER_PATTERN.test(file.text) || STARTER_ASSET_PATTERN.test(file.path)) {
      issues.push({ path: file.path, rule: "starter-marker", detail: "starter UI, metadata, or asset marker" });
    }
  }
  return issues;
}

export async function collectSourceFiles(root: string): Promise<TextSourceFile[]> {
  const files: TextSourceFile[] = [];
  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name)) continue;
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name))) {
        files.push({
          path: relative(root, absolutePath).split(sep).join("/"),
          text: await readFile(absolutePath, "utf8"),
        });
      }
    }
  }
  await visit(root);
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

export function printAuditIssues(issues: readonly AuditIssue[]): void {
  for (const issue of issues) console.error(`${issue.path}: ${issue.rule} — ${issue.detail}`);
}
