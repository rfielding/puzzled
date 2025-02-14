import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import CubeCanvas from './CubeCanvas'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h2><a href="https://github.com/rfielding/puzzled">https://github.com/rfielding/puzzled</a></h2>
      <ul>
        <li>turn faces: "r", "u", "f", "d", "l", "b", and "/" for negative turns like "/r"</li>
        <li>Face names are: right,up,front,down,left, and back</li>
        <li>Turn cube: "R", "U", "F", "D", "L", "B"</li>
        <li>"backspace" key to undo. Undo all the way to solve.</li>
      </ul>
      <CubeCanvas />
    </>
  )
}

export default App
