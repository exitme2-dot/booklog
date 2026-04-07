export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  docs: OpenLibraryBook[];
}

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
}

export async function searchBooks(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }
    
    const data: OpenLibrarySearchResponse = await response.json();
    
    return data.docs.map(doc => ({
      id: doc.key,
      title: doc.title,
      author: doc.author_name ? doc.author_name.join(', ') : 'Unknown Author',
      coverImage: doc.cover_i 
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : undefined
    }));
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}
