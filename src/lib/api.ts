import axios from 'axios';

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
}

const TTB_KEY = 'ttbexitme2156001';

export async function searchBooks(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  
  try {
    const response = await axios.get('/aladin-api/ItemSearch.aspx', {
      params: {
        ttbkey: TTB_KEY,
        Query: query,
        QueryType: 'Title',
        MaxResults: 5,
        start: 1,
        SearchTarget: 'Book',
        output: 'js',
        Version: '20131101'
      }
    });
    
    const books = response.data.item;
    if (!books) return [];
    
    return books.map((doc: any) => ({
      id: doc.isbn13 || doc.isbn || doc.itemId.toString(),
      title: doc.title || '제목 없음',
      author: doc.author || '저자 미상',
      coverImage: doc.cover || undefined
    }));
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}
