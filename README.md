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

Use this to make your own moves. For convenience, there is a main cube, and a scratch cube to plan on.