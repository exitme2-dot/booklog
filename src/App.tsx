import React, { useState, useEffect } from 'react';
import { Book, BookStatus } from './types';
import { getBooks, saveBooks } from './lib/storage';
import { Dashboard } from './components/Dashboard';
import { BookCard } from './components/BookCard';
import { AddBookModal } from './components/AddBookModal';
import { BookDetailsModal } from './components/BookDetailsModal';
import { Plus, Library, Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from './lib/utils';
import { searchBooks, SearchResult } from './lib/api';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [filter, setFilter] = useState<BookStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [olSearchResults, setOlSearchResults] = useState<SearchResult[]>([]);
  const [isSearchingOl, setIsSearchingOl] = useState(false);
  const [showOlDropdown, setShowOlDropdown] = useState(false);
  const [initialBookData, setInitialBookData] = useState<SearchResult | null>(null);

  const searchRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowOlDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearchingOl(true);
        const results = await searchBooks(searchQuery);
        setOlSearchResults(results);
        setIsSearchingOl(false);
        setShowOlDropdown(true);
      } else {
        setOlSearchResults([]);
        setShowOlDropdown(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectOlBook = (book: SearchResult) => {
    setInitialBookData(book);
    setIsAddModalOpen(true);
    setShowOlDropdown(false);
    setSearchQuery('');
  };

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
    <div className="min-h-screen pb-32 relative overflow-hidden">
      {/* Ambient Blobs */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-accent/40 blur-3xl rounded-full mix-blend-multiply -translate-x-1/2 -translate-y-1/2 -z-10" />
      <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-muted/60 blur-3xl rounded-full mix-blend-multiply translate-x-1/3 -z-10" />

      {/* Header */}
      <header className="sticky top-4 z-30 mx-4 sm:mx-6 lg:mx-8 max-w-7xl xl:mx-auto">
        <div className="bg-white/70 backdrop-blur-md border border-border/50 shadow-soft rounded-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <Library className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">BookLog</h1>
          </div>
          <button
            onClick={() => {
              setInitialBookData(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-soft hover:shadow-[0_6px_24px_-4px_rgba(93,112,82,0.25)]"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">기록하기</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Dashboard books={books} />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 mt-16">
          <div className="flex bg-white/50 backdrop-blur-sm rounded-full p-1.5 border border-border/50 shadow-soft w-full sm:w-auto overflow-x-auto hide-scrollbar">
            {(['all', 'reading', 'completed', 'want-to-read'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300",
                  filter === f 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/60"
                )}
              >
                {f === 'all' ? '전체' : f === 'reading' ? '읽는 중' : f === 'completed' ? '완독' : '읽고 싶은 책'}
              </button>
            ))}
          </div>

          <div ref={searchRef} className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="내 책장 및 온라인 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (olSearchResults.length > 0) setShowOlDropdown(true);
              }}
              className="w-full pl-12 pr-6 py-3.5 bg-white/50 border border-border rounded-full text-sm focus:outline-none focus-visible:ring-2 ring-primary/30 ring-offset-2 transition-all shadow-sm font-medium"
            />
            {isSearchingOl && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Loader2 className="h-5 w-5 text-primary/70 animate-spin" />
              </div>
            )}
            
            {showOlDropdown && olSearchResults.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-float border border-border/50 overflow-hidden max-h-80 overflow-y-auto">
                <div className="px-4 py-2 bg-muted/40 border-b border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  알라딘 도서 검색 결과
                </div>
                {olSearchResults.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleSelectOlBook(book)}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 flex items-start gap-4 border-b border-border/50 last:border-0 transition-colors"
                  >
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded-lg bg-muted flex-shrink-0 shadow-sm" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 border border-border/50">
                        <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground truncate">{book.title}</p>
                      <p className="text-sm font-medium text-muted-foreground truncate leading-relaxed">{book.author}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        새로 기록하기
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Book Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
            {filteredBooks.map((book, index) => (
              <BookCard 
                key={book.id} 
                book={book} 
                onClick={setSelectedBook}
                index={index}
              />
            ))}
            
            <button
              onClick={() => {
                setInitialBookData(null);
                setIsAddModalOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-4 bg-[#FEFEFA] border-2 border-dashed border-border/80 rounded-2xl hover:border-primary/50 hover:bg-white/50 transition-all duration-300 group min-h-[220px]"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <Plus className="w-7 h-7 text-primary" />
              </div>
              <span className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">도서 추가</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-32 bg-[#FEFEFA] rounded-[3rem] border border-border/50 shadow-soft relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-accent/20 blur-3xl rounded-full mix-blend-multiply -z-10" />
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-[2rem] organic-shape-1 flex items-center justify-center mb-6">
              <Library className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {searchQuery ? '검색 결과가 없습니다' : '아직 기록된 책이 없습니다'}
            </h3>
            <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
              {searchQuery ? '다른 검색어로 시도해보세요.' : '당신의 첫 번째 독서 기록을 남겨보세요. 작은 기록이 모여 나만의 도서관이 됩니다.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-soft"
              >
                <Plus className="w-5 h-5" />
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
        initialBookData={initialBookData}
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
