import { useState } from 'react'
import { useTizenKeys } from './hooks/useTizenKeys'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  useTizenKeys({
    onEnter: () => setCount(c => c + 1),
    onBack: () => console.log('Back pressed'),
  })

  return (
    <div className="app">
      <div className="shell">
        <header className="header">
          <div className="titleRow">
            <div>
              <h1>Tip Calculator</h1>
              <p className="subtitle">
                Simple, mobile-friendly calculator (light theme).
              </p>
            </div>
            <span className="badge">Prototype</span>
          </div>
        </header>

        <main className="mainCard">
          <div className="actionsRow">
            <button
              className="primaryBtn"
              onClick={() => setCount(count + 1)}
              autoFocus
              type="button"
            >
              Count: {count}
            </button>
            <button
              className="secondaryBtn"
              onClick={() => setCount(0)}
              type="button"
            >
              Reset
            </button>
          </div>

          <p className="hint">
            Tip: On Tizen devices, press ENTER on the remote to increment.
          </p>
        </main>

        <p className="footer">
          Next: bill amount input, tip selection, and results.
        </p>
      </div>
    </div>
  )
}

export default App
