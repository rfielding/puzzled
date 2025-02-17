import React, { useEffect, useRef, useState } from "react";


interface CubeState {
    adjacencies: Map<string, string[]>;
    opposites: Map<string, string>;
    stickers: Map<string, string>;
    facePeriod: number;
    faceCount: number;
    moves: string[]; // single character keys are tracked
    colors: Map<string,string>;
    grouped: string[];
    execution: string;
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
        grouped: [],
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
        execution: "",
    };
}

var theCubeState = NewCubeState();


function swap(cube: CubeState, a: string, b: string) {
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

interface Move {
    face: string;
    moves: Move[];
    reverse: number;
    count: number;
    isCommutator: boolean;
    isConjugate: boolean;
}

var executeFwd = function(cube: CubeState, move: Move, n: number, less:number) {
    for(var i = 0; i < move.moves.length-less; i++) {
        var m = move.moves[i];
        execute(cube, m, n);
    }   
}

var executeBwd = function(cube: CubeState, move: Move, n: number, less:number) {
    for(var i = move.moves.length-1-less; i >= 0; i--) {
        var m = move.moves[i];
        execute(cube, m, n);
    }   
}

var execute = function(cube: CubeState, move: Move, reverse: number) {
    // don't mutate anything while inside this loop!
    for(var c = 0; c < move.count; c++) {
        if(move.face === undefined && move.moves.length > 0) {
            var n = (move.reverse+reverse)%2;
            if(move.isCommutator) {
                if(n%2 === 0) {
                    executeFwd(cube, move, n, 0);
                    executeFwd(cube, move, n+1, 0);
                } else {
                    executeBwd(cube, move, n+1, 0);
                    executeBwd(cube, move, n, 0);
                }        
            } else if(move.isConjugate) {
                if(n%2 === 0) {
                    executeFwd(cube, move, n, 0);
                    executeBwd(cube, move, n+1, 1);
                } else {
                    executeFwd(cube, move, n+1, 1);
                    executeBwd(cube, move, n, 0);
                }        
            } else {
                if(n%2 === 0) {
                    executeFwd(cube, move, n, 0);
                } else {
                    executeBwd(cube, move, n, 0);
                }        
            }
        } else if(move.face.length > 0) {
            var lk = move.face.toLowerCase();
            var turn = Turn;
            if( move.face === move.face.toUpperCase() ){
                turn = TurnAll;
            }
            if((move.reverse+reverse)%2 === 1) {
                turn(cube, lk);
                turn(cube, lk);
                turn(cube, lk);
                cube.execution +="/" + move.face;
            } else {
                turn(cube, lk);
                cube.execution += "" + move.face;
            }
        }
    }
}

var apply = function(cube: CubeState, move: string, reverse: number) {
    //console.log("apply: "+reverse+" "+move);
    if(move.length > 0 && move[0] === "/") {
        move = move.substring(1);
        reverse++;
    }
    var ms = [] as Move[];
    ms.push({reverse:0,count:1} as Move);
    for(var i=0; i < move.length; i++) {
        if(ms.length==1 && move[i] === "/") {
            ms[ms.length-1].reverse++;
        } else if(ms.length==1 && ["u","r","f","d","l","b"].includes(move[i].toLowerCase())) {
            ms[ms.length-1].face = move[i];
        } else if(ms.length==1 && "0" < move[i] && move[i] <= "9") {
            var count = 0;
            while(i < move.length && "0" <= move[i] && move[i] <= "9") {
                count = count*10 + parseInt(move[i]);
                i++;
            }
            i--;
            ms[ms.length-1].count = count;
        } else if(["(","{","["].includes(move[i])) {
            var n = 0;
            if(move.length > 0 && move[i-1] === "/") {
                n++;
            }
            var top = {moves:[] as Move[],reverse:n,count:1} as Move;
            if(move[i] === "[") {
                top.isCommutator = true;
            }
            if(move[i] === "{") {
                top.isConjugate = true;
            }
            ms.push(top);
        } else if(["u","r","f","d","l","b"].includes(move[i].toLowerCase())) {
            var n = 0;
            if(move.length > 0 && move[i-1] === "/") {
                n++;
            }
            ms[ms.length-1].moves.push({face:move[i],reverse:n,count:1} as Move);
        } else if([")","}","]"].includes(move[i])) {
            var top = ms.pop() as Move;
            if(ms[ms.length-1].moves === undefined) {
                ms[ms.length-1].moves = [] as Move[]
            }
            ms[ms.length-1].moves.push(top);
        } else if("0" <= move[i] && move[i] <= "9") {
            var count = 0;
            while(i < move.length && "0" <= move[i] && move[i] <= "9") {
                count = count*10 + parseInt(move[i]);
                i++;
            }
            i--;
            var top = ms.pop() as Move;
            var last = top.moves.pop() as Move;
            last.count = count;
            top.moves.push(last);
            ms.push(top);
        }
    }
    var result = ms[0];
    cube.execution = "";
    execute(cube, result, reverse);
}


// Mutate the cube with a char by char parse, so that
// user can just type fluently without carriage returns,
// backspace to undo, etc.
function Move(cube: CubeState, event: KeyboardEvent) {
    // limit to plausible characters
    if(![
        "u", "r", "f", "d", "l", "b", 
        "U", "R", "F", "D", "L", "B",
        "/","(",")","{","}","[","]"," ",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "Backspace",
        "Enter",
    ].includes(event.key)) {
        return;
    }

    var k = event.key;

    var move = k;
    if(k === "Enter" && cube.grouped.length > 0) {
        return;
    }
    if(k === "Backspace") {
        if(cube.grouped.length > 0) {
            cube.grouped.pop();
            return;
        }

        // replay top of stack in reverse
        var topStr = cube.moves.pop();
        if(topStr === undefined) {
            return;
        }
        move = topStr;
        apply(cube, move, 1);
    } else if(k === "{" || k === "(" || k === "[") {
        cube.grouped.push(k);
    } else if(k === "}" || k === ")" || k === "]") {
        var openbrace = new Map<string,string>([
            [")","("],
            ["}","{"],
            ["]","["],
        ]);
        var top = cube.grouped.pop();
        if(top === undefined) {
            return;
        }
        if(top[0] !== openbrace.get(k)) {
            return;
        }
        top += k;
        if(cube.grouped.length > 0) {
            cube.grouped[cube.grouped.length-1] += top;
        } else {
            if(cube.moves.length > 0 && cube.moves[cube.moves.length-1] === "/") {
                cube.moves.pop();
                top = "/"+top;
            }
            cube.moves.push(top);
            apply(cube, top, 0);
        }
    } else if(cube.grouped.length > 0) {
        cube.grouped[cube.grouped.length-1] += k;
    } else {
        // on enter, just reproduce the last move
        if(k === "Enter") {
            if(cube.moves.length > 0) {
                move = cube.moves[cube.moves.length-1];
                k =  move;    
            } else {
                return;
            }
        } 
        while(cube.moves.length > 0 && cube.moves[cube.moves.length-1] === "/") {
            move = cube.moves.pop() + move;
        }
        //eliminate double negations as we go
        if(cube.moves[cube.moves.length-1] === "//") {
            cube.moves.pop();
        }
        if("0" <= k && k <= "9") {
            // undo what is on the stack and redo it.
            if(cube.moves.length > 0) {
                var pop = cube.moves.pop() ?? "";
                apply(cube, pop, 1);
                move = pop + k;
            }
        }
        if(move === "Enter") {
            return;
        }
        cube.moves.push(move);
        if(move != "/" && move != "") {
            apply(cube, move, 0);
        }
    }
}

const CubeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cubeState, setCubeState] = useState({...theCubeState});

  const updateCubeState = () => {
    // Placeholder: Here you'd update the cube's internal representation
    setCubeState(() => ({...cubeState}));
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

  // yup! just draw every single sticker.
  // if there is a short and explicit algorithm to 
  // draw cubes via a short algorithm, then it will
  // be easy to support other kinds of cubes.
  // but for now, this is a few hours of work!
  const drawCubeView = (
    ctx: CanvasRenderingContext2D, 
    placements: number[],
    remap: Map<string,string>,
  ) => {
    var x = placements[0];
    var y = placements[1];
    var size = placements[2];
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

  // drawing AND hit testing
  const size = 40;
  const placements = new Map<string, number[]>(
    [
        ["u", [2.75*size+10, -0.65*size, size/2]],
        ["r", [6.6*size, 3.1*size, size/2]],
        ["f", [size+10, size+10, size]],
        ["d", [2.75*size+10, 6.5*size, size/2]],
        ["l", [-0.6*size, 3.0*size, size/2]],
        ["b", [2.6*size+6.9*size, 3.7*size, size/3]],
    ]
  );

  const drawCube = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Example 2D cube representation (top + front + right)
    ctx.lineWidth = 1.0;

    if(cubeState.facePeriod === 4 && cubeState.faceCount === 6) {
        drawCubeView(ctx, placements.get("f") as number[], new Map<string,string>([
            ["u","u"],
            ["r","r"],
            ["f","f"],
            ["d","d"],
            ["l","l"],
            ["b","b"],
        ]));

        drawCubeView(ctx, placements.get("u") as number[], new Map<string,string>([
            ["u","b"],
            ["r","r"],
            ["f","u"],
            ["d","f"],
            ["l","l"],
            ["b","d"],
        ]));

        drawCubeView(ctx, placements.get("d") as number[], new Map<string,string>([
            ["u","f"],
            ["r","r"],
            ["f","d"],
            ["d","b"],
            ["l","l"],
            ["b","u"],
        ]));        

        drawCubeView(ctx,placements.get("l") as number[],new Map<string,string>([
            ["u","u"],
            ["r","f"],
            ["f","l"],
            ["d","d"],
            ["l","b"],
            ["b","r"],
        ]));
        drawCubeView(ctx,placements.get("r") as number[],new Map<string,string>([
            ["u","u"],
            ["r","b"],
            ["f","r"],
            ["d","d"],
            ["l","f"],
            ["b","l"],
        ]));

        drawCubeView(ctx,placements.get("b") as number[],new Map<string,string>([
            ["u","u"],
            ["r","l"],
            ["f","b"],
            ["d","d"],
            ["l","r"],
            ["b","f"],
        ]));

        ctx.font = "12px Monospace";
        
        // high-level moves
        ctx.fillStyle = "gray";
        var lastChars = cubeState.moves.slice(-60).join(" ");
        lastChars = lastChars.slice(-60)
        ctx.fillText(lastChars, 0*size, 11.0*size);

        // flattened out high level moves
        ctx.fillStyle = "green";
        ctx.fillText(cubeState.execution, 0*size, 10.4*size);

        // composing high-level moves
        ctx.fillStyle = "yellow";
        var grouped = cubeState.grouped.join("").slice(-60);
        ctx.fillText(grouped, 0*size, 9.7*size);
    }

  };

  const handleCanvasClick = (event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    for (const [face, [faceX, faceY, size]] of placements.entries()) {
        // stickers are scaled by size and start at 2.0 and are 1x1 before scaling
        // let's hit on the 9x9 grid of stickers
        var xlo = faceX + 2*size;
        var ylo = faceY + 2*size;
        var xhi = faceX + 5*size;
        var yhi = faceY + 5*size;
        if (xlo <= clickX && clickX <= xhi &&
            ylo <= clickY && clickY <= yhi) {
            Turn(theCubeState, face);
            theCubeState.moves.push(face);
            setCubeState({ ...theCubeState });
        }
    }
};

useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", handleCanvasClick);

    return () => {
        canvas.removeEventListener("mousedown", handleCanvasClick);
    };
}, [canvasRef.current]); 

  return (
    <canvas ref={canvasRef} width={550} height={510} style={{ border: "1px solid black" }} />
  );
};

export default CubeCanvas;

