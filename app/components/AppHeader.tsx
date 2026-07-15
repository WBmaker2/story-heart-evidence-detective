"use client";

import { useState } from "react";

import { updateHistory } from "../content/update-history.ts";
import { AccessibleDialog } from "./AccessibleDialog";
import { ResetIcon, SearchIcon } from "./Icons";

interface AppHeaderProps { onReset: () => void }

export function AppHeader({ onReset }: AppHeaderProps) {
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <a className="brand" href="#main-content" aria-label="이야기 마음 근거 수사대 본문으로 이동">
          <SearchIcon size={30} />
          <span>이야기 마음 근거 수사대</span>
        </a>
        <div className="header-actions">
          <button className="utility-button" type="button" onClick={() => setUpdatesOpen(true)}>
            업데이트 내역
          </button>
          <button className="utility-button" type="button" onClick={() => setResetOpen(true)}>
            <ResetIcon />
            처음부터
          </button>
        </div>
      </header>

      <AccessibleDialog
        open={updatesOpen}
        title="업데이트 내역"
        description="앱을 만든 날과 달라진 내용을 확인할 수 있어요."
        onClose={() => setUpdatesOpen(false)}
      >
        <ol className="update-list">
          {updateHistory.map((entry) => (
            <li key={`${entry.date}-${entry.version}`}>
              <div><strong>{entry.version}</strong><span>{entry.kind}</span></div>
              <time dateTime={entry.date}>{entry.date}</time>
              <p>{entry.summary}</p>
            </li>
          ))}
        </ol>
        <button className="button button-secondary dialog-action" type="button" onClick={() => setUpdatesOpen(false)}>
          확인했어요
        </button>
      </AccessibleDialog>

      <AccessibleDialog
        open={resetOpen}
        title="처음부터 다시 시작할까요?"
        description="지금까지 살펴본 사건 기록은 이 화면에서 사라져요."
        onClose={() => setResetOpen(false)}
      >
        <div className="dialog-actions">
          <button className="button button-secondary" type="button" onClick={() => setResetOpen(false)}>
            계속 살펴보기
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={() => {
              onReset();
              setResetOpen(false);
            }}
          >
            처음부터 시작
          </button>
        </div>
      </AccessibleDialog>
    </>
  );
}
