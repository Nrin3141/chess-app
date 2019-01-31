import { createFieldMarkers } from "../tileMarkers/createFieldMarkers.js";
import { invertColor } from "../helpers/invertColor.js";
import { findFigures } from "../helpers/findFigures.js";
import { areThereNoMoreValidMoves } from "../helpers/areThereNoMoreValidMoves.js";

export function checkForRemis(board, color) {
  board = JSON.parse(JSON.stringify(board));
  let possibleFiguresToMove = findFigures(board, invertColor(color));
  possibleFiguresToMove.forEach(tile => {
    board = createFieldMarkers(board, tile.row, tile.col, "valid", true);
  });
  return areThereNoMoreValidMoves(board);
}
