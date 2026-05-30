# GenUI 기반 고등학생 수학 문제 맞춤형 시각화 학습 시스템

고등학교 수학 문제 스크린샷(PNG)을 업로드하면, 문제를 인식·분류하고 학생이 막히는 지점을 진단하여 문제 유형에 맞는 시각화 UI를 동적으로 생성하는 GenUI 시스템입니다.


---

## 동작 개요

1. 학생이 수학 문제 스크린샷(PNG)을 업로드
2. Claude Vision으로 문제를 인식하고 유형을 자동 분류
3. 학생이 어떤 부분에서 막히는지 객관식 버튼으로 진단
4. 문제 유형과 어려움 유형에 맞는 시각화 UI를 동적으로 생성

기존 LLM이 텍스트·수식 중심의 일괄적인 풀이를 제공하는 것과 달리, 학생이 어디서 막히는지를 먼저 진단한 뒤 맞춤 설명을 제공하고, 문제 유형별로 다른 시각화 방식을 적용합니다.

---

## 기술 스택

### Frontend (client)

| 역할 | 라이브러리/API |
|------|--------------|
| UI 프레임워크 | React + TypeScript (Vite) |
| 스타일링 | Tailwind CSS |
| 수식 렌더링 | KaTeX |
| 함수 그래프 시각화 | Desmos API |
| 활용문제 애니메이션 | Framer Motion + SVG |

### Backend (server)

| 역할 | 라이브러리/API |
|------|--------------|
| 서버 프레임워크 | Express |
| AI 이미지 인식 + 풀이 생성 | Claude API (claude-haiku-4-5-20251001) |

**모델 선택 이유:** 실시간 피드백이 필요한 앱이므로 속도·비용 효율이 좋은 Haiku를 선택했으며, 수식 인식 정확도가 부족할 경우 `claude-sonnet-4-6`으로 업그레이드할 계획입니다.

---

## 아키텍처 원칙

- **API 키 보호:** Claude API는 서버에서만 호출하고, 클라이언트는 자체 서버의 `/api/analyze`만 호출합니다. API 키는 서버 환경변수에만 존재하며 브라우저에 노출되지 않습니다.
- **프롬프트 분리:** 프롬프트(`prompts/`)와 응답 스키마(`schemas/`)를 클라이언트와 분리해 서버에서 체계적으로 관리합니다.
- **얇은 서버:** 서버는 단순 프록시 역할로 얇게 유지하여 실시간 응답 지연을 최소화합니다. claudeService는 Claude 응답을 가공 없이 클라이언트로 전달합니다.

---

## 프로젝트 구조

```
genui-math/
├── CLAUDE.md
├── README.md
├── .gitignore
├── package.json
│
├── client/                       # React 웹 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUploader.tsx      # PNG 업로드 + 미리보기
│   │   │   ├── DifficultySurvey.tsx   # 어려움 유형 선택 객관식 버튼
│   │   │   ├── ResultLayout.tsx       # 유형에 따라 시각화 뷰 선택
│   │   │   └── visualizers/
│   │   │       ├── FormulaView.tsx    # 단순 수식형 — KaTeX
│   │   │       ├── GraphView.tsx      # 함수·그래프형 — Desmos
│   │   │       └── AnimationView.tsx  # 활용문제형 — Motion+SVG
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
│   ├── .env.example
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

## 구조별 역할

### Frontend (client)

| 파일 | 역할 |
|------|------|
| `ImageUploader.tsx` | PNG 이미지 업로드, Base64 변환, 미리보기 |
| `useProblemAnalysis.ts` | 서버 `/api/analyze` 호출 (로딩·에러 상태 관리) |
| `DifficultySurvey.tsx` | 학생의 어려움 유형 선택 객관식 버튼 |
| `ResultLayout.tsx` | 문제 유형에 따라 시각화 뷰 분기 (렌더링은 위임) |
| `FormulaView.tsx` | 단순 수식형 — KaTeX 단계별 풀이 |
| `GraphView.tsx` | 함수·그래프형 — Desmos 인터랙티브 그래프 |
| `AnimationView.tsx` | 활용문제형 — Motion+SVG 상황 애니메이션 |

### Backend (server)

| 파일 | 역할 |
|------|------|
| `routes/analyze.ts` | `POST /api/analyze` 라우트 정의 |
| `services/claudeService.ts` | Claude Vision + API 호출 로직 집중 |
| `prompts/mathPrompt.ts` | 문제 인식·풀이 프롬프트 |
| `schemas/mathSchema.ts` | 응답 JSON 스키마 |
| `index.ts` | Express 서버 진입점 |

---

## 분류 기준

### 문제 유형

| 유형 | 설명 | 시각화 방식 |
|------|------|------------|
| `formula` | 방정식·부등식 등 직접 계산하는 문제 | KaTeX 단계별 수식 |
| `graph` | 함수의 형태와 관계를 시각적으로 이해해야 하는 문제 | Desmos 인터랙티브 그래프 |
| `application` | 문제 상황을 해석하고 수식으로 모델링하는 문제 | Framer Motion + SVG 애니메이션 |

### 어려움 유형

| 코드 | 설명 |
|------|------|
| `understanding` | 문제 자체가 무슨 말인지 모르겠음 |
| `strategy` | 문제는 이해하지만 어떻게 풀지 모르겠음 |
| `midway` | 풀이 중간까지는 됐는데 이후를 모르겠음 |
| `visual` | 시각적으로 이해가 필요함 |

---

## 전체 파이프라인

```
[client] PNG 업로드 (ImageUploader)
    ↓
[client] useProblemAnalysis → server /api/analyze 호출
    ↓
[server] claudeService — Claude Vision: 문제 텍스트 추출 + 유형 분류
    ↓
[client] ResultLayout — 문제 유형 분기
    ↓
[client] DifficultySurvey — 학생이 어려움 유형 선택
    ↓
[server] claudeService — 어려움 유형 반영 + CoT 풀이 + 시각화 JSON 생성
    ↓
[client] 유형별 시각화 컴포넌트 렌더링
    ├── 단순 수식형  → FormulaView (KaTeX)
    ├── 함수·그래프형 → GraphView (Desmos)
    └── 활용문제형  → AnimationView (Motion+SVG)
    ↓
학생 맞춤 UI 출력
```

---

## 개발 순서

| 단계 | 작업 | 위치 |
|------|------|------|
| 1 | Vite React 웹 프로젝트 생성 (+ Tailwind) | client |
| 2 | 이미지 업로드 + 미리보기 구현 | client |
| 3 | Express 서버 생성 (+ .env) | server |
| 4 | React → server 요청 연결 | client |
| 5 | server → Claude API 호출 연결 | server |
| 6 | Claude 응답 JSON 타입 정의 | 양쪽 |
| 7 | FormulaView 구현 (가장 단순) | client |
| 8 | GraphView 구현 | client |
| 9 | AnimationView 구현 (가장 복잡) | client |

데이터 파이프라인(1~6)을 먼저 완성하여 서버가 정상적으로 풀이 JSON을 반환하는 것을 확인한 뒤, 시각화 컴포넌트(7~9)를 단순한 것부터 구현합니다.

---

## 환경변수 설정

`server/.env` 파일을 생성하고 아래 내용을 입력합니다. 이 파일은 `.gitignore`에 포함되어야 합니다.

```
ANTHROPIC_API_KEY=여기에_API_키_입력
PORT=3001
```

Desmos API는 `client/index.html`에 script 태그로 로드하며, 데모 키는 테스트용이므로 제출 전 Desmos 사이트에서 발급받은 무료 키로 교체합니다.
