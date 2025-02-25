
import CubeCanvas from './CubeCanvas'
import './App.css'
import { useState } from "react";

function App() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <button onClick={() => setShowHelp(!showHelp)}>Help</button>

      {showHelp && (
        <div className="help-modal">
          <div className="help-content">
            <h2>CubeCanvas Help</h2>
            <ul className="left-align-list">
              <li>Select a cube to type moves with the keyboard</li>
              <li><strong>Face names:</strong> right, up, front, down, left, back</li>
              <li><strong>Turn faces:</strong> "r", "u", "f", "d", "l", "b"</li>
              <li><strong>Negative turns:</strong> Use "/" (e.g., "/r" or "rrr")</li>
              <li><strong>Turn the whole cube:</strong> "R", "U", "F", "D", "L", "B"</li>
              <li><strong>Undo:</strong> "Backspace" key (undo all the way to solve)</li>
              <li>
                <strong>Replay last moves:</strong> ~1 and Enter (last move), ~2 (2 moves back), up to ~9
              </li>
              <li>
                Use Tab and Shift+Tab to switch between cubes (solve and plan cube).
              </li>
              <li>
                <strong>Compound moves:</strong> &#123;rf&#125; = r f /r, [rf] = r f /r /f, &#123;f[ru]&#125;, [[fr]3u], [[fd]2u]
              </li>
              <li>
                <a href="https://github.com/rfielding/puzzled" target="_blank" rel="noopener noreferrer">
                  GitHub Project: Puzzled
                </a>
              </li>
            </ul>
            <button onClick={() => setShowHelp(false)}>Close</button>
          </div>
        </div>
      )}

      <style>{`
        .help-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.9);
          padding: 20px;
          border-radius: 10px;
          z-index: 1000;
          width: 300px;
          color: white;
        }

        .help-content {
          text-align: left;
        }

        .help-content ul {
          padding-left: 20px;
        }

        .help-content button {
          margin-top: 10px;
          padding: 5px 10px;
        }

        button {
          cursor: pointer;
        }
      `}</style>
      <br/>
      Main Cube:<br/> <CubeCanvas autoFocus={true} />
      <br />
      Scratch Cube:<br/> <CubeCanvas />
    </>
  );
}

export default App;
