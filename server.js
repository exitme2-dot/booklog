import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const BOOKS_FILE = path.join(__dirname, 'books.json');

// Memory Cache
let booksCache = [];

app.use(compression()); // Compress all responses
app.use(express.json());

// Load books from disk into cache
async function loadBooks() {
  try {
    await fs.access(BOOKS_FILE);
    const data = await fs.readFile(BOOKS_FILE, 'utf-8');
    booksCache = JSON.parse(data);
    console.log(`Loaded ${booksCache.length} books from disk.`);
  } catch {
    booksCache = [];
    await saveBooksToDisk();
  }
}

// Atomic write to disk
async function saveBooksToDisk() {
  try {
    const tempFile = `${BOOKS_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(booksCache, null, 2), 'utf-8');
    await fs.rename(tempFile, BOOKS_FILE);
  } catch (error) {
    console.error('Failed to save to disk:', error);
  }
}

loadBooks();

// GET /api/books - Returns from memory cache (Zero Disk I/O)
app.get('/api/books', (req, res) => {
  res.json(booksCache);
});

// POST /api/books/add - Incremental update (Add one)
app.post('/api/books/add', async (req, res) => {
  try {
    const newBook = req.body;
    booksCache = [newBook, ...booksCache];
    await saveBooksToDisk();
    res.status(201).json({ message: 'Book added' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// DELETE /api/books/:id - Incremental update (Delete one)
app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const initialLength = booksCache.length;
  booksCache = booksCache.filter(b => b.id !== id);
  
  if (booksCache.length === initialLength) {
    return res.status(404).json({ error: 'Book not found' });
  }
  
  await saveBooksToDisk();
  res.json({ message: 'Book deleted' });
});

// Fallback: Full update (Keep for compatibility)
app.post('/api/books', async (req, res) => {
  try {
    booksCache = req.body;
    await saveBooksToDisk();
    res.json({ message: 'Books synced' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync books' });
  }
});

app.listen(PORT, () => {
  console.log(`Optimized server is running on http://localhost:${PORT}`);
});
