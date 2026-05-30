// 1단계: 이미지 인식 + 유형 분류 프롬프트
export function buildAnalyzePrompt(): string {
  // TODO: 문제 텍스트 추출, formula/graph/application 유형 분류, LaTeX 변환
  return ''
}

// 2단계: CoT 풀이 + 시각화 JSON 생성 프롬프트
export function buildSolvePrompt(
  _problemText: string,
  _problemType: string,
  _difficultyType: string,
): string {
  // TODO: 어려움 유형별 힌트 제공, 단계별 풀이, 시각화 데이터 생성
  return ''
}
