# CLAUDE.md — GenUI 기반 고등학생 수학 문제 맞춤형 시각화 학습 시스템

> 이 파일은 Claude Code가 프로젝트 전반을 이해하고 일관되게 개발할 수 있도록 작성된 가이드입니다.

---

## 프로젝트 개요

**과제명:** GenUI 기반 고등학생 수학 문제 맞춤형 시각화 학습 시스템
**제출자:** 최미나 (인공지능공학부 2316350)
**소속:** AI Vision Lab, 숙명여자대학교

### 핵심 목표

고등학교 수학 문제 스크린샷(PNG)을 업로드하면:
1. Claude Vision API로 문제를 인식하고 유형을 자동 분류
2. 학생이 어떤 부분에서 막히는지 객관식 버튼으로 진단
3. 문제 유형과 어려움 유형에 맞는 시각화 UI를 동적으로 생성

### 기존 LLM과의 차이점

기존 Claude는 텍스트+수식 중심의 일괄적인 풀이를 제공하지만, 이 프로젝트는:
- 학생이 어디서 막히는지를 먼저 진단한 뒤 맞춤 설명 제공
- 문제 유형별로 다른 시각화 방식 적용 (그래프, 애니메이션, 단계별 수식)
- 정답 직접 제공 대신 학생 스스로 생각할 기회를 주는 UI 설계

---

## 개발 환경

- **OS:** macOS
- **언어:** TypeScript
- **프론트엔드 빌드 도구:** Vite (React)
- **백엔드 프레임워크:** Express
- **패키지 매니저:** npm
- **구조:** client / server 분리 (모노레포 형태)

---

## 기술 스택

### Frontend (client)

| 역할 | 라이브러리/API | 비고 |
|------|--------------|------|
| UI 프레임워크 | React + TypeScript | Vite로 세팅 |
| 스타일링 | Tailwind CSS | |
| 수식 렌더링 | KaTeX | 브라우저 직접 실행 |
| 함수 그래프 시각화 | Desmos API | script 태그로 로드 |
| 활용문제 애니메이션 | Framer Motion + SVG | React 컴포넌트 내 직접 제어 |

### Backend (server)

| 역할 | 라이브러리/API | 비고 |
|------|--------------|------|
| 서버 프레임워크 | Express | Claude API 보호용 프록시 |
| AI 이미지 인식 + 풀이 생성 | Claude API (claude-haiku-4-5-20251001) | Vision 포함 |

### 모델 선택 이유

- `claude-haiku-4-5-20251001`: 실시간 피드백이 필요한 앱이므로 속도와 비용 효율 우선
- 수식 인식 정확도가 부족한 경우 `claude-sonnet-4-6`으로 업그레이드 예정

---

## 아키텍처 설계 원칙

### 왜 server를 분리하는가

Claude API 키를 클라이언트에 두면 브라우저에 노출되어 누구나 탈취할 수 있다.
따라서 별도의 Express 서버를 두고, 클라이언트는 자체 서버의 `/api/analyze`만 호출한다.
Claude API 호출과 키 관리는 전적으로 서버에서만 이루어진다.

이 구조의 이점:
- API 키가 서버 환경변수에만 머무름 (브라우저 노출 없음)
- 프롬프트(`prompts/`)와 응답 스키마(`schemas/`)를 클라이언트와 분리해 관리
- 프롬프트 로직을 한 곳에서 체계적으로 관리 → "Gen AI 모델을 잘 활용하였는가" 평가에 유리

### 서버는 얇게 유지한다

본 프로젝트는 실시간 애플리케이션이므로 (Haiku 선택 이유와 동일) 지연을 최소화해야 한다.
서버는 단순 프록시 역할로 얇게 유지하고, claudeService는 불필요한 가공 없이
Claude 응답을 클라이언트에 그대로 전달하는 것을 원칙으로 한다.

---

## 프로젝트 디렉토리 구조

