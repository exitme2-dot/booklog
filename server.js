import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import { kv } from '@vercel/kv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const BOOKS_FILE = path.join(__dirname, 'books.json');
const LIBRARY_MD = path.join(__dirname, 'my_library.md');
const KV_KEY = 'booklog_books';

// Memory Cache
let booksCache = [];
let isKvEnabled = !!process.env.KV_REST_API_URL;

app.use(compression());
app.use(express.json());

// Initialize & Load books
async function loadBooks() {
  if (isKvEnabled) {
    try {
      const data = await kv.get(KV_KEY);
      booksCache = data || [];
      console.log(`Loaded ${booksCache.length} books from Vercel KV.`);
    } catch (error) {
      console.error('Failed to load from Vercel KV, falling back to local:', error);
      isKvEnabled = false;
      await loadBooksFromFile();
    }
  } else {
    await loadBooksFromFile();
  }
}

async function loadBooksFromFile() {
  try {
    await fs.access(BOOKS_FILE);
    const data = await fs.readFile(BOOKS_FILE, 'utf-8');
    booksCache = JSON.parse(data);
    console.log(`Loaded ${booksCache.length} books from local disk.`);
  } catch {
    booksCache = [];
    await saveBooksToDisk();
  }
}

// Atomic write to Storage (KV or Disk)
async function syncStorage() {
  if (isKvEnabled) {
    try {
      await kv.set(KV_KEY, booksCache);
    } catch (error) {
      console.error('Failed to sync to Vercel KV:', error);
    }
  } else {
    await saveBooksToDisk();
  }
}

async function saveBooksToDisk() {
  try {
    const tempFile = `${BOOKS_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(booksCache, null, 2), 'utf-8');
    await fs.rename(tempFile, BOOKS_FILE);
  } catch (error) {
    console.error('Failed to save to disk:', error);
  }
}

// Append to Markdown Library
async function appendToMarkdown(book) {
  try {
    const date = new Date().toLocaleDateString('ko-KR');
    const mdContent = `\n### ${book.title}\n- 저자: ${book.author}\n- 평점: ${'⭐'.repeat(book.rating || 0)}\n- 기록일: ${date}\n> ${book.review || '한줄평이 없습니다.'}\n\n---\n`;
    await fs.appendFile(LIBRARY_MD, mdContent, 'utf-8');
    console.log(`Added '${book.title}' to my_library.md`);
  } catch (error) {
    console.error('Failed to append to Markdown library:', error);
  }
}

loadBooks();

// API Endpoints
app.get('/api/books', (req, res) => {
  res.json(booksCache);
});

app.post('/api/books/add', async (req, res) => {
  try {
    const newBook = req.body;
    booksCache = [newBook, ...booksCache];
    await syncStorage();
    
    // Add to Markdown library (Only locally or where FS is writable)
    if (!isKvEnabled) {
      await appendToMarkdown(newBook);
    }
    
    res.status(201).json({ message: 'Book added' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add book' });
  }
});


app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const initialLength = booksCache.length;
  booksCache = booksCache.filter(b => b.id !== id);
  
  if (booksCache.length === initialLength) {
    return res.status(404).json({ error: 'Book not found' });
  }
  
  await syncStorage();
  res.json({ message: 'Book deleted' });
});

app.post('/api/books', async (req, res) => {
  try {
    booksCache = req.body;
    await syncStorage();
    res.json({ message: 'Books synced' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync books' });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Hybrid server is running on http://localhost:${PORT}`);
    console.log(`Vercel KV: ${isKvEnabled ? 'ENABLED' : 'DISABLED (Using local books.json)'}`);
  });
}

export default app;
