import axios from 'axios';
import { Book } from '../types';

export const getBooks = async (): Promise<Book[]> => {
  try {
    const response = await axios.get('/api/books');
    return response.data;
  } catch (error) {
    console.error('Failed to load books from server', error);
    return [];
  }
};

export const saveBooks = async (books: Book[]): Promise<void> => {
  try {
    await axios.post('/api/books', books);
  } catch (error) {
    console.error('Failed to save books to server', error);
  }
};

export const addBookToServer = async (book: Book): Promise<void> => {
  try {
    await axios.post('/api/books/add', book);
  } catch (error) {
    console.error('Failed to add book to server', error);
  }
};

export const deleteBookFromServer = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/api/books/${id}`);
  } catch (error) {
    console.error('Failed to delete book from server', error);
  }
};

export const migrateLibraryFromLocalStorage = async (): Promise<boolean> => {
  try {
    const OLD_STORAGE_KEY = 'booklog_data';
    const localData = localStorage.getItem(OLD_STORAGE_KEY);
    
    if (localData) {
      const books = JSON.parse(localData);
      if (Array.isArray(books) && books.length > 0) {
        // Send to server (using the full update fallback)
        await saveBooks(books);
        // Clear local storage to prevent duplicate migration
        localStorage.removeItem(OLD_STORAGE_KEY);
        console.log('Successfully migrated data from LocalStorage to server.');
        return true;
      }
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
  return false;
};



