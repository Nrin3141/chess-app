import { Mongo } from "meteor/mongo";
import { getDefaultState } from "../src/helpers/getDefaultState.js";
export const States = new Mongo.Collection("states");

if (Meteor.isServer) {
  Meteor.publish("states", function statesPublication() {
    return States.find();
  });
}

Meteor.methods({
  "states.userEntersGame"({ gameId, users }) {
    States.update(gameId, {
      $set: {
        users: [...users]
      }
    });
  },
  "states.createNew"({ name }) {
    States.insert({ name, ...getDefaultState() });
    return States.findOne({ name });
  },
  "states.update"({ _id, fieldsToUpdate }) {
    States.update(_id, { $set: { ...fieldsToUpdate } });
  },
  "states.deleteById"({ _id }) {
    States.remove({ _id });
  },
  "states.addNewMessage"({ _id, messages }) {
    States.update(_id, { $set: { messages: [...messages] } });
  }
});