```
genui-math/
├── CLAUDE.md
├── README.md
├── .gitignore
├── package.json                  # 루트 (workspace 또는 스크립트 통합용)
│
├── client/                       # React 웹 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUploader.tsx      # PNG 업로드 + 미리보기
│   │   │   ├── DifficultySurvey.tsx   # 어려움 유형 선택 객관식 버튼
│   │   │   ├── ResultLayout.tsx       # 유형에 따라 시각화 뷰 선택
│   │   │   └── visualizers/
│   │   │       ├── FormulaView.tsx    # 단순 수식형 — KaTeX 단계별 풀이
│   │   │       ├── GraphView.tsx      # 함수·그래프형 — Desmos 그래프
│   │   │       └── AnimationView.tsx  # 활용문제형 — Motion+SVG 애니메이션
│   │   ├── hooks/
│   │   │   └── useProblemAnalysis.ts  # 서버 /api/analyze 호출
│   │   ├── types/
│   │   │   └── math.ts                # 문제 유형, 어려움 유형, 응답 타입
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                       # Claude API 보호용 백엔드
│   ├── src/
│   │   ├── routes/
│   │   │   └── analyze.ts             # /api/analyze 라우트
│   │   ├── services/
│   │   │   └── claudeService.ts       # Claude Vision + API 호출
│   │   ├── prompts/
│   │   │   └── mathPrompt.ts          # 문제 인식/풀이 프롬프트
│   │   ├── schemas/
│   │   │   └── mathSchema.ts          # 응답 JSON 스키마
│   │   └── index.ts                   # Express 진입점
│   ├── .env                           # API 키 (git 제외)
│   ├── .env.example                   # 키 없는 예시 (git 포함)
│   └── package.json
│
├── docs/
│   ├── proposal.pdf
│   ├── report.md
│   └── screenshots/
│
└── examples/
    └── sample-problems/               # 테스트용 수학 문제 PNG
```

---

## 전체 파이프라인

```
[client] PNG 업로드 (ImageUploader)
    ↓
[client] useProblemAnalysis → server /api/analyze 호출
    ↓
[server] claudeService — Claude Vision: 이미지 → 문제 텍스트 추출 + 유형 분류
    ↓
[client] ResultLayout — 문제 유형 분기
    ↓
[client] DifficultySurvey — 학생이 어려움 유형 선택
    ↓
[server] claudeService — 어려움 유형 반영 + CoT 단계별 풀이 + 시각화 JSON 생성
    ↓
[client] 유형별 시각화 컴포넌트 렌더링
    ├── 단순 수식형  → FormulaView (KaTeX)
    ├── 함수·그래프형 → GraphView (Desmos)
    └── 활용문제형  → AnimationView (Motion+SVG)
    ↓
학생 맞춤 UI 출력
```

---

## 문제 유형 분류

고등학교 수학 문제를 아래 3가지로 분류한다.

| 유형 | 설명 | 시각화 방식 |
|------|------|------------|
| `formula` | 방정식·부등식 등 직접 계산하는 문제 | KaTeX 단계별 수식 |
| `graph` | 함수의 형태와 관계를 시각적으로 이해해야 하는 문제 | Desmos 인터랙티브 그래프 |
| `application` | 문제 상황을 해석하고 수식으로 모델링하는 문제 | Framer Motion + SVG 애니메이션 |

---

## 어려움 유형 분류

학생이 선택하는 어려움 유형 (DifficultySurvey 컴포넌트에서 사용):

| 코드 | 설명 |
|------|------|
| `understanding` | 문제 자체가 무슨 말인지 모르겠음 |
| `strategy` | 문제는 이해하지만 어떻게 풀지 모르겠음 |
| `midway` | 풀이 중간까지는 됐는데 이후를 모르겠음 |
| `visual` | 시각적으로 이해가 필요함 |

---

## Claude API 사용 규칙 (server에서만 호출)

### 환경변수 (server/.env)

```
ANTHROPIC_API_KEY=여기에_API_키_입력
PORT=3001
```

`server/.env` 파일에 위 내용을 추가한다. 이 파일은 `.gitignore`에 반드시 포함시킨다.
`server/.env.example`에는 키 없이 변수명만 남겨서 git에 포함시킨다.

### API 호출 기본 형태 (server/services/claudeService.ts)

서버에서 호출하므로 `anthropic-dangerous-direct-browser-calls` 헤더는 필요 없다.

```typescript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": process.env.ANTHROPIC_API_KEY!,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  },
  body: JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    messages: [...],
  }),
});
```

### API 호출 단계 (총 2회 요청, 서버 경유)

**1단계 — 이미지 인식 + 유형 분류**
- 입력: Base64 PNG 이미지
- 출력: `{ problemType, problemText, latex }` JSON
- 프롬프트: 문제 텍스트 추출, 유형 분류, 수식은 LaTeX로 변환

**2단계 — 어려움 유형 반영 + CoT 풀이 + 시각화 JSON 생성**
- 입력: 문제 텍스트 + 문제 유형 + 학생이 선택한 `difficultyType`
- 출력: `{ steps: [...], visualData: {...} }` JSON
  - `steps`: 단계별 풀이 (KaTeX용)
  - `visualData`: 그래프 수식, 강조 구간, 애니메이션 요소 등

### 이미지 토큰 비용 참고

- 아이패드 스크린샷 기준 해상도: 2360×1640 → API 자동 리사이즈 → 1568×1091
- 토큰 수: 약 2,281토큰 / Haiku 4.5 기준 약 $0.00023/장

---

## Desmos API 사용 규칙 (client)

