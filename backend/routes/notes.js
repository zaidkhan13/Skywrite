import express from "express";
import Note from "../models/Note.js";
import fetchUser from "../middlewares/fetchuser.js";
import { body, validationResult } from "express-validator";
const router = express.Router();

// Route 1: Get all the notes using GET "/api/notes/fetchallnotes" - Login required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    // Fetch all notes of the logged-in user using their ID from the request (set by fetchUser middleware)
    const notes = await Note.find({ user: req.user.id });
    res.json({ message: "Fetched All Notes!", notes });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error!", error });
  }
});

// Route 2: Add a new Note using POST "/api/notes/addnote" - Login required
router.post(
  "/addnote",
  fetchUser,
  [
    // Validate note input fields
    body("title")
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
    body("description")
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long"),
  ],
  async (req, res) => {
    try {
      const result = validationResult(req);

      // Check for validation errors and return if any
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      // Create and save the new note associated with the logged-in user
      const notes = await Note.create({
        user: req.user.id, // fetchUser middleware attaches user ID to req object
        title: req.body.title,
        description: req.body.description,
        tag: req.body.tag,
      });

      // Send a success response with the created note data
      res.status(201).json({ message: "Note created successfully!", notes });
    } catch (error) {
      res.status(400).json({ message: "Internal Server Error!", error });
    }
  }
);

// Route 3: Update an existing Note using PUT "/api/notes/updatenote/:id" - Login required
router.put("/updatenote/:id", fetchUser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    // Create an object to store fields that need to be updated
    const updatedNote = {};
    if (title) updatedNote.title = title;
    if (description) updatedNote.description = description;
    if (tag) updatedNote.tag = tag;

    // Find the note to be updated by its ID
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).send("Note Not Found!");

    // Ensure that only the owner of the note can update it
    if (req.user.id !== note.user.toString())
      return res.status(401).send("Not Allowed!");

    // Update the note with new values
    const newNote = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: updatedNote }, // Update only the provided fields
      { new: true } // Return the updated note
    );

    // Send a success response with the updated note data
    res.status(201).json({ message: "Note Updated successfully!", newNote });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error!", error });
  }
});

// Route 4: Delete an existing Note using DELETE "/api/notes/deletenote/:id" - Login required
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    // Find the note by its ID to be deleted
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).send("Note Not Found!");

    // Ensure that only the owner of the note can delete it
    if (req.user.id !== note.user.toString())
      return res.status(401).send("Not Allowed!");

    // Delete the note from the database
    const deletedNote = await Note.findByIdAndDelete(req.params.id);

    // Send a success response with the deleted note data
    res
      .status(201)
      .json({ message: "Note Deleted successfully!", deletedNote });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error!", error });
  }
});

export default router;
