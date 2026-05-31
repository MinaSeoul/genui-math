## 등차수열 풀이 원칙

- $a_n = a_1+(n-1)d$, $S_n = \frac{n\{2a_1+(n-1)d\}}{2}$
- $S_n \to a_n$: $n \geq 2$이면 $a_n = S_n - S_{n-1}$, $n=1$은 따로 확인 (불일치 시 명시)
- 최대/최솟값: $a_n$ 부호 바뀌는 지점 전후 확인

## 등비수열 풀이 원칙

- $a_n = ar^{n-1}$, $S_n = \frac{a(r^n-1)}{r-1}$ ($r \neq 1$)
- 두 조건 → 연립: ②÷① 로 $r$ 먼저 구하기
- 적립금: 등비수열 합 공식 그대로 적용

## 수열의 합 풀이 원칙

- 부분분수: $\frac{1}{(an+b)(cn+d)}$ → 텔레스코핑 합
- 근과 계수의 관계를 수열에 적용: $\frac{1}{\alpha_n} + \frac{1}{\beta_n} = \frac{\alpha_n+\beta_n}{\alpha_n\beta_n}$

## 수학적 귀납법 풀이 원칙

- 반드시 2단계: (i) $n=1$ 확인, (ii) $n=k$ 가정 → $n=k+1$ 증명
- 가정 형태 명시: "$3^{2k}-1 = 8N$ ($N$은 자연수)으로 놓을 수 있다"

## 수열 풀이 예시

【예시28】 $S_n$에서 $a_n$ 구하기

$S_n = 2^{n+1}-3$이면

(i) $n=1$: $a_1 = S_1 = 4-3 = 1$

(ii) $n \geq 2$: $a_n = S_n - S_{n-1} = (2^{n+1}-3)-(2^n-3) = 2^n$

$a_1=2 \neq 1$이므로

$$a_n = \begin{cases} 1 & (n=1) \\ 2^n & (n \geq 2) \end{cases}$$

【예시29】 등비수열 두 조건 연립

$a_3 = ar^2 = 12$, $a_6 = ar^5 = 324$

$$\frac{②}{①}: r^3=27 \quad \therefore r=3 \Rightarrow 9a=12 \quad \therefore a=\frac{4}{3}$$

【예시30】 부분분수 합

$$\sum_{k=1}^{n} \frac{1}{(2k-1)(2k+1)} = \frac{1}{2}\left\{\left(1-\frac{1}{3}\right)+\left(\frac{1}{3}-\frac{1}{5}\right)+\cdots\right\} = \frac{1}{2}\left(1-\frac{1}{2n+1}\right)$$

【예시31】 수학적 귀납법

(i) $n=1$: (좌변)$=\ldots$ (우변)$=\ldots$ 확인

(ii) $n=k$일 때 $3^{2k}-1 = 8N$으로 가정하면

$n=k+1$일 때:

$$3^{2k+2}-1 = 9 \cdot 3^{2k}-1 = 9(8N+1)-1 = 72N+8 = 8(9N+1)$$

$\therefore n=k+1$일 때도 성립