- **라이센스:** 비상업적 학교 프로젝트는 무료 키 사용 가능
- **로드 방식:** npm 패키지 없음 → `client/index.html`에 script 태그로 직접 로드

```html
<!-- client/index.html -->
<script src="https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"></script>
```

- 위 키는 데모 키이며, 실제 제출 전 Desmos 사이트에서 무료 키를 발급받아 교체한다.
- `GraphView.tsx`에서 `useRef`로 div를 참조하여 `Desmos.GraphingCalculator(el)`로 초기화한다.
- 서버가 반환한 `visualData.expression`을 `calculator.setExpression()`으로 주입한다.

---

## 컴포넌트별 구현 지침

### client/components/ImageUploader.tsx

- PNG 파일만 허용 (accept="image/png")
- 파일을 FileReader로 읽어 Base64로 변환
- 업로드 후 이미지 미리보기 표시
- Base64 데이터를 useProblemAnalysis로 전달

### client/components/DifficultySurvey.tsx

- 문제 유형이 결정된 뒤에만 렌더링
- 4개 버튼: 문제 이해 / 풀이 전략 / 풀이 중간 / 시각적 이해
- 선택된 버튼은 강조 표시, 선택 후 2단계 분석 요청 트리거

### client/components/ResultLayout.tsx

- 서버 응답의 `problemType`에 따라 적절한 시각화 뷰 선택
- `formula` → FormulaView / `graph` → GraphView / `application` → AnimationView
- 분기 로직만 담당하고 실제 렌더링은 각 View에 위임

### client/components/visualizers/FormulaView.tsx (단순 수식형)

- 서버가 반환한 `steps` 배열을 순서대로 렌더링
- 각 단계는 설명 텍스트 + KaTeX 수식으로 구성
- `react-katex`의 `BlockMath` 컴포넌트 사용

### client/components/visualizers/GraphView.tsx (함수·그래프형)

- `useEffect`에서 Desmos 계산기 초기화
- 서버가 반환한 함수식과 정의역을 `calculator.setExpression()`으로 주입
- 슬라이더, 교점 강조 등 Desmos 기본 기능 활용

### client/components/visualizers/AnimationView.tsx (활용문제형)

- Framer Motion의 `motion` 컴포넌트와 SVG를 조합
- 서버가 반환한 `visualData`의 애니메이션 요소를 기반으로 단계별 상황 표현
- `useState`로 현재 단계를 관리하고 버튼으로 단계 전환

### client/hooks/useProblemAnalysis.ts

- 서버의 `/api/analyze` 엔드포인트 호출 담당
- 1단계(이미지 분석)와 2단계(풀이 생성) 요청을 함수로 분리
- 로딩/에러 상태 관리

### server/routes/analyze.ts

- `POST /api/analyze` 라우트 정의
- 요청 본문에서 이미지(Base64) 또는 분석 파라미터를 받아 claudeService로 전달

### server/services/claudeService.ts

- Claude API 호출 로직 집중
- mathPrompt의 프롬프트와 mathSchema의 스키마를 사용
- Claude 응답을 가공 없이 클라이언트로 반환

---

## 개발 순서 (권장)

1. **Vite React 웹 프로젝트 생성** — client 디렉토리, Tailwind 세팅
2. **이미지 업로드 + 미리보기 구현** — ImageUploader, Base64 변환
3. **Express 서버 생성** — server 디렉토리, index.ts, .env 구성
4. **React → server 요청 연결** — useProblemAnalysis로 /api/analyze 호출
5. **server → Claude API 호출 연결** — claudeService, mathPrompt
6. **Claude 응답 JSON 타입 정의** — types/math.ts, schemas/mathSchema.ts
7. **FormulaView 먼저 구현** — KaTeX 단계별 풀이 (가장 단순)
8. **GraphView 구현** — Desmos API 연동
9. **AnimationView 마지막에 구현** — Motion+SVG (가장 복잡)

---

## 주의사항

- `server/.env` 파일은 절대 git에 커밋하지 않는다.
- Claude API는 **서버에서만** 호출한다. 클라이언트는 자체 서버의 `/api/analyze`만 호출한다.
- Desmos 데모 키는 테스트용이며, 제출 전 발급받은 무료 키로 교체한다.
- Claude API 응답은 반드시 JSON 파싱 전에 마크다운 코드 펜스(```json ... ```)를 제거한다.
- KaTeX는 LaTeX 문법 오류 시 렌더링 실패할 수 있으므로 try-catch로 감싼다.
- Desmos는 전역 객체(`window.Desmos`)로 로드되므로 TypeScript에서는 `declare const Desmos: any`로 타입 선언한다.
- 서버는 단순 프록시로 얇게 유지하여 실시간 응답 지연을 최소화한다.
