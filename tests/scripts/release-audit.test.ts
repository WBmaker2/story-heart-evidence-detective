import assert from "node:assert/strict";
import test from "node:test";
import {
  auditFileLengths,
  auditProductSource,
  type TextSourceFile,
} from "../../scripts/release-audit.ts";

const file = (path: string, text: string): TextSourceFile => ({ path, text });

test("file-length audit rejects 500 lines because source files must stay under 500", () => {
  assert.deepEqual(auditFileLengths([file("app/short.ts", "line\n".repeat(499))]), []);
  assert.equal(auditFileLengths([file("app/long.ts", "line\n".repeat(500))])[0]?.rule, "file-length");
});

test("product audit detects privacy, network, student wording, and starter regressions", () => {
  const issues = auditProductSource([
    file("app/components/Result.tsx", "export const label = '정답 점수';"),
    file("app/features/save.ts", "localStorage.setItem('answer', '1');"),
    file("app/features/load.ts", "fetch('https://example.com/data');"),
    file("app/chatgpt-auth.ts", "export const header = 'oai-authenticated-user-email';"),
  ]);

  assert.deepEqual(
    new Set(issues.map((issue) => issue.rule)),
    new Set([
      "forbidden-student-wording",
      "privacy-storage",
      "external-runtime-request",
      "starter-marker",
    ]),
  );
});

test("product audit rejects Next server cookie access", () => {
  const issues = auditProductSource([
    file("app/api/cookie-store.ts", "import { cookies } from 'next/headers'; await cookies();"),
    file("app/api/cookie-header.ts", "request.headers.get('Cookie');"),
    file("app/api/next-cookie-header.ts", "const value = (await headers()).get('cookie');"),
  ]);

  assert.deepEqual(
    issues.map((issue) => [issue.path, issue.rule]),
    [
      ["app/api/cookie-store.ts", "privacy-cookie"],
      ["app/api/cookie-header.ts", "privacy-cookie"],
      ["app/api/next-cookie-header.ts", "privacy-cookie"],
    ],
  );
});

test("product audit rejects worker external requests and URLs", () => {
  const issues = auditProductSource([
    file("worker/global-fetch.ts", "return fetch('https://example.com/data');"),
    file("worker/service-fetch.ts", "return env.REMOTE.fetch(request);"),
    file("worker/external-url.ts", "const endpoint = new URL('https://example.com/data');"),
    file(
      "worker/unguarded-asset.ts",
      "return env.ASSETS.fetch(new Request(new URL(path, request.url)));",
    ),
  ]);

  assert.deepEqual(
    issues.map((issue) => [issue.path, issue.rule]),
    [
      ["worker/global-fetch.ts", "external-runtime-request"],
      ["worker/service-fetch.ts", "external-runtime-request"],
      ["worker/external-url.ts", "external-runtime-request"],
      ["worker/unguarded-asset.ts", "external-runtime-request"],
    ],
  );
});

test("product audit rejects D1 and Drizzle starter scaffolding", () => {
  const issues = auditProductSource([
    file("db/index.ts", "import { drizzle } from 'drizzle-orm/d1';"),
    file("examples/d1/app/api/notes/route.ts", "export async function POST() {}"),
    file("drizzle/meta/_journal.json", "{}"),
    file("vite.config.ts", "const database_name = 'site-creator-d1';"),
    file("package.json", "{\"dependencies\":{\"drizzle-orm\":\"1.0.0\"}}"),
    file(".openai/hosting.json", "{\"d1\":\"DB\",\"r2\":null}"),
  ]);

  assert.equal(issues.length, 6);
  assert.ok(issues.every((issue) => issue.rule === "starter-marker"));
});

test("product audit accepts local in-memory code and required same-origin worker fetches", () => {
  const issues = auditProductSource([
    file("app/components/Result.tsx", "export const label = '다른 생각도 가능해요';"),
    file("app/features/state.ts", "export const next = (value: number) => value + 1;"),
    file(
      "worker/index.ts",
      [
        "async function fetchSameOriginAsset(path: string, request: Request, env: Env) {",
        "const requestUrl = new URL(request.url);",
        "const assetUrl = new URL(path, requestUrl);",
        "if (assetUrl.origin !== requestUrl.origin) return new Response('Not found');",
        "return env.ASSETS.fetch(new Request(assetUrl));",
        "}",
        "handler.fetch(request, env, ctx);",
      ].join(" "),
    ),
    file(".openai/hosting.json", "{\"d1\":null,\"r2\":null}"),
  ]);

  assert.deepEqual(issues, []);
});

test("one guarded asset fetch cannot hide another unguarded asset fetch", () => {
  const issues = auditProductSource([
    file(
      "worker/mixed-asset-fetches.ts",
      [
        "async function fetchSameOriginAsset(path: string, request: Request, env: Env) {",
        "  const requestUrl = new URL(request.url);",
        "  const assetUrl = new URL(path, requestUrl);",
        "  if (assetUrl.origin !== requestUrl.origin) return new Response('Not found');",
        "  return env.ASSETS.fetch(new Request(assetUrl));",
        "}",
        "export function unsafe(path: string, request: Request, env: Env) {",
        "  const assetUrl = new URL(path, request.url);",
        "  return env.ASSETS.fetch(new Request(assetUrl));",
        "}",
      ].join("\n"),
    ),
  ]);

  assert.deepEqual(
    issues.map((issue) => [issue.path, issue.rule]),
    [["worker/mixed-asset-fetches.ts", "external-runtime-request"]],
  );
});
