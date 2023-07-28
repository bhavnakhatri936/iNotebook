const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const Notes = require("../models/Notes");

// Get all the notes using GET: "api/auth/fetchallnotes" Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
});

// Add a new note using POST: "api/notes/addnote" Login required.
router.post(
    "/addnote",
    fetchuser,
    [
        body("title", "Enter a valid title").isLength({ min: 3 }),
        body(
            "description",
            "Description must be atleast 5 characters"
        ).isLength({ min: 5 }),
    ],
    async (req, res) => {
        try {
            const { title, description, tag } = req.body;
            // If there are errorrs return bad req and errorrs
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const notes = new Notes({
                title,
                description,
                tag,
                user: req.user.id,
            });
            const saveNotes = await notes.save();
            res.json(saveNotes);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    }
);

// Updating an existing note using PUT: "api/notes/updatenote" Login required.
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    //Create a newNote Object
    try {
        const newNote = {};
        if (title) {
            newNote.title = title;
        }
        if (description) {
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }

        // Find the note to be updated and update it
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Notes.findByIdAndUpdate(
            req.params.id,
            { $set: newNote },
            { new: true }
        );
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
});

// Deleting an existing note using DELETE: "api/notes/deletenote" Login required.
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
    try {
        // Find the note to be deleted and delete it
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({ seccess: "deleted", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;
