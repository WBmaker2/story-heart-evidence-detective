# GitHub Pages 공개 배포 계획

## 목표

현재 검증된 교육용 웹앱을 `WBmaker2/story-heart-evidence-detective` 공개 저장소에 게시하고, GitHub Actions가 정적 내보내기를 생성하여 GitHub Pages에 자동 배포하도록 구성합니다.

## 구현 방식

1. 기존 vinext/Sites 빌드는 그대로 유지합니다.
2. GitHub Pages 전용 `next build` 정적 내보내기 스크립트를 추가합니다.
3. Pages 빌드에서만 `output: "export"`, 저장소 하위 경로용 `basePath`, `trailingSlash`를 적용합니다.
4. GitHub 공식 Pages Actions(`configure-pages`, `upload-pages-artifact`, `deploy-pages`)로 `out/`을 배포합니다.
5. `main` 푸시와 수동 실행에서 워크플로가 동작하게 합니다.

## 검증

- 기존 `npm run verify`가 계속 통과해야 합니다.
- `npm run build:pages`가 `out/index.html`, 정적 자산, 하위 경로가 반영된 파비콘을 생성해야 합니다.
- GitHub Actions 실행 성공 뒤 Pages 주소가 HTTP 200을 반환하는지 확인합니다.
- 저장소 파일과 Pages HTML에 개인정보·브라우저 저장소·외부 API가 추가되지 않았는지 기존 릴리스 게이트로 확인합니다.

## 배포 결과

- 저장소: `https://github.com/WBmaker2/story-heart-evidence-detective`
- Pages: `https://wbmaker2.github.io/story-heart-evidence-detective/`
