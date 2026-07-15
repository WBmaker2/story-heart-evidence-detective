import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";

export interface TextSourceFile {
  path: string;
  text: string;
}

export interface AuditIssue {
  path: string;
  rule: "file-length" | "privacy-storage" | "privacy-cookie" | "external-runtime-request" | "forbidden-student-wording" | "starter-marker";
  detail: string;
}

const SOURCE_EXTENSIONS = new Set([".cjs", ".css", ".cts", ".js", ".jsx", ".mjs", ".mts", ".svg", ".ts", ".tsx"]);
const RELEASE_EXTENSIONS = new Set([...SOURCE_EXTENSIONS, ".json"]);
const SKIPPED_DIRECTORIES = new Set([".git", ".next", ".wrangler", "dist", "node_modules"]);
const STORAGE_PATTERN = /\b(?:localStorage|sessionStorage|indexedDB|cookieStore)\b|document\s*\.\s*cookie/i;
const COOKIE_PATTERN = /\bcookies\s*\(|(?:\bheaders\s*\(|\.headers)[\s\S]{0,120}\.get\s*\(\s*["']cookie["']|["']?(?:cookie|set-cookie)["']?\s*:/i;
const NETWORK_PATTERN = /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*(?:\(|\.)|navigator\s*\.\s*sendBeacon|https?:\/\//i;
const STUDENT_WORDING_PATTERN = /정답|오답|점수|정답률|성공률|correct\s+answer|wrong\s+answer|\bscore\b/iu;
const STARTER_PATTERN = /codex-preview|react-loading-skeleton|Your site is taking shape|vinext-starter template|oai-authenticated-user|signin-with-chatgpt|signout-with-chatgpt|site-creator-(?:d1|r2)|SITE_CREATOR_PLACEHOLDER_DATABASE_ID|cloudflare:workers|\bdrizzle(?:-orm|-kit)?\b/i;
const STARTER_ASSET_PATTERN = /(?:^|\/)(?:file|globe|window)\.svg$/i;
const STARTER_PATH_PATTERN = /^(?:db|examples\/d1|drizzle)(?:\/|$)|^drizzle\.config\./i;
const ALLOWED_WORKER_FETCHES = [
  /handler\s*\.\s*fetch\s*\(\s*request\s*,\s*env\s*,\s*ctx\s*\)/g,
  /\basync\s+fetch\s*\(/g,
  /\bASSETS\s*:\s*\{\s*fetch\s*\(/g,
];
const SAME_ORIGIN_ASSET_FETCH = /env\s*\.\s*ASSETS\s*\.\s*fetch\s*\(\s*new\s+Request\s*\(\s*assetUrl\s*\)\s*\)/g;

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
    const isWorkerSource = file.path.startsWith("worker/");
    const isRuntimeSource = isAppSource || isWorkerSource;
    const isStudentCopy = /^app\/(?:components|content|features)\//.test(file.path);
    if (isAppSource && STORAGE_PATTERN.test(file.text)) {
      issues.push({ path: file.path, rule: "privacy-storage", detail: "browser storage or cookie API" });
    }
    if (isRuntimeSource && COOKIE_PATTERN.test(file.text)) {
      issues.push({ path: file.path, rule: "privacy-cookie", detail: "server cookie API or Cookie header" });
    }
    const networkText = isWorkerSource ? removeAllowedWorkerFetches(file.text) : file.text;
    if (isRuntimeSource && NETWORK_PATTERN.test(networkText)) {
      issues.push({ path: file.path, rule: "external-runtime-request", detail: "network API or external URL" });
    }
    if (isStudentCopy && STUDENT_WORDING_PATTERN.test(file.text)) {
      issues.push({ path: file.path, rule: "forbidden-student-wording", detail: "score or correct-answer wording" });
    }
    const hasUnexpectedHostingBinding = file.path === ".openai/hosting.json" && !hasNullHostingBindings(file.text);
    if (STARTER_PATTERN.test(file.text) || STARTER_ASSET_PATTERN.test(file.path) || STARTER_PATH_PATTERN.test(file.path) || hasUnexpectedHostingBinding) {
      issues.push({ path: file.path, rule: "starter-marker", detail: "starter UI, metadata, or asset marker" });
    }
  }
  return issues;
}

function removeAllowedWorkerFetches(text: string): string {
  let sanitized = ALLOWED_WORKER_FETCHES.reduce((value, pattern) => value.replace(pattern, ""), text);
  const hasSameOriginGuard = /new\s+URL\s*\(\s*request\s*\.\s*url\s*\)/.test(text)
    && /new\s+URL\s*\(\s*path\s*,\s*requestUrl\s*\)/.test(text)
    && /assetUrl\s*\.\s*origin\s*!==\s*requestUrl\s*\.\s*origin/.test(text);
  if (hasSameOriginGuard) sanitized = sanitized.replace(SAME_ORIGIN_ASSET_FETCH, "");
  return sanitized;
}

function hasNullHostingBindings(text: string): boolean {
  try {
    const config = JSON.parse(text) as { d1?: unknown; r2?: unknown };
    return config.d1 === null && config.r2 === null;
  } catch {
    return false;
  }
}

async function collectTextFiles(root: string, extensions: ReadonlySet<string>): Promise<TextSourceFile[]> {
  const files: TextSourceFile[] = [];
  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name)) continue;
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else if (entry.isFile() && extensions.has(extname(entry.name))) {
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

export function collectSourceFiles(root: string): Promise<TextSourceFile[]> {
  return collectTextFiles(root, SOURCE_EXTENSIONS);
}

export function collectReleaseFiles(root: string): Promise<TextSourceFile[]> {
  return collectTextFiles(root, RELEASE_EXTENSIONS);
}

export function printAuditIssues(issues: readonly AuditIssue[]): void {
  for (const issue of issues) console.error(`${issue.path}: ${issue.rule} — ${issue.detail}`);
}
