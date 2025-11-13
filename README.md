# 프로젝트 구성

    Vue 3 + TypeScript + Vite

## 설치 및 실행

### 의존성 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

## 다국어 코드 추출

프로젝트에서 사용되는 다국어 코드를 엑셀 파일로 정리할 수 있습니다.

### 전체 다국어 코드 추출
```bash
# 전체 다국어 코드를 엑셀 파일로 추출
node scripts/extract-i18n.mjs
```

생성된 파일:
- `public/i18n-list.xlsx` - 모든 다국어 코드 (한글 시트, 영어 시트 포함)
- 접근 URL: `http://localhost:5173/i18n-list.xlsx`

### Validation 및 Messages 코드만 추출
현재 스크립트는 `validation.` 또는 `messages.`로 시작하는 다국어 코드만 추출하도록 설정되어 있습니다.

생성된 파일:
- `public/i18n-validation-messages.xlsx` - validation, messages 관련 코드만 (한글 시트, 영어 시트 포함)
- 접근 URL: `http://localhost:5173/i18n-validation-messages.xlsx`

### 엑셀 파일 구조
각 엑셀 파일은 다음 구조로 생성됩니다:

**한글 시트:**
- 화면명: Vue 파일 경로 (예: `project/CreateNewProject`)
- 순번: 화면별 순번
- 코드: 다국어 코드 (예: `validation.usernameRequired`)
- 코드에 대한 값: 한글 번역 값

**영어 시트:**
- 화면명: Vue 파일 경로
- 순번: 화면별 순번
- 코드: 다국어 코드
- 코드에 대한 값: 영어 번역 값

### 필터링 옵션 변경
`scripts/extract-i18n.mjs` 파일에서 필터링 조건을 수정할 수 있습니다:

```javascript
// validation 또는 messages로 시작하는 코드만 필터링
const filteredCodes = codes.filter(
  (code) => code.startsWith("validation.") || code.startsWith("messages.")
);
```

필터를 제거하려면 위 코드를 주석 처리하고 다음 코드를 사용하세요:
```javascript
const filteredCodes = codes; // 모든 코드 추출
```

## 다국어 지원(i18n) 유지보수 관련 참고

    src\i18n\language\다국어 개발 및 유지보수 관련.md
