// controllers/noteController.js
import learningModel from "../models/learningModel.js";


// Get all notes
export const getAllNotes = async (req, res) => {
  try {
    const notes = await learningModel.find({
      studentId: req.user.studentId
    })
      .sort({ updatedAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes',
      error: error.message
    });
  }
};

// Get single note by ID
export const getNoteById = async (req, res) => {
  try {

    const note = await learningModel.findOne({
      _id: req.params.id,
      studentId: req.user.studentId
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.status(200).json({
      success: true,
      note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch note',
      error: error.message
    });
  }
};

// Create new note
export const createNote = async (req, res) => {
  try {

    const { content, linkPreviews, isPrivate, isArchived, isFullWidth } = req.body;

    const note = await learningModel.create({
      studentId: req.user.studentId,
      content: content || '',
      linkPreviews: linkPreviews || {},
      isPrivate: isPrivate || false,
      isArchived: isArchived || false,
      isFullWidth: isFullWidth || false
    });

    res.status(201).json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create note',
      error: error.message
    });
  }
};

// Update note
export const updateNote = async (req, res) => {
  try {

    const { content, linkPreviews, isPrivate, isArchived, isFullWidth } = req.body;

    const note = await learningModel.findOne({
      _id: req.params.id,
      studentId: req.user.studentId
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    if (content !== undefined) note.content = content;
    if (linkPreviews !== undefined) note.linkPreviews = linkPreviews;
    if (isPrivate !== undefined) note.isPrivate = isPrivate;
    if (isArchived !== undefined) note.isArchived = isArchived;
    if (isFullWidth !== undefined) note.isFullWidth = isFullWidth;

    await note.save();

    res.status(200).json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note',
      error: error.message
    });
  }
};

// Delete note
export const deleteNote = async (req, res) => {
  try {

    const note = await learningModel.findOneAndDelete({
      _id: req.params.id,
      studentId: req.user.studentId
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or not authorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete note',
      error: error.message
    });
  }
};

// Get archived notes
export const getArchivedNotes = async (req, res) => {
  try {

    const notes = await learningModel.find({
      studentId: req.user.studentId,
      isArchived: true
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Error fetching archived notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch archived notes',
      error: error.message
    });
  }
};

// Search notes
export const searchNotes = async (req, res) => {
  try {

    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const notes = await learningModel.find({
      studentId: req.user.studentId,
      content: { $regex: query, $options: 'i' }
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Error searching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search notes',
      error: error.message
    });
  }
};