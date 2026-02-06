import { useMemo, useState } from 'react'
import { useTizenKeys } from './hooks/useTizenKeys'
import './App.css'

const PRESET_TIPS = [10, 15, 20]
const TIP_PCT_MIN = 0
const TIP_PCT_MAX = 100

function App() {
  const [billAmount, setBillAmount] = useState('')
  const [selectedTipPct, setSelectedTipPct] = useState(15)
  const [customTipPct, setCustomTipPct] = useState('')

  const [tipAmount, setTipAmount] = useState(null)
  const [totalAmount, setTotalAmount] = useState(null)
  const [errors, setErrors] = useState({ billAmount: '', tipPercent: '' })

  // PUBLIC_INTERFACE
  function formatCurrency(value) {
    /** Format a numeric currency value to USD-style 2 decimals. */
    if (!Number.isFinite(value)) return '$0.00'
    return `$${value.toFixed(2)}`
  }

  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max)
  }

  function parseNonNegativeNumber(raw) {
    const trimmed = String(raw ?? '').trim()
    if (trimmed.length === 0) return { value: null, error: 'Please enter a bill amount.' }

    const n = Number(trimmed)
    if (!Number.isFinite(n)) return { value: null, error: 'Please enter a valid number.' }
    if (n < 0) return { value: null, error: 'Amount cannot be negative.' }

    return { value: n, error: '' }
  }

  function parseTipPercent(raw, fallbackPct) {
    const trimmed = String(raw ?? '').trim()
    if (trimmed.length === 0) {
      // No custom value: use selected preset (already controlled).
      return { value: fallbackPct, error: '' }
    }

    const n = Number(trimmed)
    if (!Number.isFinite(n)) return { value: null, error: 'Tip % must be a number.' }
    if (n < TIP_PCT_MIN) return { value: null, error: `Tip % cannot be below ${TIP_PCT_MIN}.` }
    if (n > TIP_PCT_MAX)
      return { value: null, error: `Tip % cannot exceed ${TIP_PCT_MAX}.` }

    return { value: n, error: '' }
  }

  const billParsed = useMemo(() => parseNonNegativeNumber(billAmount), [billAmount])

  const tipParsed = useMemo(
    () => parseTipPercent(customTipPct, selectedTipPct),
    [customTipPct, selectedTipPct],
  )

  const activeTipPct = useMemo(() => {
    // Keep a usable display value even while typing.
    if (tipParsed.value == null) return clamp(selectedTipPct, TIP_PCT_MIN, TIP_PCT_MAX)
    return clamp(tipParsed.value, TIP_PCT_MIN, TIP_PCT_MAX)
  }, [selectedTipPct, tipParsed.value])

  const canCalculate = useMemo(() => {
    return billParsed.value != null && tipParsed.value != null
  }, [billParsed.value, tipParsed.value])

  useMemo(() => {
    // Live validation feedback near inputs.
    setErrors({
      billAmount: billParsed.error,
      tipPercent: tipParsed.error,
    })
  }, [billParsed.error, tipParsed.error])

  useTizenKeys({
    // Step 2: Keep remote ENTER usability by focusing the primary action.
    // NOTE: Do not change key handling until Step 4.
    onEnter: () => {
      const btn = document.getElementById('calculateBtn')
      btn?.click?.()
    },
    onBack: () => console.log('Back pressed'),
  })

  function handleBillAmountChange(e) {
    const next = e.target.value
    // Allow empty; keep as string to avoid fighting user typing (e.g. "12.", "0.5")
    setBillAmount(next)

    // If user edits inputs after calculating, clear results to avoid stale values.
    setTipAmount(null)
    setTotalAmount(null)
  }

  function handlePresetTipClick(pct) {
    setSelectedTipPct(pct)
    setCustomTipPct('')

    setTipAmount(null)
    setTotalAmount(null)
  }

  function handleCustomTipChange(e) {
    setCustomTipPct(e.target.value)

    setTipAmount(null)
    setTotalAmount(null)
  }

  function handleCalculate() {
    // Guard even though button is disabled when invalid (keeps handler safe for ENTER/remote).
    if (!canCalculate) return

    const bill = billParsed.value
    const pct = clamp(tipParsed.value, TIP_PCT_MIN, TIP_PCT_MAX)

    // Compute and round to 2 decimals.
    const tip = Number((bill * (pct / 100)).toFixed(2))
    const total = Number((bill + tip).toFixed(2))

    setTipAmount(tip)
    setTotalAmount(total)
  }

  const billHelpId = 'bill-help'
  const billErrorId = 'bill-error'
  const tipHelpId = 'tip-help'
  const tipErrorId = 'tip-error'
  const resultsHelpId = 'results-help'

  const billAriaDescribedBy = errors.billAmount
    ? `${billHelpId} ${billErrorId}`
    : billHelpId

  const tipAriaDescribedBy = errors.tipPercent
    ? `${tipHelpId} ${tipErrorId}`
    : tipHelpId

  return (
    <div className="app">
      <div className="shell">
        <header className="header">
          <div className="titleRow">
            <div>
              <h1>Tip Calculator</h1>
              <p className="subtitle">Enter a bill, pick a tip, and see the total.</p>
            </div>
            <span className="badge">Light</span>
          </div>
        </header>

        <main className="mainCard" aria-label="Tip calculator">
          {/* Bill input */}
          <section aria-labelledby="bill-section-title">
            <h2
              id="bill-section-title"
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.01em',
              }}
            >
              Bill amount
            </h2>

            <div style={{ marginTop: 'var(--space-2)' }}>
              <label
                htmlFor="billAmount"
                className="subtitle"
                style={{ display: 'block' }}
              >
                Amount (USD)
              </label>
              <input
                id="billAmount"
                name="billAmount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="e.g., 42.50"
                value={billAmount}
                onChange={handleBillAmountChange}
                aria-describedby={billAriaDescribedBy}
                aria-invalid={errors.billAmount ? 'true' : 'false'}
                style={{
                  marginTop: 'var(--space-2)',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: errors.billAmount
                    ? '1px solid rgba(239, 68, 68, 0.55)'
                    : '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: var(--color-text),
                  boxShadow: 'var(--shadow-sm)',
                  outline: 'none',
                }}
              />
              <p id={billHelpId} className="hint" style={{ marginTop: 8 }}>
                Tip: You can enter decimals (e.g., 12.99).
              </p>
              {errors.billAmount ? (
                <p
                  id={billErrorId}
                  className="hint"
                  style={{ marginTop: 6, color: '#EF4444' }}
                  aria-live="polite"
                >
                  {errors.billAmount}
                </p>
              ) : null}
            </div>
          </section>

          {/* Tip selection */}
          <section aria-labelledby="tip-section-title">
            <h2
              id="tip-section-title"
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.01em',
              }}
            >
              Tip percentage
            </h2>

            <div style={{ marginTop: 'var(--space-3)' }}>
              <div
                className="actionsRow"
                role="group"
                aria-label="Tip presets"
                style={{ justifyContent: 'flex-start' }}
              >
                {PRESET_TIPS.map(pct => {
                  const isActive =
                    customTipPct.trim().length === 0 && pct === selectedTipPct
                  return (
                    <button
                      key={pct}
                      type="button"
                      className={isActive ? 'primaryBtn' : 'secondaryBtn'}
                      onClick={() => handlePresetTipClick(pct)}
                      aria-pressed={isActive}
                      style={
                        // Make preset buttons slightly more compact in a row.
                        isActive ? { padding: '10px 14px' } : { padding: '10px 14px' }
                      }
                    >
                      {pct}%
                    </button>
                  )
                })}
              </div>

              <div style={{ marginTop: 'var(--space-3)' }}>
                <label
                  htmlFor="customTipPct"
                  className="subtitle"
                  style={{ display: 'block' }}
                >
                  Custom %
                </label>
                <input
                  id="customTipPct"
                  name="customTipPct"
                  type="number"
                  inputMode="numeric"
                  min={TIP_PCT_MIN}
                  max={TIP_PCT_MAX}
                  step="1"
                  placeholder="e.g., 18"
                  value={customTipPct}
                  onChange={handleCustomTipChange}
                  aria-describedby={tipAriaDescribedBy}
                  aria-invalid={errors.tipPercent ? 'true' : 'false'}
                  aria-label="Custom tip percentage"
                  style={{
                    marginTop: 'var(--space-2)',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: errors.tipPercent
                      ? '1px solid rgba(239, 68, 68, 0.55)'
                      : '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    boxShadow: 'var(--shadow-sm)',
                    outline: 'none',
                  }}
                />
                <p id={tipHelpId} className="hint" style={{ marginTop: 8 }}>
                  Selected: <strong>{activeTipPct}%</strong> (0–100)
                </p>
                {errors.tipPercent ? (
                  <p
                    id={tipErrorId}
                    className="hint"
                    style={{ marginTop: 6, color: '#EF4444' }}
                    aria-live="polite"
                  >
                    {errors.tipPercent}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          {/* Calculate */}
          <section aria-label="Actions">
            <div className="actionsRow" style={{ justifyContent: 'center' }}>
              <button
                id="calculateBtn"
                className="primaryBtn"
                onClick={handleCalculate}
                type="button"
                disabled={!canCalculate}
                aria-disabled={!canCalculate ? 'true' : 'false'}
                style={
                  !canCalculate
                    ? {
                        opacity: 0.55,
                        cursor: 'not-allowed',
                        boxShadow: 'none',
                      }
                    : undefined
                }
              >
                Calculate
              </button>
            </div>
            {!canCalculate ? (
              <p className="hint" style={{ marginTop: 'var(--space-2)', textAlign: 'center' }}>
                Enter a valid bill amount and tip % to calculate.
              </p>
            ) : null}
          </section>

          {/* Results */}
          <section aria-labelledby="results-title">
            <h2
              id="results-title"
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.01em',
              }}
            >
              Results
            </h2>

            <div
              style={{
                marginTop: 'var(--space-3)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                background: 'rgba(59, 130, 246, 0.06)',
              }}
              aria-live="polite"
              aria-describedby={resultsHelpId}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 'var(--space-3)',
                }}
              >
                <span className="subtitle">Tip amount</span>
                <span style={{ fontWeight: 700 }}>
                  {formatCurrency(tipAmount ?? 0)}
                </span>
              </div>

              <div
                style={{
                  marginTop: 'var(--space-2)',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 'var(--space-3)',
                }}
              >
                <span className="subtitle">Total</span>
                <span style={{ fontWeight: 800, fontSize: 18 }}>
                  {formatCurrency(totalAmount ?? 0)}
                </span>
              </div>

              <p id={resultsHelpId} className="hint" style={{ marginTop: 'var(--space-3)' }}>
                {tipAmount == null || totalAmount == null
                  ? 'Press Calculate to see your results.'
                  : `Based on a bill of ${formatCurrency(billParsed.value ?? 0)} and a ${activeTipPct}% tip.`}
              </p>
            </div>
          </section>
        </main>

        <p className="footer">
          Built for small screens — labels and controls are keyboard/remote friendly.
        </p>
      </div>
    </div>
  )
}

export default App
