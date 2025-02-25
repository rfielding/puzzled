# Puzzled - Online Rubiks Cube

https://rfielding.github.io/puzzled/index.html

Type on the selected cube. What is interesting is the algebra for compound moves

- r u f d l b are the main faces.
- R U F D L B turn the whole cube by that face.
- /r is a negative move, equivalent to (rrr), because a face has a period of 4.
- r/r is a move that does nothing. division to state 1.
- [rf] is a commutator that measures how faces r and f commute. [rf] = (r f)/(r f)
- [rf] = [fr] means that switching faces in a commutator undoes the commutator
- {r u f} = (ru) f /(ru), is a conjugate. It sandwiches f in an undo of (ru).
- Backspace to undo a move
- ~1 to redo previous move. ~2 for 2 moves back. you can go up to ~9
- You should use parenthesis to plan whole move executions.
- {f[ru]} turn stickers up in face u
- [[fr]3 u] to cycle 3 corners period 3
- [[fd]2 u] to twist 3 corners without moving them.
- ({l/d}[/d/f]) will put in an edge piece to help solve second layer
- Those work, because a commutator has period 6. 2 times 3 is 6, which is why important moves are at periods 2 and 3.

Use this to make your own moves. For convenience, there is a main cube, and a scratch cube to plan on.

Implementation
==============

The main idea is to move the stickers around the cube when turns are made.
In keeping with standard cube notation, faces are named by position, instead of by color.

The parser is designed to make moves IMMEDIATE. Because of this, I do not use uppercase
to manipulate the faces, nor a postfix backtick for "reverse". Because when you type "u", it
should happen right away. It's too obnoxious to make you type in upper-case as well.

The point is that backspace is natural. If you have compound moves, they are removed as 1 move.
Reverses and repeats are part of the move.