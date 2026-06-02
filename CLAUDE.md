# CLAUDE.md — GenUI 기반 고등학생 수학 문제 맞춤형 시각화 학습 시스템 (Solvio)

> 이 파일은 Claude Code가 프로젝트 전반을 이해하고 일관되게 개발할 수 있도록 작성된 가이드입니다.

---

## 프로젝트 개요

**과제명:** GenUI 기반 고등학생 수학 문제 맞춤형 시각화 학습 시스템  
**앱 이름:** **Solvio**

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
| 스타일링 | 커스텀 CSS (styles.css) | |
| 수식 렌더링 | KaTeX | `shared/Katex.tsx` + `shared/RichText.tsx`로 래핑 |
| 함수 그래프 시각화 | Desmos API | script 태그로 로드; DesmosGraphPanel·DesmosStepGraph·DesmosInlineGraph |
| 도형 시각화 | SVG (직접 구현) | TrigAnimView.tsx — Claude 생성 좌표를 SVG로 렌더링 |
| 칠하기 인터랙티브 | React + CSS Grid | ColoringInteractive.tsx |
| 활용문제 애니메이션 | Framer Motion + SVG | AnimationView.tsx (샘플 문제용) |

### Backend (server)

| 역할 | 라이브러리/API | 비고 |
|------|--------------|------|
| 서버 프레임워크 | Express | Claude API 보호용 프록시 |
| AI 이미지 인식 + 풀이 생성 | Claude API (claude-sonnet-4-6) | Vision 포함 |

### 모델 선택

- `claude-sonnet-4-6`: 수식 인식·구조화 JSON 생성 정확도가 높아 Haiku에서 업그레이드하여 사용 중

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

서버는 단순 프록시 역할로 얇게 유지하고, claudeService는 불필요한 가공 없이
Claude 응답을 클라이언트에 그대로 전달하는 것을 원칙으로 한다.
(단, LaTeX 역슬래시 이스케이프 보정 등 JSON 파싱 안전 처리는 서버에서 수행)

---

## 프로젝트 디렉토리 구조 (현재 실제 구조)

```
genui-math/
├── CLAUDE.md
├── README.md
├── .gitignore
├── package.json
│
├── client/
│   ├── index.html                # Desmos API script 태그 포함
│   ├── src/
│   │   ├── App.tsx               # phase 상태 관리 + API 오케스트레이션 + buildProblemFromAPI
│   │   ├── main.tsx
│   │   ├── styles.css
│   │   │
│   │   ├── components/
│   │   │   ├── screens/
│   │   │   │   ├── UploadScreen.tsx      # PNG 업로드 + 샘플 문제 선택
│   │   │   │   ├── DiagnoseScreen.tsx    # 어려움 유형 선택 (4개 버튼)
│   │   │   │   ├── LoadingScreen.tsx     # 인식중/생성중 로딩 화면
│   │   │   │   ├── ResultScreen.tsx      # 결과 화면 (시각화 + 풀이 + 챗)
│   │   │   │   └── Stepper.tsx           # 상단 진행 단계 표시
│   │   │   │
│   │   │   ├── shared/
│   │   │   │   ├── Katex.tsx             # KaTeX 렌더링 래퍼 (try-catch 포함)
│   │   │   │   └── RichText.tsx          # $...$ / $$...$$ → KaTeX 자동 변환
│   │   │   │
│   │   │   ├── visualizers/
│   │   │   │   ├── FormulaView.tsx       # 단계별 수식 풀이 (midway/일반 UX 분기)
│   │   │   │   ├── GraphView.tsx         # SVG 이차함수 그래프 (샘플 문제용)
│   │   │   │   ├── DesmosGraphPanel.tsx  # Desmos 인터랙티브 그래프 (API 결과용)
│   │   │   │   ├── DesmosStepGraph.tsx   # 풀이 단계 인라인 Desmos (미지수 슬라이더 포함)
│   │   │   │   ├── DesmosInlineGraph.tsx # 이차부등식 범위 강조 그래프
│   │   │   │   ├── InequalityGraphPanel.tsx # 부등식 그래프 패널
│   │   │   │   ├── TrigAnimView.tsx      # SVG 도형 시각화 (Claude 좌표 기반)
│   │   │   │   ├── AnimationView.tsx     # 활용문제 SVG 애니메이션 (샘플 문제용)
│   │   │   │   └── ColoringInteractive.tsx # 경우의 수·칠하기 인터랙티브 UI
│   │   │   │
│   │   │   ├── ChatPanel.tsx             # 문제 맥락 기반 AI 채팅 패널
│   │   │   ├── DifficultySurvey.tsx      # 어려움 유형 버튼 컴포넌트
│   │   │   ├── ImageUploader.tsx         # PNG 업로드 + Base64 변환
│   │   │   ├── ResultLayout.tsx          # (레거시) 타입 기반 뷰 분기
│   │   │   └── icons.tsx                 # SVG 아이콘 컴포넌트
│   │   │
│   │   ├── data/
│   │   │   └── sampleProblems.ts         # Problem 타입 정의 + 샘플 문제 데이터
│   │   │
│   │   ├── hooks/
│   │   │   └── useProblemAnalysis.ts     # 서버 /api/analyze 3단계 호출 훅
│   │   │
│   │   ├── prompts/                      # 단원별 시스템 프롬프트 (Markdown)
│   │   │   ├── common.md
│   │   │   ├── 공통수학1/ (unit_다항식.md 등 5개)
│   │   │   ├── 공통수학2/ (unit_도형의방정식.md 등 3개)
│   │   │   └── 대수/ (unit_삼각함수.md 등 3개)
│   │   │
│   │   └── types/
│   │       └── math.ts                   # 클라이언트 타입 (서버 스키마와 동기화)
│   │
│   ├── vite.config.ts
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── index.ts                      # Express 진입점
│   │   ├── routes/
│   │   │   └── analyze.ts                # POST /api/analyze (5가지 stage 처리)
│   │   ├── services/
│   │   │   └── claudeService.ts          # Claude API 호출 + LaTeX JSON 파싱
│   │   ├── prompts/
│   │   │   └── mathPrompt.ts             # 5개 프롬프트 빌더 함수 (핵심 AI 로직)
│   │   └── schemas/
│   │       └── mathSchema.ts             # 응답 JSON 스키마 타입 정의
│   ├── .env                              # API 키 (git 제외)
│   ├── .env.example
│   └── package.json
│
└── docs/
    ├── proposal.pdf
    ├── report.md
    └── screenshots/
```

