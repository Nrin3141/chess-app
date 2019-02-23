import React from "react";
import "./App.css";
import { getDefaultState } from "./helpers/getDefaultState.js";
import { convertPos } from "./helpers/convertPos.js";
import { createFieldMarkers } from "./tileMarkers/createFieldMarkers.js";
import { validateMove } from "./helpers/validateMove.js";
import { checkForCheck } from "./gameFunctions/checkForCheck.js";
import { updateBoard, removeMarkers } from "./gameFunctions/updateBoard.js";
import { changeTurns } from "./helpers/changeTurns.js";
import { checkForCheckMate, checkForRemis } from "./gameFunctions/endGame.js";
import { RevertLastMoveInstructions } from "./helpers/RevertLastMoveInstructions.js";
import { invertColor } from "./helpers/invertColor.js";
import Board from "./components/Board";
import Dashboard from "./components/Dashboard";
import { checkForMovedKing } from "./helpers/movedRochadeFigures.js";

import { withTracker } from "meteor/react-meteor-data";
import { States } from "../../api/states.js";

class ChessApp extends React.Component {
  constructor(props) {
    super(props);
  }
  handleClick = field => {
    if (this.props.game) {
      let { row, col } = convertPos(field);
      let game = this.props.game;
      let figure = game.board[row][col].figure;

      if (game.movePart === 1) {
        if (figure.color === game.figure.color) {
          Meteor.call("states.update", {
            id: "test-game",
            fieldsToUpdate: {
              board: createFieldMarkers(game.board, row, col, "valid"),
              movePart: 1,
              oldPos: { row, col },
              figure
            }
          });
        } else if (validateMove(game.board, row, col)) {
          let newPos = { row, col };
          let move = {
            figure: game.figure,
            oldPos: game.oldPos,
            newPos,
            secondFigure: figure
          };
          Meteor.call("states.update", {
            id: "test-game",
            fieldsToUpdate: {
              board: updateBoard(game.board, move),
              turn: changeTurns(game.turn),
              check: checkForCheck(game.board, game.turn),
              movePart: 0,
              checkmate: checkForCheckMate(game.board, game.turn),
              remis:
                !checkForCheckMate(game.board, game.turn) &&
                checkForRemis(game.board, game.turn)
                  ? true
                  : false,
              moveHistory: [...game.moveHistory, move]
            }
          });
        } else {
          Meteor.call("states.update", {
            id: "test-game",
            fieldsToUpdate: {
              board: removeMarkers(game.board, ["valid", "selected"]),
              movePart: 0
            }
          });
        }
      } else if (figure.color === game.turn) {
        Meteor.call("states.update", {
          id: "test-game",
          fieldsToUpdate: {
            board: createFieldMarkers(game.board, row, col, "valid"),
            movePart: 1,
            oldPos: { row, col },
            figure
          }
        });
      }
    }
  };
  handleUndo = () => {
    if (this.props.game) {
      let game = this.props.game;
      let move = RevertLastMoveInstructions(game.moveHistory);
      Meteor.call("states.update", {
        id: "test-game",
        fieldsToUpdate: {
          board: updateBoard(game.board, move, false, true),
          turn: changeTurns(game.turn),
          movePart: 0,
          moveHistory: game.moveHistory.slice(0, -1),
          check: checkForCheck(game.board, game.turn),
          checkmate: false,
          remis: false
        }
      });
    }
  };
  handleNewGame = () => {
    if (!!States.find({ id: "test-game" }).fetch()[0]) return;
    Meteor.call("states.createNew", "test-game");
  };
  resetBoard = () => {
    Meteor.call("states.update", {
      id: "test-game",
      fieldsToUpdate: getDefaultState()
    });
  };
  render() {
    return (
      <div>
        {this.props.game ? (
          <div>
            <Board
              board={this.props.game.board}
              handleClick={this.handleClick}
            />
            <Dashboard
              checkmate={this.props.game.checkmate}
              remis={this.props.game.remis}
              turn={this.props.game.turn}
              resetBoard={this.resetBoard}
              handleUndo={this.handleUndo}
              moveHistory={this.props.game.moveHistory}
            />
          </div>
        ) : (
          <div>Loading...</div>
        )}
        <button onClick={this.handleNewGame}>Add a new game!</button>
      </div>
    );
  }
}
const ChessAppContainer = withTracker(({}) => {
  let game = States.find({}).fetch()[0];
  return {
    game
  };
})(ChessApp);
export default ChessAppContainer;
