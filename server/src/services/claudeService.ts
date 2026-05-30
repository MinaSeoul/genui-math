// Claude API 호출 로직 (서버에서만 실행)
// 1단계: 이미지 → 문제 텍스트 + 유형 분류
// 2단계: 어려움 유형 반영 → CoT 풀이 + 시각화 JSON

export async function analyzeImage(_imageBase64: string) {
  // TODO: Claude Vision API 1단계 호출
}

export async function generateSolution(
  _problemText: string,
  _problemType: string,
  _difficultyType: string,
) {
  // TODO: Claude API 2단계 호출
}
