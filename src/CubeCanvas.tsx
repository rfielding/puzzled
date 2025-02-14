import React, { useEffect, useRef, useState } from "react";



interface CubeState {
    adjacencies: Map<string, string[]>;
    opposites: Map<string, string>;
    stickers: Map<string, string>;
    facePeriod: number;
    faceCount: number;
    moves: string[]; // single character keys are tracked
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
        opposites: new Map<string,string>([
            ["u", "d"],
            ["r", "l"],
            ["f", "b"],
            ["d", "u"],
            ["l", "r"],
            ["b", "f"],
        ]),
    };
}



function swap(cube: CubeState, a: string, b: string) {
    //console.log("swapping "+a+" "+b);
    var tmp = cube.stickers.get(a) ?? "black";
    cube.stickers.set(a, cube.stickers.get(b) ?? "black");
    cube.stickers.set(b, tmp);
}

function Turn(cube: CubeState, face: string) {
    // walk face and swap stickers to get a turn
    for(var n = 0; n < cube.facePeriod-1; n++) {
        var i = cube.adjacencies.get(face)![n];
        var j = cube.adjacencies.get(face)![(n+1)%cube.facePeriod];
        var k = cube.adjacencies.get(face)![(n+2)%cube.facePeriod];

        swap(cube, face+j+i, face+k+j);
        swap(cube, i+face+j, j+face+k);
        swap(cube, j+i+face, k+j+face);

        swap(cube, face+i, face+j);
        swap(cube, i+face, j+face);
    }
}

function TurnAll(cube: CubeState, face: string) {
    Turn(cube, face);
    Turn(cube, cube.opposites.get(face) ?? "x");
    Turn(cube, cube.opposites.get(face) ?? "x");
    Turn(cube, cube.opposites.get(face) ?? "x");

    // rotate middle layer
    for(var n = 0; n < cube.facePeriod-1; n++) {
        var i = cube.adjacencies.get(face)![n];
        var j = cube.adjacencies.get(face)![(n+1)%cube.facePeriod];
        var k = cube.adjacencies.get(face)![(n+2)%cube.facePeriod];

        swap(cube, i, j);

        swap(cube, i+j, j+k);
        swap(cube, j+i, k+j);
    }
}

// Mutate the cube with a char by char parse, so that
// user can just type fluently without carriage returns,
// backspace to undo, etc.
function Move(cube: CubeState, event: KeyboardEvent) {
    var k = event.key;
    if(k === "Backspace") {
        if(cube.moves.length >= 1) {
            var oldk = cube.moves.pop() ?? "Z";
            var oldnegate = false;
            if(cube.moves.length >= 1) {
                if(cube.moves[cube.moves.length-1] === "/") {
                    oldnegate = true;
                }
            }
            if(["u", "r", "f", "d", "l", "b"].includes(oldk.toLowerCase())) {
                var lk = oldk.toLowerCase();
                var turn = Turn;
                if(oldk === oldk.toUpperCase()) {
                    turn = TurnAll;
                }
                if(!oldnegate) {
                    turn(cube, lk);
                    turn(cube, lk);
                    turn(cube, lk);
                } else {
                    turn(cube, lk);
                }
            }
        }
        return;
    }

    cube.moves.push(k);
    if (["u", "r", "f", "d", "l", "b"].includes(k.toLowerCase())) {
        var prevk = undefined;
        if(cube.moves.length >= 1) {
            prevk = cube.moves[cube.moves.length-2];
        }
        var lk = k.toLowerCase();
        var turn = Turn;
        if( k === k.toUpperCase() ){
            turn = TurnAll;
        }
        if(prevk === "/") {
            turn(cube,lk);
            turn(cube,lk);
            turn(cube,lk);
        } else {
            turn(cube,lk);
        }
    }
}

var theCubeState = NewCubeState();

function RenewCubeState() {
    return {
        adjacencies: theCubeState.adjacencies,
        stickers: theCubeState.stickers,
        facePeriod: theCubeState.facePeriod,
        faceCount: theCubeState.faceCount,
        moves: theCubeState.moves,
        colors: theCubeState.colors,
        opposites: theCubeState.opposites,
    };
}

const CubeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cubeState, setCubeState] = useState(RenewCubeState());

  const updateCubeState = () => {
    // Placeholder: Here you'd update the cube's internal representation
    setCubeState(() => (RenewCubeState()));
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawCube(ctx); // Re-draw cube on state update

    const handleKeyDown = (event: KeyboardEvent) => {
        Move(cubeState, event);
        updateCubeState();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
}, [cubeState]); // ✅ Depend on cubeState to trigger updates


 

  const drawSticker = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    cube: CubeState,
    remap: Map<string,string>,
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

    // lol. allow cube rotations to be shown like this.
    if(sticker.length === 1) {
        sticker = remap.get(sticker) ?? sticker;
    } else if (sticker.length === 2) {
        var f1 = sticker[0];
        var f2 = sticker[1];
        sticker = remap.get(f1) ?? f1;
        sticker += remap.get(f2) ?? f2;
    } else if (sticker.length === 3) {  
        var f1 = sticker[0];
        var f2 = sticker[1];
        var f3 = sticker[2];
        sticker = remap.get(f1) ?? f1;
        sticker += remap.get(f2) ?? f2;
        sticker += remap.get(f3) ?? f3;
    }

    var color = cube.stickers.get(sticker);
    if(color === undefined) {
        console.error("sticker "+sticker+" not found in stickers");
        console.error(cube.stickers);
    }
    ctx.strokeStyle = "black";
    ctx.fillStyle = cube.colors.get(color ?? "gray") ?? "black";
    ctx.beginPath();
    ctx.moveTo(x+x0, y+y0);
    ctx.lineTo(x+x1, y+y1);
    ctx.lineTo(x+x2, y+y2);
    ctx.lineTo(x+x3, y+y3);
    ctx.fill();
    ctx.stroke();
  };

  const drawCubeView = (
    ctx: CanvasRenderingContext2D, 
    x: number,
    y: number,
    size: number,
    remap: Map<string,string>,
  ) => {
    drawSticker(
        ctx, x,y, cubeState, remap,
        "flu",
        2*size, 2*size, 
        3*size, 2*size,
        3*size, 3*size,
        2*size, 3*size, 
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "fu",
        3*size,2*size,
        4*size,2*size,
        4*size,3*size,
        3*size,3*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "fur",
        4*size,2*size,
        5*size,2*size,
        5*size,3*size,
        4*size,3*size,
    );

    drawSticker(
        ctx, x,y, cubeState, remap,
        "fl",
        2*size, 3*size,
        3*size, 3*size,
        3*size, 4*size,
        2*size, 4*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "f",
        3*size, 3*size,
        4*size, 3*size,
        4*size, 4*size,
        3*size, 4*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "fr",
        4*size, 3*size,
        5*size, 3*size,
        5*size, 4*size,
        4*size, 4*size,
    );

    drawSticker(
        ctx, x,y, cubeState, remap,
        "fdl",
        2*size, 4*size,
        3*size, 4*size,
        3*size, 5*size,
        2*size, 5*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "fd",
        3*size, 4*size,
        4*size, 4*size,
        4*size, 5*size,
        3*size, 5*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "frd",
        4*size, 4*size,
        5*size, 4*size,
        5*size, 5*size,
        4*size, 5*size,
    );

    var skew1 = 0.25;
    //var skew2 = 0.5;

    drawSticker(
        ctx, x,y, cubeState, remap,
        "ufl",
        (2-skew1)*size, (2-skew1)*size,
        (3)*size,       (2-skew1)*size,
        (3)*size,        2*size,
        (2)*size,        2*size,
    );

    drawSticker(
        ctx, x,y, cubeState, remap,
        "uf",
        (3)*size, (2-skew1)*size,
        (4)*size, (2-skew1)*size,
        (4)*size,        2*size,
        (3)*size,        2*size,
    );

    drawSticker(
        ctx, x,y, cubeState, remap,
        "urf",
        (4)*size, (2-skew1)*size,
        (5+skew1)*size, (2-skew1)*size,
        (5)*size,        2*size,
        (4)*size,        2*size,
    );


    drawSticker(
        ctx, x,y, cubeState, remap,
        "ul",
        (2-2*skew1)*size, (2-2*skew1)*size,
        (3)*size,       (2-2*skew1)*size,
        (3)*size,        (2-skew1)*size,
        (2-skew1)*size,  (2-skew1)*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "u",
        (3)*size, (2-2*skew1)*size,
        (4)*size, (2-2*skew1)*size,
        (4)*size,        (2-skew1)*size,
        (3)*size,        (2-skew1)*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "ur",
        (4)*size, (2-2*skew1)*size,
        (5+2*skew1)*size, (2-2*skew1)*size,
        (5+skew1)*size, (2-skew1)*size,
        (4)*size,        (2-skew1)*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "ulb",
        (2-3*skew1)*size, (2-3*skew1)*size,
        (3)*size,         (2-3*skew1)*size,
        (3)*size,         (2-2*skew1)*size,
        (2-2*skew1)*size,   (2-2*skew1)*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "ub",
        (3)*size, (2-3*skew1)*size,
        (4)*size, (2-3*skew1)*size,
        (4)*size, (2-2*skew1)*size,
        (3)*size, (2-2*skew1)*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "ubr",
        (4)*size, (2-3*skew1)*size,
        (5+3*skew1)*size, (2-3*skew1)*size,
        (5+2*skew1)*size, (2-2*skew1)*size,
        (4)*size, (2-2*skew1)*size,
    );

    drawSticker(
        ctx, x,y, cubeState, remap,
        "dlf",
        (2)*size, (5)*size,
        (3)*size,       (5)*size,
        (3)*size,        (5+skew1)*size,
        (2-skew1)*size,  (5+skew1)*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "df",
        (3)*size, (5)*size,
        (4)*size, (5)*size,
        (4)*size,        (5+skew1)*size,
        (3)*size,        (5+skew1)*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "dfr",
        (4)*size, (5)*size,
        (5)*size, (5)*size,
        (5+skew1)*size,        (5+skew1)*size,
        (4)*size, (5+skew1)*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "dl",
        (2-skew1)*size, (5+skew1)*size,
        (3)*size,       (5+skew1)*size,
        (3)*size,        (5+2*skew1)*size,
        (2-2*skew1)*size,  (5+2*skew1)*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "d",
        (3)*size, (5+skew1)*size,
        (4)*size, (5+skew1)*size,
        (4)*size,        (5+2*skew1)*size,
        (3)*size,        (5+2*skew1)*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "dr",
        (4)*size, (5+skew1)*size,
        (5+skew1)*size, (5+skew1)*size,
        (5+2*skew1)*size,        (5+2*skew1)*size,
        (4)*size, (5+2*skew1)*size,
    );

    drawSticker(
        ctx, x,y, cubeState, remap,
        "dbl",
        (2-2*skew1)*size, (5+2*skew1)*size,
        (3)*size,       (5+2*skew1)*size,
        (3)*size,        (5+3*skew1)*size,
        (2-3*skew1)*size,  (5+3*skew1)*size,
    );
    drawSticker(
        ctx, x,y, cubeState, remap,
        "db",
        (3)*size, (5+2*skew1)*size,
        (4)*size, (5+2*skew1)*size,
        (4)*size,        (5+3*skew1)*size,
        (3)*size,        (5+3*skew1)*size,
    );
    drawSticker(
        ctx,  x,y,cubeState, remap,
        "drb",
        (4)*size, (5+2*skew1)*size,
        (5+2*skew1)*size, (5+2*skew1)*size,
        (5+3*skew1)*size,        (5+3*skew1)*size,
        (4)*size,        (5+3*skew1)*size,
    );

    drawSticker(
        ctx,  x,y,cubeState, remap,
        "lbu",
        (2-3*skew1)*size, (2-3*skew1)*size,
        (2-2*skew1)*size, (2-2*skew1)*size,
        (2-2*skew1)*size, (3)*size,
        (2-3*skew1)*size, (3)*size,
    );
    drawSticker(
        ctx,  x,y,cubeState, remap,
        "lu",
        (2-2*skew1)*size, (2-2*skew1)*size,
        (2-skew1)*size, (2-skew1)*size,
        (2-skew1)*size, (3)*size,
        (2-2*skew1)*size, (3)*size,
    );
    drawSticker(
        ctx,  x,y,cubeState, remap,
        "luf",
        (2-skew1)*size, (2-skew1)*size,
        (2)*size, (2)*size,
        (2)*size, (3)*size,
        (2-skew1)*size, (3)*size,
    );
    drawSticker(
        ctx,  x,y,cubeState, remap,
        "lb",
        (2-3*skew1)*size, (3)*size,
        (2-2*skew1)*size, (3)*size,
        (2-2*skew1)*size, (4)*size,
        (2-3*skew1)*size, (4)*size,
    );
    drawSticker(
        ctx,  x,y,cubeState, remap,
        "l",
        (2-2*skew1)*size, (3)*size,
        (2-skew1)*size, (3)*size,
        (2-skew1)*size, (4)*size,
        (2-2*skew1)*size, (4)*size,
    );
    drawSticker(
        ctx,  x,y,cubeState, remap,
        "lf",
        (2-skew1)*size, (3)*size,
        (2)*size, (3)*size,
        (2)*size, (4)*size,
        (2-skew1)*size, (4)*size,
    );
    drawSticker(
        ctx,  x,y,cubeState, remap,
        "ldb",
        (2-3*skew1)*size, (4)*size,
        (2-2*skew1)*size, (4)*size,
        (2-2*skew1)*size, (5+2*skew1)*size,
        (2-3*skew1)*size, (5+3*skew1)*size,
    );
    drawSticker(
        ctx,  x,y,cubeState, remap,
        "ld",
        (2-2*skew1)*size, (4)*size,
        (2-skew1)*size, (4)*size,
        (2-skew1)*size, (5+skew1)*size,
        (2-2*skew1)*size, (5+2*skew1)*size,
    );
    drawSticker(
        ctx,  x,y,cubeState, remap,
        "lfd",
        (2-skew1)*size, (4)*size,
        (2)*size, (4)*size,
        (2)*size, (5)*size,
        (2-skew1)*size, (5+skew1)*size,
    );

    drawSticker(
        ctx,  x,y,cubeState, remap,
        "rfu",
        (5)*size, (2)*size,
        (5+skew1)*size, (2-skew1)*size,
        (5+skew1)*size, (3)*size,
        (5)*size, (3)*size,
    );

    drawSticker(
        ctx,  x,y,cubeState, remap,
        "ru",
        (5+skew1)*size, (2-skew1)*size,
        (5+2*skew1)*size, (2-2*skew1)*size,
        (5+2*skew1)*size, (3)*size,
        (5+skew1)*size, (3)*size,
    );
    drawSticker(
        ctx,  x,y,cubeState, remap,
        "rub",
        (5+2*skew1)*size, (2-2*skew1)*size,
        (5+3*skew1)*size, (2-3*skew1)*size,
        (5+3*skew1)*size, (3)*size,
        (5+2*skew1)*size, (3)*size,
    );

    drawSticker(
        ctx,  x,y,cubeState, remap,
        "rf",
        (5)*size, (3)*size,
        (5+skew1)*size, (3)*size,
        (5+skew1)*size, (4)*size,
        (5)*size, (4)*size,
    );

    drawSticker(
        ctx,  x,y,cubeState, remap,
        "r",
        (5+skew1)*size, (3)*size,
        (5+2*skew1)*size, (3)*size,
        (5+2*skew1)*size, (4)*size,
        (5+skew1)*size, (4)*size,
    );

    drawSticker(
        ctx,  x,y,cubeState, remap,
        "rb",
        (5+2*skew1)*size, (3)*size,
        (5+3*skew1)*size, (3)*size,
        (5+3*skew1)*size, (4)*size,
        (5+2*skew1)*size, (4)*size,
    );

    drawSticker(
        ctx,  x,y,cubeState, remap,
        "rdf",
        (5)*size, (4)*size,
        (5+skew1)*size, (4)*size,
        (5+skew1)*size, (5+skew1)*size,
        (5)*size, (5)*size,
    );

    drawSticker(
        ctx,  x,y,cubeState, remap,
        "rd",
        (5+skew1)*size, (4)*size,
        (5+2*skew1)*size, (4)*size,
        (5+2*skew1)*size, (5+2*skew1)*size,
        (5+skew1)*size, (5+skew1)*size,
    );

    drawSticker(
        ctx,  x,y,cubeState, remap,
        "rbd",
        (5+2*skew1)*size, (4)*size,
        (5+3*skew1)*size, (4)*size,
        (5+3*skew1)*size, (5+3*skew1)*size,
        (5+2*skew1)*size, (5+2*skew1)*size,
    );
  };

  const drawCube = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Example 2D cube representation (top + front + right)
    const size = 50;
    ctx.lineWidth = 2;

    if(cubeState.facePeriod === 4 && cubeState.faceCount === 6) {
        drawCubeView(ctx,size+10,size+10,size,new Map<string,string>([
            ["u","u"],
            ["r","r"],
            ["f","f"],
            ["d","d"],
            ["l","l"],
            ["b","b"],
        ]));

        drawCubeView(ctx,2.75*size+10,-0.65*size,size/2,new Map<string,string>([
            ["u","b"],
            ["r","r"],
            ["f","u"],
            ["d","f"],
            ["l","l"],
            ["b","d"],
        ]));

        drawCubeView(ctx,2.75*size+10,6.5*size,size/2,new Map<string,string>([
            ["u","f"],
            ["r","r"],
            ["f","d"],
            ["d","b"],
            ["l","l"],
            ["b","u"],
        ]));        

        drawCubeView(ctx,-0.6*size,3.0*size,size/2,new Map<string,string>([
            ["u","u"],
            ["r","f"],
            ["f","l"],
            ["d","d"],
            ["l","b"],
            ["b","r"],
        ]));
        drawCubeView(ctx,6.5*size,3.0*size,size/2,new Map<string,string>([
            ["u","u"],
            ["r","b"],
            ["f","r"],
            ["d","d"],
            ["l","f"],
            ["b","l"],
        ]));

        drawCubeView(ctx,2.6*size+6.5*size,3.5*size,size/3,new Map<string,string>([
            ["u","u"],
            ["r","l"],
            ["f","b"],
            ["d","d"],
            ["l","r"],
            ["b","f"],
        ]));

    }

  };


  return (
    <canvas ref={canvasRef} width={600} height={500} style={{ border: "1px solid black" }} />
  );
};

export default CubeCanvas;

