import { ArrowIcon, BookIcon, SearchIcon } from "./Icons";

interface StartScreenProps {
  onTutorial: () => void;
  onSkipTutorial: () => void;
}

export function StartScreen({ onTutorial, onSkipTutorial }: StartScreenProps) {
  return (
    <section className="start-screen" aria-labelledby="start-title">
      <div className="start-copy">
        <SearchIcon size={58} className="start-mark" />
        <h1 id="start-title">마음은 하나로만 읽히지 않아요</h1>
        <p>
          이야기 속 말과 행동, 표정을 단서로 모아 인물의 마음을 짐작해 보세요.
          같은 장면에도 여러 해석이 생길 수 있어요.
        </p>
        <div className="start-actions">
          <button className="button button-primary" type="button" onClick={onTutorial}>
            연습 사건 시작
            <ArrowIcon />
          </button>
          <button className="button button-secondary" type="button" onClick={onSkipTutorial}>
            바로 여섯 사건 시작
          </button>
        </div>
      </div>
      <div className="start-notebook" aria-label="수사 방법 세 단계">
        <div className="paper-tab"><BookIcon /> 수사 노트</div>
        <ol>
          <li><span>1</span><div><strong>이야기 읽기</strong><p>마음을 살필 장면을 찾아요.</p></div></li>
          <li><span>2</span><div><strong>마음 고르기</strong><p>인물의 마음이나 생각을 골라요.</p></div></li>
          <li><span>3</span><div><strong>단서 연결하기</strong><p>서로 다른 단서 카드 두 장을 연결해요.</p></div></li>
        </ol>
        <p className="notebook-note">연습 사건은 여섯 사건 기록에 들어가지 않아요.</p>
      </div>
    </section>
  );
}
