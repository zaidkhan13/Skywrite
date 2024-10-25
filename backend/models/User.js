import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: () => new Date().toGMTString(),
  },
});

// create and export a model from a schema 
export default model("User", UserSchema);
