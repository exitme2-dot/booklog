export type BookStatus = 'reading' | 'completed' | 'want-to-read';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  rating: number; // 0 to 5
  status: BookStatus;
  review?: string;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  createdAt: string; // ISO string
}
