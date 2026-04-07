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
  const [hasSearchedOl, setHasSearchedOl] = useState(false);
  const [initialBookData, setInitialBookData] = useState<SearchResult | null>(null);

  const handleOnlineSearch = async () => {
    if (searchQuery.trim().length > 0) {
      setIsSearchingOl(true);
      const results = await searchBooks(searchQuery);
      setOlSearchResults(results);
      setIsSearchingOl(false);
      setHasSearchedOl(true);
    }
  };

  const clearOnlineSearch = () => {
    setOlSearchResults([]);
    setHasSearchedOl(false);
  };

  const handleSelectOlBook = (book: SearchResult) => {
    setInitialBookData(book);
    setIsAddModalOpen(true);
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

          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="내 책장 검색 (엔터 시 온라인 검색)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() === '') {
                  clearOnlineSearch();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleOnlineSearch();
              }}
              className="w-full pl-12 pr-6 py-3.5 bg-white/50 border border-border rounded-full text-sm focus:outline-none focus-visible:ring-2 ring-primary/30 ring-offset-2 transition-all shadow-sm font-medium"
            />
            {isSearchingOl && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Loader2 className="h-5 w-5 text-primary/70 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Online Search Results */}
        {hasSearchedOl && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              알라딘 도서 검색 결과
            </h2>
            {isSearchingOl ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : olSearchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 border-b border-border/50 pb-12">
                {olSearchResults.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => handleSelectOlBook(book)}
                    className="group cursor-pointer bg-white/50 backdrop-blur-sm border border-border shadow-soft rounded-2xl p-4 hover:shadow-float hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="aspect-[2/3] overflow-hidden rounded-xl bg-muted/30 mb-4 shadow-inner relative w-full">
                      {book.coverImage ? (
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                          <Plus className="w-3 h-3" />
                          기록하기
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-foreground text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground line-clamp-1">
                      {book.author}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/30 backdrop-blur-sm rounded-2xl border border-border/50 mb-12">
                <p className="text-muted-foreground font-medium flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  온라인 검색 결과가 없습니다.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Local Library Title Separator */}
        {(hasSearchedOl || searchQuery) && (
          <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
            <Library className="w-5 h-5 text-primary" />
            내 책장 필터 결과
          </h2>
        )}

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
