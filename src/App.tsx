import React, { useState, useEffect } from 'react';
import { Book, BookStatus } from './types';
import { getBooks, saveBooks } from './lib/storage';
import { Dashboard } from './components/Dashboard';
import { BookCard } from './components/BookCard';
import { AddBookModal } from './components/AddBookModal';
import { BookDetailsModal } from './components/BookDetailsModal';
import { Plus, Library, Search } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [filter, setFilter] = useState<BookStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setBooks(getBooks());
  }, []);

  const handleAddBook = (newBook: Book) => {
    const updatedBooks = [newBook, ...books];
    setBooks(updatedBooks);
    saveBooks(updatedBooks);
  };

  const handleDeleteBook = (id: string) => {
    const updatedBooks = books.filter(b => b.id !== id);
    setBooks(updatedBooks);
    saveBooks(updatedBooks);
  };

  const filteredBooks = books.filter(book => {
    const matchesFilter = filter === 'all' || book.status === filter;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-stone-900 text-white p-1.5 rounded-lg">
              <Library className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">BookLog</h1>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">기록하기</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard books={books} />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex bg-white rounded-xl p-1 border border-stone-200 shadow-sm w-full sm:w-auto overflow-x-auto hide-scrollbar">
            {(['all', 'reading', 'completed', 'want-to-read'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  filter === f 
                    ? "bg-stone-100 text-stone-900" 
                    : "text-stone-500 hover:text-stone-700 hover:bg-stone-50"
                )}
              >
                {f === 'all' ? '전체' : f === 'reading' ? '읽는 중' : f === 'completed' ? '완독' : '읽고 싶은 책'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-stone-400" />
            </div>
            <input
              type="text"
              placeholder="제목이나 저자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Book Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredBooks.map(book => (
              <BookCard 
                key={book.id} 
                book={book} 
                onClick={setSelectedBook} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 border-dashed">
            <div className="mx-auto w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
              <Library className="w-8 h-8 text-stone-300" />
            </div>
            <h3 className="text-lg font-serif font-medium text-stone-900 mb-1">
              {searchQuery ? '검색 결과가 없습니다' : '아직 기록된 책이 없습니다'}
            </h3>
            <p className="text-stone-500 mb-6">
              {searchQuery ? '다른 검색어로 시도해보세요.' : '새로운 책을 읽고 기록을 남겨보세요.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                첫 번째 책 기록하기
              </button>
            )}
          </div>
        )}
      </main>

      <AddBookModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddBook} 
      />

      <BookDetailsModal 
        book={selectedBook} 
        isOpen={!!selectedBook} 
        onClose={() => setSelectedBook(null)} 
        onDelete={handleDeleteBook}
      />
    </div>
  );
}
