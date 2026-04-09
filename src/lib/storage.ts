import axios from 'axios';
import { Book } from '../types';

export const getBooks = async (): Promise<Book[]> => {
  try {
    const response = await axios.get('/api/books');
    // Ensure the response is an array before returning
    if (Array.isArray(response.data)) {
      return response.data;
    }
    console.error('Server response is not an array:', response.data);
    return [];
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
        // Send to server (using the full update)
        try {
          // saveBooks returns void, but if it throws or we update it to return success...
          // Currently saveBooks catches internally. Let's make it simpler.
          await axios.post('/api/books', books);
          
          // Clear local storage ONLY after successful server post
          localStorage.removeItem(OLD_STORAGE_KEY);
          console.log('Successfully migrated data from LocalStorage to server.');
          return true;
        } catch (serverError) {
          console.error('Failed to migrate data to server. Keeping local copy.', serverError);
          return false;
        }
      }
    }
  } catch (error) {
    console.error('Migration check failed:', error);
  }
  return false;
};



