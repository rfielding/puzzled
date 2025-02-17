import CubeCanvas from './CubeCanvas'
import './App.css'

function App() {
  return (
    <>
      <CubeCanvas />
      <ul className="left-align-list">
        <li>Face names are: right,up,front,down,left, and back</li>
        <li>turn faces: "r", "u", "f", "d", "l", "b", and "/" for negative turns like "/r", or "rrr"</li>
        <li>Turn whole cube: "R", "U", "F", "D", "L", "B"</li>
        <li>"backspace" key to undo. Undo all the way to solve.</li>
        <li>Compound moves: &#123;rf&#125; = r f /r, [rf] = r f /r /f, &#123;f[ru]&#125;, [[fr]3u],[[fd]2u]</li>
        <li><a href="https://github.com/rfielding/puzzled">https://github.com/rfielding/puzzled</a></li>
      </ul>
    </>
  )
}

export default App
