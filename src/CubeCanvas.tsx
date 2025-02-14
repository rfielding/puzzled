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
    colors: Map<string,string>;
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
    for( let f of adjacencies.keys() ) {
        //console.log("!!face "+f);
        var faces = adjacencies.get(f);
        if( !faces ) {
            console.error("face "+f+" not found in adjacencies");
        } else {
            for( var i = 0; i < facePeriod; i++ ) {
                var corner = f + faces[(i+1)%faces.length] + faces[i];
                var edge = f + faces[i];
                stickers.set(f,f);
                stickers.set(edge,f);
                stickers.set(corner,f);
                //console.log("stickering "+f+" "+edge+" "+corner);
            }    
        }
    }
    return {
        adjacencies: adjacencies,
        stickers: stickers,
        facePeriod: facePeriod,
        faceCount: faceCount,
        moves: [],
        colors: new Map<string,string>([
            ["u", "white"],
            ["r", "green"],
            ["f", "red"],
            ["d", "yellow"],
            ["l", "blue"],
            ["b", "orange"],
        ]),
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

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    if(cubeState.facePeriod === 4 && cubeState.faceCount === 6) {
        drawSticker(
            ctx, 
            cubeState, 
            "flu",
            2*size, 2*size, 
            3*size, 2*size,
            3*size, 3*size,
            2*size, 3*size, 
        );
        drawSticker(
            ctx,
            cubeState,
            "fu",
            3*size,2*size,
            4*size,2*size,
            4*size,3*size,
            3*size,3*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "fur",
            4*size,2*size,
            5*size,2*size,
            5*size,3*size,
            4*size,3*size,
        );

        drawSticker(
            ctx,
            cubeState,
            "fl",
            2*size, 3*size,
            3*size, 3*size,
            3*size, 4*size,
            2*size, 4*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "f",
            3*size, 3*size,
            4*size, 3*size,
            4*size, 4*size,
            3*size, 4*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "fr",
            4*size, 3*size,
            5*size, 3*size,
            5*size, 4*size,
            4*size, 4*size,
        );

        drawSticker(
            ctx,
            cubeState,
            "fdl",
            2*size, 4*size,
            3*size, 4*size,
            3*size, 5*size,
            2*size, 5*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "fd",
            3*size, 4*size,
            4*size, 4*size,
            4*size, 5*size,
            3*size, 5*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "frd",
            4*size, 4*size,
            5*size, 4*size,
            5*size, 5*size,
            4*size, 5*size,
        );

        var skew1 = 0.25;
        //var skew2 = 0.5;

        drawSticker(
            ctx,
            cubeState,
            "ufl",
            (2-skew1)*size, (2-skew1)*size,
            (3)*size,       (2-skew1)*size,
            (3)*size,        2*size,
            (2)*size,        2*size,
        );

        drawSticker(
            ctx,
            cubeState,
            "uf",
            (3)*size, (2-skew1)*size,
            (4)*size, (2-skew1)*size,
            (4)*size,        2*size,
            (3)*size,        2*size,
        );

        drawSticker(
            ctx,
            cubeState,
            "urf",
            (4)*size, (2-skew1)*size,
            (5+skew1)*size, (2-skew1)*size,
            (5)*size,        2*size,
            (4)*size,        2*size,
        );


        drawSticker(
            ctx,
            cubeState,
            "ul",
            (2-2*skew1)*size, (2-2*skew1)*size,
            (3)*size,       (2-2*skew1)*size,
            (3)*size,        (2-skew1)*size,
            (2-skew1)*size,  (2-skew1)*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "u",
            (3)*size, (2-2*skew1)*size,
            (4)*size, (2-2*skew1)*size,
            (4)*size,        (2-skew1)*size,
            (3)*size,        (2-skew1)*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "ur",
            (4)*size, (2-2*skew1)*size,
            (5+2*skew1)*size, (2-2*skew1)*size,
            (5+skew1)*size, (2-skew1)*size,
            (4)*size,        (2-skew1)*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "ulb",
            (2-3*skew1)*size, (2-3*skew1)*size,
            (3)*size,         (2-3*skew1)*size,
            (3)*size,         (2-2*skew1)*size,
            (2-2*skew1)*size,   (2-2*skew1)*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "ub",
            (3)*size, (2-3*skew1)*size,
            (4)*size, (2-3*skew1)*size,
            (4)*size, (2-2*skew1)*size,
            (3)*size, (2-2*skew1)*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "ubr",
            (4)*size, (2-3*skew1)*size,
            (5+3*skew1)*size, (2-3*skew1)*size,
            (5+2*skew1)*size, (2-2*skew1)*size,
            (4)*size, (2-2*skew1)*size,
        );

        drawSticker(
            ctx,
            cubeState,
            "dlf",
            (2)*size, (5)*size,
            (3)*size,       (5)*size,
            (3)*size,        (5+skew1)*size,
            (2-skew1)*size,  (5+skew1)*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "df",
            (3)*size, (5)*size,
            (4)*size, (5)*size,
            (4)*size,        (5+skew1)*size,
            (3)*size,        (5+skew1)*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "dfr",
            (4)*size, (5)*size,
            (5)*size, (5)*size,
            (5+skew1)*size,        (5+skew1)*size,
            (4)*size, (5+skew1)*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "dl",
            (2-skew1)*size, (5+skew1)*size,
            (3)*size,       (5+skew1)*size,
            (3)*size,        (5+2*skew1)*size,
            (2-2*skew1)*size,  (5+2*skew1)*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "d",
            (3)*size, (5+skew1)*size,
            (4)*size, (5+skew1)*size,
            (4)*size,        (5+2*skew1)*size,
            (3)*size,        (5+2*skew1)*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "dr",
            (4)*size, (5+skew1)*size,
            (5+skew1)*size, (5+skew1)*size,
            (5+2*skew1)*size,        (5+2*skew1)*size,
            (4)*size, (5+2*skew1)*size,
        );

        drawSticker(
            ctx,
            cubeState,
            "dbl",
            (2-2*skew1)*size, (5+2*skew1)*size,
            (3)*size,       (5+2*skew1)*size,
            (3)*size,        (5+3*skew1)*size,
            (2-3*skew1)*size,  (5+3*skew1)*size,
        );
        drawSticker(
            ctx,
            cubeState,
            "db",
            (3)*size, (5+2*skew1)*size,
            (4)*size, (5+2*skew1)*size,
            (4)*size,        (5+3*skew1)*size,
            (3)*size,        (5+3*skew1)*size,
        );
        drawSticker(
            ctx, cubeState,
            "drb",
            (4)*size, (5+2*skew1)*size,
            (5+2*skew1)*size, (5+2*skew1)*size,
            (5+3*skew1)*size,        (5+3*skew1)*size,
            (4)*size,        (5+3*skew1)*size,
        );

        drawSticker(
            ctx, cubeState,
            "lbu",
            (2-3*skew1)*size, (2-3*skew1)*size,
            (2-2*skew1)*size, (2-2*skew1)*size,
            (2-2*skew1)*size, (3)*size,
            (2-3*skew1)*size, (3)*size,
        );
        drawSticker(
            ctx, cubeState,
            "lu",
            (2-2*skew1)*size, (2-2*skew1)*size,
            (2-skew1)*size, (2-skew1)*size,
            (2-skew1)*size, (3)*size,
            (2-2*skew1)*size, (3)*size,
        );
        drawSticker(
            ctx, cubeState,
            "luf",
            (2-skew1)*size, (2-skew1)*size,
            (2)*size, (2)*size,
            (2)*size, (3)*size,
            (2-skew1)*size, (3)*size,
        );
        drawSticker(
            ctx, cubeState,
            "lb",
            (2-3*skew1)*size, (3)*size,
            (2-2*skew1)*size, (3)*size,
            (2-2*skew1)*size, (4)*size,
            (2-3*skew1)*size, (4)*size,
        );
        drawSticker(
            ctx, cubeState,
            "l",
            (2-2*skew1)*size, (3)*size,
            (2-skew1)*size, (3)*size,
            (2-skew1)*size, (4)*size,
            (2-2*skew1)*size, (4)*size,
        );
        drawSticker(
            ctx, cubeState,
            "lf",
            (2-skew1)*size, (3)*size,
            (2)*size, (3)*size,
            (2)*size, (4)*size,
            (2-skew1)*size, (4)*size,
        );
        drawSticker(
            ctx, cubeState,
            "ldb",
            (2-3*skew1)*size, (4)*size,
            (2-2*skew1)*size, (4)*size,
            (2-2*skew1)*size, (5+2*skew1)*size,
            (2-3*skew1)*size, (5+3*skew1)*size,
        );
        drawSticker(
            ctx, cubeState,
            "ld",
            (2-2*skew1)*size, (4)*size,
            (2-skew1)*size, (4)*size,
            (2-skew1)*size, (5+skew1)*size,
            (2-2*skew1)*size, (5+2*skew1)*size,
        );
        drawSticker(
            ctx, cubeState,
            "lfd",
            (2-skew1)*size, (4)*size,
            (2)*size, (4)*size,
            (2)*size, (5)*size,
            (2-skew1)*size, (5+skew1)*size,
        );

        drawSticker(
            ctx, cubeState,
            "rfu",
            (5)*size, (2)*size,
            (5+skew1)*size, (2-skew1)*size,
            (5+skew1)*size, (3)*size,
            (5)*size, (3)*size,
        );

        drawSticker(
            ctx, cubeState,
            "ru",
            (5+skew1)*size, (2-skew1)*size,
            (5+2*skew1)*size, (2-2*skew1)*size,
            (5+2*skew1)*size, (3)*size,
            (5+skew1)*size, (3)*size,
        );
        drawSticker(
            ctx, cubeState,
            "rub",
            (5+2*skew1)*size, (2-2*skew1)*size,
            (5+3*skew1)*size, (2-3*skew1)*size,
            (5+3*skew1)*size, (3)*size,
            (5+2*skew1)*size, (3)*size,
        );

        drawSticker(
            ctx, cubeState,
            "rf",
            (5)*size, (3)*size,
            (5+skew1)*size, (3)*size,
            (5+skew1)*size, (4)*size,
            (5)*size, (4)*size,
        );

        drawSticker(
            ctx, cubeState,
            "r",
            (5+skew1)*size, (3)*size,
            (5+2*skew1)*size, (3)*size,
            (5+2*skew1)*size, (4)*size,
            (5+skew1)*size, (4)*size,
        );

        drawSticker(
            ctx, cubeState,
            "rb",
            (5+2*skew1)*size, (3)*size,
            (5+3*skew1)*size, (3)*size,
            (5+3*skew1)*size, (4)*size,
            (5+2*skew1)*size, (4)*size,
        );

        drawSticker(
            ctx, cubeState,
            "rdf",
            (5)*size, (4)*size,
            (5+skew1)*size, (4)*size,
            (5+skew1)*size, (5+skew1)*size,
            (5)*size, (5)*size,
        );

        drawSticker(
            ctx, cubeState,
            "rd",
            (5+skew1)*size, (4)*size,
            (5+2*skew1)*size, (4)*size,
            (5+2*skew1)*size, (5+2*skew1)*size,
            (5+skew1)*size, (5+skew1)*size,
        );

        drawSticker(
            ctx, cubeState,
            "rbd",
            (5+2*skew1)*size, (4)*size,
            (5+3*skew1)*size, (4)*size,
            (5+3*skew1)*size, (5+3*skew1)*size,
            (5+2*skew1)*size, (5+2*skew1)*size,
        );
    }

  };
  const drawSticker = (
    ctx: CanvasRenderingContext2D,
    cube: CubeState,
    sticker: string,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
  ) => {
    var color = cube.stickers.get(sticker);
    if(color === undefined) {
        console.error("sticker "+sticker+" not found in stickers");
        console.error(cube.stickers);
    }
    ctx.strokeStyle = "black";
    ctx.fillStyle = cube.colors.get(color ?? "gray") ?? "black";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.fill();
    ctx.stroke();
  };

  return (
    <canvas ref={canvasRef} width={400} height={400} style={{ border: "1px solid black" }} />
  );
};

export default CubeCanvas;

