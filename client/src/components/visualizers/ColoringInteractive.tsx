import { useCallback, useState } from 'react'
import type { ApplicationInteractiveData, ColoringFigure } from '../../types/math'

interface Props {
  interactive: ApplicationInteractiveData
  mini?: boolean
}

const PALETTE = ['#FF6B6B', '#4DABF7', '#69DB7C', '#FFD43B', '#CC5DE8', '#FF922B', '#20C997']
const PALETTE_NAMES = ['빨간색', '파란색', '초록색', '노란색', '보라색', '주황색', '청록색']

const paletteColor = (idxStr: string): string | undefined =>
  PALETTE[+idxStr]

interface CellHistory {
  cellId: string
  color: string
  availableCount: number
  blockedColors: string[]
}

// ── 미니 (문제 카드 정적 그림) ─────────────────────────────────
function MiniGrid({ figure }: { figure: ColoringFigure }) {
  const cellH = 40
  return (
    <div
      className="coloring-mini"
      style={{
        gridTemplateColumns: `repeat(${figure.gridCols}, 1fr)`,
        gridTemplateRows: `repeat(${figure.gridRows}, ${cellH}px)`,
        height: figure.gridRows * cellH + Math.max(0, figure.gridRows - 1) * 3,
      }}
    >
      {figure.cells.map((cell) => (
        <div
          key={cell.id}
          className="coloring-cell mini"
          style={{
            gridColumn: `${cell.col + 1} / span ${cell.colSpan ?? 1}`,
            gridRow: `${cell.row + 1} / span ${cell.rowSpan ?? 1}`,
          }}
        >
          {cell.id}
        </div>
      ))}
    </div>
  )
}

// ── 공통 그리드 컴포넌트 ──────────────────────────────────────
interface GridProps {
  figure: ColoringFigure
  cellColors: Record<string, string>
  selectedCell: string | null
  lockedCells: Set<string>
  violations: Set<string>
  onSelect: (id: string) => void
  onErase: (id: string) => void
  cellH?: number
}

