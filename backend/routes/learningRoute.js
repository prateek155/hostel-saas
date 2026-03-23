// routes/noteRoutes.js
import express from "express";
import { requireSignIn, isStudent } from "../middlewares/authMiddleware.js";
import {
    getAllNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    getArchivedNotes,
    searchNotes
 } from "../controllers/learningController.js";

const router = express.Router();

// GET all notes
router.get('/all-notes',requireSignIn, isStudent, getAllNotes);

// GET single note by ID
router.get('/notes/:id',requireSignIn, isStudent, getNoteById);

// POST create new note
router.post('/notes',requireSignIn, isStudent, createNote);

// PUT update note
router.put('/notes/:id',requireSignIn, isStudent, updateNote);

// DELETE note
router.delete('/notes/:id', requireSignIn, isStudent, deleteNote);

// GET archived notes
router.get('/notes/archived/all',requireSignIn, isStudent,  getArchivedNotes);

// GET search notes
router.get('/notes/search/query',requireSignIn, isStudent, searchNotes);

export default router;