---

## 전체 파이프라인 (5-stage 구조)

```
[client] PNG 업로드 (ImageUploader)
    ↓
[client] useProblemAnalysis.analyzeImage()
         → POST /api/analyze { stage: 'analyze', imageBase64 }
    ↓
[server] claudeService.analyzeImage() — Claude Vision
         이미지 → problemText, problemType, latex, hasFigure
    ↓ AnalysisResult 반환
[client] phase: 'diagnose' — DiagnoseScreen
         학생이 어려움 유형 4가지 중 선택
    ↓
[client] useProblemAnalysis.generateSolution()
         → POST /api/analyze { stage: 'solve', problemText, problemType, difficultyType }
    ↓
[server] claudeService.generateSolution() — CoT 풀이 + 시각화 JSON
         → steps[], visualData, stuckExplanation
    ↓ SolutionResult 반환
    ↓
[client] (조건부) hasFigure || isTrigProblem
         → useProblemAnalysis.generateDiagram()
         → POST /api/analyze { stage: 'diagram', problemText, steps }
    ↓
[server] claudeService.generateDiagram() — 도형 좌표 JSON 생성
         → TrigGeometry | null
    ↓
[client] buildProblemFromAPI() — 3개 응답을 하나의 Problem 객체로 통합
    ↓
[client] phase: 'result' — ResultScreen 렌더링
    ├── 문제 카드 (RichText + KaTeX)
    ├── 막힌 지점 맞춤 설명 (stuckExplanation)
    ├── 시각화 패널:
    │   ├── formula → FormulaView + (부등식) InequalityGraphPanel
    │   ├── graph → DesmosGraphPanel
    │   └── application → ColoringInteractive
    ├── (도형 있으면) TrigAnimView
    └── ChatPanel → POST /api/analyze { stage: 'chat' }

추가 인터랙션:
- 단계 "이해 안 됨" 버튼 → POST /api/analyze { stage: 'explain' } → 심화 설명 인라인
- ChatPanel 질문 → POST /api/analyze { stage: 'chat' } → AI 답변
```

---

## API 엔드포인트 (POST /api/analyze)

| stage | 입력 | 출력 | 서버 함수 |
|-------|------|------|----------|
| `analyze` | imageBase64 | AnalyzeImageResponse | analyzeImage() |
| `solve` | problemText, problemType, difficultyType | GenerateSolutionResponse | generateSolution() |
| `diagram` | problemText, steps | TrigGeometry \| null | generateDiagram() |
| `explain` | stepDesc, stepIndex | { explanation } | explainStep() |
| `chat` | problemText, userMessage, chatHistory | { reply } | generateChatReply() |

---

## 문제 유형 분류

