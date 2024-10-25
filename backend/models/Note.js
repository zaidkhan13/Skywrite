import mongoose from "mongoose";
const { Schema, model } = mongoose;

const NotesSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // unique identifier
    ref: "User", // establish a relationship between note schema and user schema
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    default: "General",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// create and export a model from a schema 
export default model("Note", NotesSchema); 
