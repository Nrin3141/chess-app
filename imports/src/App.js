import React from "react";
import Board from "./components/Board";
import Dashboard from "./components/Dashboard";
import PawnChangeInterface from "./components/PawnChangeInterface";
import { withTracker } from "meteor/react-meteor-data";
import { States } from "../../imports/api/states.js";
import Title from "./components/Title";

class ChessApp extends React.Component {
  constructor(props) {
    super(props);
  }

  handleFirstClick = field => {
    if (this.props.game) {
      Meteor.call("states.handleFirstClick", {
        _id: this.props.game._id,
        field,
        userId: Meteor.userId()
      });
    }
  };
  handleSecondClick = field => {
    if (this.props.game) {
      Meteor.call("states.handleSecondClick", {
        _id: this.props.game._id,
        field,
        userId: Meteor.userId()
      });
    }
  };
  handleUndo = () => {
    if (this.props.game) {
      Meteor.call("states.handleUndo", {
        _id: this.props.game._id,
        userId: Meteor.userId()
      });
    }
  };
  proposeUndo = () => {
    if (this.props.game) {
      Meteor.call("states.proposeUndo", {
        _id: this.props.game._id,
        userId: Meteor.userId()
      });
    }
  };
  revertUndoProposal = () => {
    if (this.props.game) {
      Meteor.call("states.revertUndoProposal", {
        _id: this.props.id,
        userId: Meteor.userId()
      });
    }
  };

  continueTurn = figure => {
    if (this.props.game) {
      Meteor.call("states.handlePawnChange", {
        _id: this.props.game._id,
        figure,
        userId: Meteor.userId()
      });
    }
  };
  render() {
    if (this.props.game) {
      let game = this.props.game;
      let color = game.users.find(user => user.userId === Meteor.userId())
        .color;
      return (
        <div className="AppContainer">
          <Title name={game.name} />
          <Board
            board={game.board}
            turnAround={color === "black" ? true : false}
            handleClick={
              game.movePart === 0
                ? this.handleFirstClick
                : this.handleSecondClick
            }
          />
          <PawnChangeInterface
            baseLinePawn={game.baseLinePawn}
            turn={game.turn}
            color={color}
            continueTurn={this.continueTurn}
          />
          <Dashboard
            _id={game._id}
            checkmate={game.checkmate}
            remis={game.remis}
            turn={game.turn}
            color={color}
            revertUndoProposal={this.revertUndoProposal}
            proposeUndo={this.proposeUndo}
            handleUndo={this.handleUndo}
            offerTakeback={game.offerTakeback}
            moveHistory={game.moveHistory}
          />
          <style jsx>{`
            body {
              font-size: 1.6em;
            }
            .grey {
              display: flex;
              justify-content: space-around;
              margin-top: 3%;
              background-color: grey;
            }
            @media only screen and (orientation: portrait) {
              .AppContainer {
                padding-top: 10%;
                display: block;
                text-align: center;
                height: 100vh;
                width: 100vw;
              }
              .sidebar {
                width: 90vmin;
                margin: auto;
              }
            }

            @media only screen and (orientation: landscape) {
              .AppContainer {
                padding-top: 4.1%;
                display: flex;
                height: 100vh;
                width: 100vw;
              }
              .GameTitle {
                visibility: hidden;
              }
              .sidebar {
                height: 90vmin;
                margin: auto;
              }
            }
            .turnToBlackPlayer {
              transform: translateZ(0px) rotate(180deg);
            }
            .row {
              flex-direction: row;
            }
            .column {
              flex-direction: column;
            }

            .grey {
              background-color: darkgrey;
            }
          `}</style>
        </div>
      );
    } else {
      return <div>Loading...</div>;
    }
  }
}
const ChessAppContainer = withTracker(props => {
  const _id = props.match.params.id;
  const handle = Meteor.subscribe("states");
  const game = States.find({ _id }).fetch()[0];
  return {
    id: _id,
    game
  };
})(ChessApp);
export default ChessAppContainer;
