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

test("product audit accepts local, scoreless, in-memory interaction code", () => {
  const issues = auditProductSource([
    file("app/components/Result.tsx", "export const label = '다른 생각도 가능해요';"),
    file("app/features/state.ts", "export const next = (value: number) => value + 1;"),
  ]);

  assert.deepEqual(issues, []);
});
