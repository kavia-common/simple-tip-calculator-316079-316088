import { useMemo, useState } from 'react'
import { useTizenKeys } from './hooks/useTizenKeys'
import './App.css'

const PRESET_TIPS = [10, 15, 20]

function App() {
  const [billAmount, setBillAmount] = useState('')
  const [selectedTipPct, setSelectedTipPct] = useState(15)
  const [customTipPct, setCustomTipPct] = useState('')

  const activeTipPct = useMemo(() => {
    const trimmed = String(customTipPct ?? '').trim()
    if (trimmed.length === 0) return selectedTipPct

    const n = Number(trimmed)
    if (!Number.isFinite(n)) return selectedTipPct
    // Keep it sane; final validation rules can be added in Step 3.
    return Math.min(Math.max(n, 0), 100)
  }, [customTipPct, selectedTipPct])

  useTizenKeys({
    // Step 2: Keep remote ENTER usability by focusing the primary action.
    // (Logic is added in Step 3; for now it just prevents app from feeling "dead".)
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
  }

  function handlePresetTipClick(pct) {
    setSelectedTipPct(pct)
    setCustomTipPct('')
  }

  function handleCustomTipChange(e) {
    setCustomTipPct(e.target.value)
  }

  function handleCalculate() {
    // Placeholder only — calculation logic comes in Step 3.
    // Keeping a handler ensures the UI is wired and accessible.
    console.log('Calculate clicked', { billAmount, activeTipPct })
  }

  return (
    <div className="app">
      <div className="shell">
        <header className="header">
          <div className="titleRow">
            <div>
              <h1>Tip Calculator</h1>
              <p className="subtitle">
                Enter a bill, pick a tip, and see the total.
              </p>
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
                aria-describedby="bill-help"
                style={{
                  marginTop: 'var(--space-2)',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  boxShadow: 'var(--shadow-sm)',
                  outline: 'none',
                }}
              />
              <p id="bill-help" className="hint" style={{ marginTop: 8 }}>
                Tip: You can enter decimals (e.g., 12.99).
              </p>
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
                  const isActive = customTipPct.trim().length === 0 && pct === selectedTipPct
                  return (
                    <button
                      key={pct}
                      type="button"
                      className={isActive ? 'primaryBtn' : 'secondaryBtn'}
                      onClick={() => handlePresetTipClick(pct)}
                      aria-pressed={isActive}
                      style={
                        // Make preset buttons slightly more compact in a row.
                        isActive
                          ? { padding: '10px 14px' }
                          : { padding: '10px 14px' }
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
                  min="0"
                  max="100"
                  step="1"
                  placeholder="e.g., 18"
                  value={customTipPct}
                  onChange={handleCustomTipChange}
                  aria-label="Custom tip percentage"
                  style={{
                    marginTop: 'var(--space-2)',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    boxShadow: 'var(--shadow-sm)',
                    outline: 'none',
                  }}
                />
                <p className="hint" style={{ marginTop: 8 }}>
                  Selected: <strong>{activeTipPct}%</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Calculate */}
          <section aria-label="Actions">
            <div
              className="actionsRow"
              style={{ justifyContent: 'center' }}
            >
              <button
                id="calculateBtn"
                className="primaryBtn"
                onClick={handleCalculate}
                type="button"
              >
                Calculate
              </button>
            </div>
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
                <span style={{ fontWeight: 700 }}>$0.00</span>
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
                <span style={{ fontWeight: 800, fontSize: 18 }}>$0.00</span>
              </div>

              <p className="hint" style={{ marginTop: 'var(--space-3)' }}>
                Calculation logic will be added in Step 3.
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
