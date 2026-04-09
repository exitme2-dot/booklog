import React, { useState, useEffect } from 'react';
import { Book, BookStatus } from '../types';
import { X, Star, Image as ImageIcon, Search, Loader2, Calendar } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../lib/utils';
import { searchBooks, SearchResult } from '../lib/api';
import { CustomDatePicker } from './CustomDatePicker';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (book: Book) => void;
  initialBookData?: SearchResult | null;
}

export function AddBookModal({ isOpen, onClose, onAdd, initialBookData }: AddBookModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<BookStatus>('want-to-read');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(async () => {
      // Only search if user typed something and it's not exactly what was just filled from a click
      if (title.trim().length > 1 && showDropdown) {
        setIsSearching(true);
        setSearchPage(1);
        const { books, totalResults: total } = await searchBooks(title, 1, 10);
        setSearchResults(books);
        setTotalResults(total || 0);
        setIsSearching(false);
      } else {
        setSearchResults([]);
        setTotalResults(0);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [title, isOpen, showDropdown]);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && !isLoadingMore && searchResults.length < totalResults) {
      setIsLoadingMore(true);
      const nextPage = searchPage + 1;
      const { books } = await searchBooks(title, nextPage, 10);
      setSearchResults(prev => [...prev, ...books]);
      setSearchPage(nextPage);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const today = new Date();
      const offset = today.getTimezoneOffset() * 60000;
      const formattedToday = new Date(today.getTime() - offset).toISOString().split('T')[0];
      const formattedTwoWeeksLater = new Date(today.getTime() - offset + (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

      setTitle(initialBookData?.title || '');
      setAuthor(initialBookData?.author || '');
      setCoverImage(initialBookData?.coverImage || '');
      setStatus('want-to-read');
      setRating(0);
      setReview('');
      setStartDate(formattedToday);
      setEndDate(formattedTwoWeeksLater);
      setShowDropdown(false);
      setSearchResults([]);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialBookData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const newBook: Book = {
      id: uuidv4(),
      title: title.trim(),
      author: author.trim(),
      coverImage: coverImage.trim() || undefined,
      status,
      rating,
      review: review.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      createdAt: new Date().toISOString(),
    };

    onAdd(newBook);
    
    // Reset form
    setTitle('');
    setAuthor('');
    setCoverImage('');
    setStatus('want-to-read');
    setRating(0);
    setReview('');
    setStartDate('');
    setEndDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#FEFEFA] rounded-[2rem] shadow-float border border-border/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden hide-scrollbar relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 blur-xl rounded-full mix-blend-multiply -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="sticky top-0 bg-[#FEFEFA]/80 backdrop-blur-md border-b border-border/50 px-8 py-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-foreground">새로운 책 기록하기</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-sm text-secondary font-bold border border-secondary hover:bg-secondary/5 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              form="add-book-form"
              className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-full hover:bg-primary/90 shadow-soft transition-all active:scale-95"
            >
              저장하기
            </button>
          </div>
        </div>

        <form id="add-book-form" onSubmit={handleSubmit} className="p-8 space-y-8 relative z-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div ref={searchContainerRef} className="relative z-20">
                <label htmlFor="title-input" className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" /> 제목 검색 및 입력 *
                </label>
                <div className="relative">
                  <input 
                    id="title-input"
                    name="title"
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => {
                      if (title.trim().length > 1) setShowDropdown(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.preventDefault();
                    }}
                    className="w-full px-5 py-3.5 bg-white/50 rounded-full border border-border focus:outline-none focus-visible:ring-2 ring-primary/30 ring-offset-2 transition-all font-medium pr-10"
                    placeholder="등록할 책 제목을 검색하세요"
                    autoComplete="off"
                  />
                  {!isSearching && title.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTitle('');
                        setShowDropdown(false);
                      }}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  {isSearching && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <Loader2 className="h-5 w-5 text-primary/70 animate-spin" />
                    </div>
                  )}
                </div>

                {showDropdown && searchResults.length > 0 && (
                  <div 
                    onScroll={handleScroll}
                    className="absolute z-30 w-full mt-2 bg-white rounded-2xl shadow-float border border-border/50 overflow-hidden max-h-64 overflow-y-auto hide-scrollbar"
                  >
                    <div className="px-4 py-2 bg-muted/40 border-b border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0 bg-white z-10">
                      알라딘 검색 결과 ({searchResults.length}/{totalResults})
                    </div>
                    {searchResults.map((book) => (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => {
                          setTitle(book.title);
                          setAuthor(book.author);
                          setCoverImage(book.coverImage || '');
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-muted/50 flex items-start gap-4 border-b border-border/50 last:border-0 transition-colors"
                      >
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} className="w-10 h-14 object-cover rounded-lg bg-muted flex-shrink-0 shadow-sm" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-10 h-14 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 border border-border/50">
                            <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground truncate text-sm">{book.title}</p>
                          <p className="text-xs font-medium text-muted-foreground truncate leading-relaxed">{book.author}</p>
                        </div>
                      </button>
                    ))}
                    {isLoadingMore && (
                      <div className="py-4 flex justify-center items-center">
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="author-input" className="block text-sm font-bold text-foreground mb-2">저자 *</label>
                <input 
                  id="author-input"
                  name="author"
                  type="text" 
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white/50 rounded-full border border-border focus:outline-none focus-visible:ring-2 ring-primary/30 ring-offset-2 transition-all font-medium"
                  placeholder="저자를 입력하세요"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <CustomDatePicker 
                  label="시작일"
                  value={startDate}
                  onChange={setStartDate}
                />
                <CustomDatePicker 
                  label="종료일"
                  value={endDate}
                  onChange={setEndDate}
                />
              </div>
              
              {coverImage && (
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">표지 미리보기</label>
                  <div className="aspect-[2/3] w-24 rounded-2xl overflow-hidden border border-border/50 bg-muted/30 shadow-soft">
                    <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">별점</label>
              <div className="flex items-center gap-1 bg-white/50 border border-border rounded-full px-5 py-2.5 w-full h-[54px] justify-center md:justify-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1.5 focus:outline-none hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={cn(
                        "w-7 h-7 transition-colors", 
                        star <= rating ? "fill-secondary text-secondary" : "fill-muted text-border hover:fill-secondary/50 hover:text-secondary/50"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">상태 *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['want-to-read', 'reading', 'completed'] as BookStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      "px-2 py-3 text-sm font-bold rounded-full border transition-all duration-300 w-full h-[54px] flex items-center justify-center",
                      status === s 
                        ? "bg-primary/10 text-primary border-primary shadow-soft" 
                        : "bg-white/50 text-muted-foreground border-border hover:bg-white hover:text-foreground"
                    )}
                  >
                    {s === 'want-to-read' ? '읽고 싶은' : s === 'reading' ? '읽는 중' : '완독'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="review-input" className="block text-sm font-bold text-foreground mb-2">리뷰 및 메모</label>
            <textarea 
              id="review-input"
              name="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
              className="w-full px-6 py-4 bg-white/50 rounded-[2rem] border border-border focus:outline-none focus-visible:ring-2 ring-primary/30 ring-offset-2 transition-all resize-none font-medium"
              placeholder="책에 대한 감상이나 기억하고 싶은 문장을 남겨보세요."
            />
          </div>

          {/* Footer buttons moved to header */}
        </form>
      </div>
    </div>
  );
}