| 유형 | 설명 | 시각화 방식 |
|------|------|------------|
| `formula` | 방정식·부등식 등 직접 계산하는 문제 | KaTeX 단계별 수식 + (부등식) DesmosInlineGraph |
| `graph` | 함수의 형태와 관계를 시각적으로 이해해야 하는 문제 | DesmosGraphPanel 인터랙티브 그래프 |
| `application` | 경우의 수·순열·조합 등 문제 상황을 모델링하는 문제 | ColoringInteractive 칠하기 인터랙티브 |

---

## 어려움 유형 분류

| 코드 | 설명 | FormulaView UX |
|------|------|----------------|
| `understanding` | 문제 자체가 무슨 말인지 모르겠음 | 전체 단계 일괄 표시 |
| `strategy` | 문제는 이해하지만 어떻게 풀지 모르겠음 | 전체 단계 일괄 표시 |
| `midway` | 풀이 중간까지는 됐는데 이후를 모르겠음 | 한 단계씩 점진적 공개 + 심화 설명 버튼 |
| `visual` | 시각적으로 이해가 필요함 | 전체 단계 일괄 표시 |

---

## 프롬프트 시스템 (server/src/prompts/mathPrompt.ts)

총 5개의 프롬프트 빌더 함수가 있으며, 이것이 AI 기능의 핵심이다.

| 함수 | 역할 | 출력 형식 |
|------|------|----------|
| `buildAnalyzePrompt()` | 이미지에서 문제 추출 + 3-way 유형 분류 (우선순위 룰 기반) | JSON |
| `buildSolvePrompt()` | 어려움 유형별 CoT 풀이 + 유형별 visualData JSON 명세 | JSON |
| `buildDiagramPrompt()` | 풀이 단계 기반 도형 좌표 생성 (0~100 좌표계) | JSON |
| `buildExplainPrompt()` | 특정 단계 심화 재설명 | KaTeX 텍스트 |
| `buildChatPrompt()` | 문제 맥락 기반 채팅 시스템 프롬프트 | KaTeX 텍스트 |

---

## Claude API 사용 규칙 (server에서만 호출)

### 환경변수 (server/.env)

```
ANTHROPIC_API_KEY=여기에_API_키_입력
PORT=3001
```

`server/.env` 파일은 `.gitignore`에 반드시 포함. `server/.env.example`만 git에 포함.

### 현재 사용 모델

```typescript
const MODEL = 'claude-sonnet-4-6'
```

### LaTeX JSON 파싱 안전 처리

Claude가 JSON 내 LaTeX 역슬래시를 단일 `\`로 출력하면 JSON 파싱 실패.
`claudeService.ts`의 `fixJsonBackslashes()`가 두 단계 전략으로 자동 보정:
1. 표준 JSON 파싱 시도
2. 실패 시 유효 JSON 이스케이프 보호 후 단독 `\` → `\\` 변환 후 재파싱

---

## Desmos API 사용 규칙 (client)

- **로드 방식:** `client/index.html`에 script 태그로 직접 로드

```html
<script src="https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"></script>
```

- 위 키는 데모 키이며, 실제 제출 전 Desmos 사이트에서 무료 키를 발급받아 교체한다.
- TypeScript에서는 `declare const Desmos: any`로 전역 선언
- `useEffect` + `useRef`로 DOM 마운트 후 초기화, cleanup 시 `calc.destroy()`
- Claude가 반환한 `expression`을 `calc.setExpression()`으로 주입

---

## 수식 출력 규칙

`RichText.tsx`가 `$...$`, `$$...$$`, `\(...\)`, `\[...\]` 4가지 형식을 모두 KaTeX로 렌더링한다.
- 인라인 수식: `$...$` (예: `$f'(x) = 0$`)
- 블록 수식: `$$...$$` (예: `$$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$$`)
- 일반 텍스트 수식 금지: `f'(x) = 0`, `α+β` 형식 사용 불가

---

## 주의사항

- `server/.env` 파일은 절대 git에 커밋하지 않는다.
- Claude API는 **서버에서만** 호출한다. 클라이언트는 자체 서버의 `/api/analyze`만 호출한다.
- Claude API 응답은 반드시 JSON 파싱 전에 마크다운 코드 펜스(` ```json ... ``` `)를 제거한다. (`stripMarkdownFences`)
- KaTeX는 LaTeX 문법 오류 시 렌더링 실패할 수 있으므로 `Katex.tsx`에서 try-catch로 감싼다.
- Desmos는 전역 객체(`window.Desmos`)로 로드되므로 TypeScript에서는 `declare const Desmos: any`로 선언한다.
- LaTeX 역슬래시 이스케이프 문제는 `fixJsonBackslashes()`가 자동 처리한다.
- `buildProblemFromAPI()`에서 API 응답을 Problem 타입으로 변환할 때 visualData 타입별 분기가 복잡하므로 수정 시 주의한다.
