const express = require('express');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all books for user
router.get('/', auth, async (req, res) => {
  try {
    const books = await Book.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new book
router.post('/', auth, async (req, res) => {
  try {
    const { title, author, tags, status } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required' });
    }

    const book = new Book({
      title,
      author,
      tags: tags || [],
      status: status || 'Want to Read',
      userId: req.user._id
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update book
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, author, tags, status } = req.body;

    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, author, tags, status },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete book
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
