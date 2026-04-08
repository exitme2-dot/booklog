import axios from 'axios';

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
}

const TTB_KEY = 'ttbexitme2156001';

export async function searchBooks(query: string, start: number = 1, maxResults: number = 5): Promise<{ books: SearchResult[], totalResults: number }> {
  if (!query.trim()) return { books: [], totalResults: 0 };
  
  try {
    const response = await axios.get('/aladin-api/ItemSearch.aspx', {
      params: {
        ttbkey: TTB_KEY,
        Query: query,
        QueryType: 'Title',
        MaxResults: maxResults,
        start: start,
        SearchTarget: 'Book',
        output: 'js',
        Version: '20131101'
      }
    });
    
    const items = response.data.item;
    const totalResults = response.data.totalResults || 0;
    
    if (!items) return { books: [], totalResults: 0 };
    
    const books = items.map((doc: any) => ({
      id: doc.isbn13 || doc.isbn || doc.itemId.toString(),
      title: doc.title || '제목 없음',
      author: doc.author || '저자 미상',
      coverImage: doc.cover || undefined
    }));

    return { books, totalResults };
  } catch (error) {
    console.error('Error searching books:', error);
    return { books: [], totalResults: 0 };
  }
}

export async function getBestseller(): Promise<SearchResult | null> {
  const CACHE_KEY = 'weekly_recommendation_cache';
  const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  try {
    // Check cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
      }
    }

    const response = await axios.get('/aladin-api/ItemList.aspx', {
      params: {
        ttbkey: TTB_KEY,
        QueryType: 'Bestseller',
        MaxResults: 1,
        SearchTarget: 'Book',
        output: 'js',
        Version: '20131101'
      }
    });

    const item = response.data.item?.[0];
    if (!item) return null;

    const bestseller = {
      id: item.isbn13 || item.isbn || item.itemId.toString(),
      title: item.title,
      author: item.author,
      coverImage: item.cover
    };

    // Update cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: bestseller,
      timestamp: Date.now()
    }));

    return bestseller;
  } catch (error) {
    console.error('Error fetching bestseller:', error);
    return null;
  }
}
