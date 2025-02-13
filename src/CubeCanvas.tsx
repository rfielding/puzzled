import React, { useEffect, useRef, useState } from "react";

interface Move {
    face: string;
    direction: number; // if negative, it's an inverse of face
}

/*
 A sticker location is a multichar name that maps to a single char
 destination. For example, for a simple 3x3x3 cube:
 - corners are 3 chars. 3 faces are clockwise named
 - edges are 2 chars. 2 faces on an edge
 - middle pieces are 1 char.
 */
interface CubeState {
    /*
      example mappings involved in a u turn:
        - ufl -> u
        - ulb -> u
        - ubr -> u
        - urf -> u
        - uf -> u
        - ul -> u
        - ub -> u
        - ur -> u
        - u -> u    (center, not movin here)

      a single turn for a corner moves 3 stickers at a time per piece
      a single turn for an edge move 2 stickers at a time per piece

      swaps performced to turn u:
       ufl, urf
       urf, ubr
       ulb, ubr
       uf, ur
       ur, ub
       ub, ul
     */
    adjacencies: Map<string, string[]>;
    stickers: Map<string, string>;
    facePeriod: number;
    faceCount: number;
    moves: Move[];
}

function NewCubeState(): CubeState {
    // counter clockwise adjacencies.
    const adjacencies = new Map<string, string[]>([
        ["u", ["f", "r", "b", "l"]],
        ["r", ["u", "f", "d", "b"]],
        ["f", ["u", "l", "d", "r"]],
        ["d", ["f", "l", "b", "r"]],
        ["l", ["u", "b", "d", "f"]],
        ["b", ["u", "r", "d", "l"]],
    ]);
    const facePeriod = adjacencies.get("u")?.length ?? 0; // Use .get() for Map lookup
    const faceCount = adjacencies.size; // Map has a .size property
    var stickers = new Map<string, string>();
    // from here, the code should not be 3x3x3 specific
    for( var f in adjacencies.keys() ) {
        var faces = adjacencies.get(f);
        if( !faces ) {
            console.error("face "+f+" not found in adjacencies");
        } else {
            for( var i = 0; i < facePeriod; i++ ) {
                var corner = f + faces[i] + faces[(i+1)%faces.length];
                var edge = f + faces[i];
                stickers.set(f,f);
                stickers.set(edge,f);
                stickers.set(corner,f);
            }    
        }
    }
    return {
        adjacencies: adjacencies,
        stickers: stickers,
        facePeriod: facePeriod,
        faceCount: faceCount,
        moves: []
    };
}

const CubeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cubeState, setCubeState] = useState(NewCubeState()); // Placeholder for cube logic

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize Cube Draw
    drawCube(ctx);

    // Keyboard event handler
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["u", "r", "f", "d", "l", "b"].includes(key)) {
        console.log(`Clockwise turn: ${key}`);
        updateCubeState(key);
      } else if (key === "/") {
        console.log("Counterclockwise mode activated. Press a face key.");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const updateCubeState = (move: string) => {
    // Placeholder: Here you'd update the cube's internal representation
    setCubeState((prev) => ({ ...prev, lastMove: move }));
  };

  const drawCube = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Example 2D cube representation (top + front + right)
    const size = 50;
    const offsetX = 150;
    const offsetY = 100;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    // Top face
    drawSquare(ctx, offsetX, offsetY, size);
    drawSquare(ctx, offsetX + size, offsetY, size);
    drawSquare(ctx, offsetX + 2 * size, offsetY, size);

    // Front face
    drawSquare(ctx, offsetX, offsetY + size, size);
    drawSquare(ctx, offsetX + size, offsetY + size, size);
    drawSquare(ctx, offsetX + 2 * size, offsetY + size, size);

    // Right face
    drawSquare(ctx, offsetX + 2 * size, offsetY + size, size);
    drawSquare(ctx, offsetX + 2 * size, offsetY + 2 * size, size);
    drawSquare(ctx, offsetX + 2 * size, offsetY + 3 * size, size);
  };

  const drawSquare = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) => {
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.stroke();
  };

  return (
    <canvas ref={canvasRef} width={400} height={300} style={{ border: "1px solid black" }} />
  );
};

export default CubeCanvas;