function ColorGrid({ figure, cellColors, selectedCell, lockedCells, violations, onSelect, onErase, cellH = 64 }: GridProps) {
  return (
    <div
      className="coloring-grid"
      style={{
        gridTemplateColumns: `repeat(${figure.gridCols}, 1fr)`,
        gridTemplateRows: `repeat(${figure.gridRows}, ${cellH}px)`,
      }}
    >
      {figure.cells.map((cell) => {
        const bg = cellColors[cell.id]
        const isLocked = lockedCells.has(cell.id)
        return (
          <div
            key={cell.id}
            className={
              'coloring-cell' +
              (selectedCell === cell.id ? ' selected' : '') +
              (violations.has(cell.id) ? ' violation' : '') +
              (bg ? ' colored' : '') +
              (isLocked ? ' locked' : '')
            }
            style={{
              gridColumn: `${cell.col + 1} / span ${cell.colSpan ?? 1}`,
              gridRow: `${cell.row + 1} / span ${cell.rowSpan ?? 1}`,
              background: bg ?? undefined,
            }}
            onClick={() => !isLocked && onSelect(cell.id)}
          >
            {isLocked && <span className="cell-locked-badge">조건</span>}
            <span className="cell-label" style={{ color: bg ? 'rgba(0,0,0,0.65)' : undefined }}>
              {cell.id}
            </span>
            {bg && !isLocked && (
              <button
                className="cell-erase"
                onClick={(e) => { e.stopPropagation(); onErase(cell.id) }}
              >×</button>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── 단일 케이스 인터랙티브 패널 ──────────────────────────────
interface SingleCaseProps {
  figure: ColoringFigure
  colors: string[]
  orderedIds: string[]
  lockedColors: Record<string, string>   // 잠긴 셀의 실제 색 (변경 불가)
  caseFormula?: string                   // Claude가 제공한 케이스 공식
}

function SingleCasePanel({ figure, colors, orderedIds, lockedColors, caseFormula }: SingleCaseProps) {
  const numColors = colors.length
  const lockedSet = new Set(Object.keys(lockedColors))

  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [freeColors, setFreeColors] = useState<Record<string, string>>({})
  const [history, setHistory] = useState<CellHistory[]>([])

  // 전체 셀 색상 = 잠긴 색 + 자유 색
  const allColors: Record<string, string> = { ...lockedColors, ...freeColors }

  const getBlockedColors = useCallback(
    (cellId: string, cur: Record<string, string>): string[] => {
      const blocked = new Set<string>()
      for (const [a, b] of figure.adjacency) {
        if (a === cellId && cur[b]) blocked.add(cur[b])
        if (b === cellId && cur[a]) blocked.add(cur[a])
      }
      return [...blocked]
    },
    [figure.adjacency],
  )

  const blockedForSelected = selectedCell
    ? new Set(getBlockedColors(selectedCell, allColors))
    : new Set<string>()

  const violations = new Set<string>()
  for (const [a, b] of figure.adjacency) {
    if (allColors[a] && allColors[b] && allColors[a] === allColors[b]) {
      violations.add(a); violations.add(b)
    }
  }

  const applyColor = (color: string) => {
    if (!selectedCell || blockedForSelected.has(color)) return
    const blocked = getBlockedColors(selectedCell, allColors)
    setHistory((prev) => [
      ...prev.filter((h) => h.cellId !== selectedCell),
      { cellId: selectedCell, color, availableCount: numColors - blocked.length, blockedColors: blocked },
    ])
    setFreeColors((prev) => ({ ...prev, [selectedCell]: color }))
    setSelectedCell(null)
  }

  const eraseCell = (cellId: string) => {
    if (lockedSet.has(cellId)) return
    setHistory((prev) => prev.filter((h) => h.cellId !== cellId))
    setFreeColors((prev) => { const n = { ...prev }; delete n[cellId]; return n })
    if (selectedCell === cellId) setSelectedCell(null)
  }

  const reset = () => { setFreeColors({}); setHistory([]); setSelectedCell(null) }

  const colorName = (c: string) => PALETTE_NAMES[PALETTE.indexOf(c)] ?? '색'

  // 자유 셀만 대상으로 동적 공식 계산
  const freeCellIds = orderedIds.filter((id) => !lockedSet.has(id))
  const histMap = new Map(history.map((h) => [h.cellId, h]))

  const freeFormulaRows = freeCellIds.map((id) => {
    const hist = histMap.get(id)
    const isColored = !!freeColors[id]
    const predicted = isColored ? null : Math.max(0, numColors - getBlockedColors(id, allColors).length)
    const blockedNames = (isColored ? hist?.blockedColors ?? [] : getBlockedColors(id, allColors)).map(colorName)
    return { id, hist, isColored, predicted, blockedNames, isSelected: selectedCell === id }
  })

  const coloredFreeRows = freeFormulaRows.filter((r) => r.isColored && r.hist)
  const freeProduct = coloredFreeRows.reduce((acc, r) => acc * r.hist!.availableCount, 1)
  const allFreeColored = freeCellIds.every((id) => !!freeColors[id])
  const isValid = allFreeColored && violations.size === 0

  return (
    <div className="coloring-layout">
      {/* ── 좌: 그리드 + 팔레트 ── */}
      <div className="coloring-left">
        <ColorGrid
          figure={figure}
          cellColors={allColors}
          selectedCell={selectedCell}
          lockedCells={lockedSet}
          violations={violations}
          onSelect={(id) => setSelectedCell(id === selectedCell ? null : id)}
          onErase={eraseCell}
        />

        <div className="coloring-palette-wrap">
          <div className="palette-hint">
            {selectedCell
              ? <><span className="sel-indicator">{selectedCell}</span> 영역 선택됨 — 색을 고르세요</>
              : lockedSet.size > 0
              ? <><span style={{ color: 'var(--text-3)' }}>조건 셀({[...lockedSet].join('·')})은 고정됩니다.</span> 나머지를 색칠하세요.</>
              : '영역을 클릭한 뒤 색을 선택하세요'}
          </div>
          <div className="coloring-palette">
            {colors.map((c, i) => {
              const isBlocked = blockedForSelected.has(c)
              return (
                <button
                  key={c}
                  className={'color-dot' + (isBlocked ? ' blocked' : '') + (selectedCell && allColors[selectedCell] === c ? ' active' : '')}
                  style={{ background: c }}
                  onClick={() => !isBlocked && applyColor(c)}
                  title={isBlocked ? `${PALETTE_NAMES[i]} (인접 영역에서 사용 중)` : PALETTE_NAMES[i]}
                  disabled={isBlocked}
                >
                  {isBlocked && <span className="blocked-slash" />}
                </button>
              )
            })}
          </div>
          {selectedCell && (
            <div className="palette-count-hint">
              {blockedForSelected.size > 0
                ? `${[...blockedForSelected].map(colorName).join('·')} 제외 → ${numColors - blockedForSelected.size}가지 선택 가능`
                : `${numColors}가지 색 모두 선택 가능`}
            </div>
          )}
        </div>

        <button className="btn btn-quiet btn-sm" style={{ marginTop: 6, alignSelf: 'flex-start' }} onClick={reset}>
          초기화
        </button>
      </div>

      {/* ── 우: 경우의 수 계산 패널 ── */}
      <div className="coloring-formula-panel">
        <div className="cfp-title">경우의 수 계산</div>

        {/* 케이스 모드: Claude 공식 표시 */}
        {caseFormula && (
          <div className="cfp-case-formula">
            <span className="cfp-case-formula-label">이 경우의 계산</span>
            <span className="cfp-case-formula-value">{caseFormula}</span>
          </div>
        )}

        {/* 자유 셀 동적 추적 */}
        {freeCellIds.length > 0 && (
          <>
            {lockedSet.size > 0 && (
              <div className="cfp-locked-summary">
                {[...lockedSet].map((id) => (
                  <span key={id} className="cfp-locked-badge">
                    <span className="cfp-locked-dot" style={{ background: allColors[id] }} />
                    {id} 고정
                  </span>
                ))}
              </div>
            )}
            <div className="cfp-rows">
              {freeFormulaRows.map((row, idx) => (
                <div
                  key={row.id}
                  className={'cfp-row' + (row.isColored ? ' done' : '') + (row.isSelected ? ' active' : '')}
                >
                  <span className="cfp-op">{idx === 0 && coloredFreeRows.length === 0 ? '' : (row.isColored ? '×' : '×')}</span>
                  <span className="cfp-color-dot" style={{ background: row.isColored ? freeColors[row.id] : 'transparent' }} />
                  <span className="cfp-cell-id">{row.id}</span>
                  <span className="cfp-count">
                    {row.isColored ? `${row.hist!.availableCount}가지` : row.predicted !== null ? `${row.predicted}가지` : '?'}
                    {!row.isColored && row.predicted !== null && <span className="cfp-predicted">(예상)</span>}
                  </span>
                  <span className="cfp-reason">
                    {row.isColored
                      ? row.blockedNames.length ? `${row.blockedNames.join('·')} 제외` : '제약 없음'
                      : row.isSelected
                      ? row.blockedNames.length ? `← 선택 중 (${row.blockedNames.join('·')} 제외)` : '← 선택 중'
                      : row.blockedNames.length ? `${row.blockedNames.join('·')} 제외 예상` : ''}
                  </span>
                </div>
              ))}
            </div>

            <div className="cfp-result">
              {coloredFreeRows.length > 0 ? (
                <>
                  <span className="cfp-result-formula">
                    {coloredFreeRows.map((r, i) => (
                      <span key={r.id}>{i > 0 && ' × '}<strong>{r.hist!.availableCount}</strong></span>
                    ))}
                    {coloredFreeRows.length < freeCellIds.length && <span> × <span className="cfp-qmark">?</span></span>}
                  </span>
                  <span className="cfp-equals">
                    {allFreeColored
                      ? <> = <strong>{freeProduct}</strong>가지 (자유 영역 기준)</>
                      : <> = <strong>{freeProduct}</strong>가지 (지금까지)</>}
                  </span>
                </>
              ) : (
                <span className="cfp-empty">나머지 영역을 색칠해보세요</span>
              )}
            </div>

            {isValid && (
              <div className="cfp-note">이 케이스의 유효한 칠하기 예시예요!</div>
            )}
            {violations.size > 0 && (
              <div className="cfp-note invalid">인접한 영역에 같은 색이 있어요.</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
const ColoringInteractive = ({ interactive, mini = false }: Props) => {
  const { figure, numColors, prompt, coloringOrder, cases, caseIntro, totalFormula } = interactive

  const safeNumColors = Math.min(Math.max(numColors, 1), PALETTE.length)
  const colors = PALETTE.slice(0, safeNumColors)
  const orderedIds = coloringOrder?.length ? coloringOrder : figure.cells.map((c) => c.id)

  const [activeCase, setActiveCase] = useState(0)

  if (mini) return <MiniGrid figure={figure} />

  // ── 다중 케이스 모드 ──
  if (cases && cases.length > 1) {
    const cur = cases[activeCase]

    // exampleColors (팔레트 인덱스 문자열) → 실제 색
    const lockedColors: Record<string, string> = {}
    if (cur.exampleColors) {
      for (const [id, idxStr] of Object.entries(cur.exampleColors)) {
        const c = paletteColor(idxStr)
        if (c) lockedColors[id] = c
      }
    }

    return (
      <div className="coloring-interactive">
        <div className="coloring-header">
          <span className="coloring-prompt">{prompt || '각 경우에서 나머지 영역을 색칠해보세요'}</span>
        </div>

        {/* 케이스 분리 이유 배너 */}
        {caseIntro && (
          <div className="case-intro-banner">
            <span className="cib-icon">💡</span>
            <span className="cib-text">{caseIntro}</span>
          </div>
        )}

        {/* 케이스 탭 */}
        <div className="coloring-case-tabs">
          {cases.map((c, i) => {
            // 탭에 예시 색상 미리보기 표시
            const previewColors: string[] = Object.values(c.exampleColors ?? {})
              .map(paletteColor).filter(Boolean) as string[]
            return (
              <button
                key={i}
                className={'case-tab' + (i === activeCase ? ' active' : '')}
                onClick={() => setActiveCase(i)}
              >
                <div className="case-tab-top">
                  <span className="case-tab-label">{c.label}</span>
                  <div className="case-tab-preview">
                    {previewColors.map((col, j) => (
                      <span key={j} className="case-preview-dot" style={{ background: col }} />
                    ))}
                  </div>
                </div>
                <span className="case-tab-desc">{c.description}</span>
                <span className="case-tab-count">{c.count.toLocaleString()}가지</span>
              </button>
            )
          })}
        </div>

        {/* 현재 케이스 패널 (key로 상태 초기화) */}
        <SingleCasePanel
          key={activeCase}
          figure={figure}
          colors={colors}
          orderedIds={orderedIds}
          lockedColors={lockedColors}
          caseFormula={cur.formula}
        />

        {/* 전체 합산 */}
        {totalFormula && (
          <div className="coloring-total-formula">
            <span className="ctf-label">전체 =</span>
            <span className="ctf-cases">
              {cases.map((c, i) => (
                <span key={i}>
                  {i > 0 && <span className="ctf-op"> + </span>}
                  <button className="ctf-count" onClick={() => setActiveCase(i)} title={c.description}>
                    {c.count.toLocaleString()}
                  </button>
                </span>
              ))}
            </span>
            <span className="ctf-result">= <strong>{totalFormula.split('=').pop()?.trim()}</strong>가지</span>
          </div>
        )}
      </div>
    )
  }

  // ── 단일 케이스 모드 ──
  return (
    <div className="coloring-interactive">
      <div className="coloring-header">
        <span className="coloring-prompt">{prompt || '각 영역을 클릭해서 색을 골라보세요'}</span>
      </div>
      <SingleCasePanel
        figure={figure}
        colors={colors}
        orderedIds={orderedIds}
        lockedColors={{}}
      />
    </div>
  )
}

export default ColoringInteractive
