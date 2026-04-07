import React, { useState, useEffect } from 'react';
import { Book, BookStatus } from '../types';
import { X, Star, Image as ImageIcon, Search, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../lib/utils';
import { searchBooks, SearchResult } from '../lib/api';

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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
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
        const results = await searchBooks(title);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [title, isOpen, showDropdown]);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialBookData?.title || '');
      setAuthor(initialBookData?.author || '');
      setCoverImage(initialBookData?.coverImage || '');
      setStatus('want-to-read');
      setRating(0);
      setReview('');
      setStartDate('');
      setEndDate('');
      setShowDropdown(false);
      setSearchResults([]);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
      <div 
        className="bg-[#FEFEFA] rounded-[2rem] shadow-float border border-border/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/30 blur-3xl rounded-full mix-blend-multiply -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="sticky top-0 bg-[#FEFEFA]/80 backdrop-blur-md border-b border-border/50 px-8 py-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-foreground">새로운 책 기록하기</h2>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 relative z-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div ref={searchContainerRef} className="relative z-20">
                <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" /> 제목 검색 및 입력 *
                </label>
                <div className="relative">
                  <input 
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
                    className="w-full px-5 py-3.5 bg-white/50 rounded-full border border-border focus:outline-none focus-visible:ring-2 ring-primary/30 ring-offset-2 transition-all font-medium pr-10"
                    placeholder="등록할 책 제목을 검색하세요"
                    autoComplete="off"
                  />
                  {isSearching && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <Loader2 className="h-5 w-5 text-primary/70 animate-spin" />
                    </div>
                  )}
                </div>

                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-30 w-full mt-2 bg-white rounded-2xl shadow-float border border-border/50 overflow-hidden max-h-64 overflow-y-auto hide-scrollbar">
                    <div className="px-4 py-2 bg-muted/40 border-b border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      알라딘 검색 결과
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
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">저자 *</label>
                <input 
                  type="text" 
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white/50 rounded-full border border-border focus:outline-none focus-visible:ring-2 ring-primary/30 ring-offset-2 transition-all font-medium"
                  placeholder="저자를 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">상태</label>
                <div className="flex flex-col gap-2">
                  {(['want-to-read', 'reading', 'completed'] as BookStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={cn(
                        "px-5 py-3 text-sm font-bold rounded-full border transition-all duration-300",
                        status === s 
                          ? "bg-primary text-primary-foreground border-primary shadow-soft" 
                          : "bg-white/50 text-muted-foreground border-border hover:bg-white hover:text-foreground"
                      )}
                    >
                      {s === 'want-to-read' ? '읽고 싶은 책' : s === 'reading' ? '읽는 중' : '완독'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">별점</label>
                <div className="flex items-center gap-1 bg-white/50 border border-border rounded-full px-4 py-2 w-fit">
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
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">표지 이미지 URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input 
                      type="url" 
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="w-full pl-12 pr-5 py-3.5 bg-white/50 rounded-full border border-border focus:outline-none focus-visible:ring-2 ring-primary/30 ring-offset-2 transition-all font-medium"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                {coverImage && (
                  <div className="mt-4 aspect-[2/3] w-32 rounded-[1.5rem] overflow-hidden border border-border/50 bg-muted/30 shadow-soft">
                    <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">시작일</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white/50 rounded-full border border-border focus:outline-none focus-visible:ring-2 ring-primary/30 ring-offset-2 transition-all text-foreground font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">종료일</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white/50 rounded-full border border-border focus:outline-none focus-visible:ring-2 ring-primary/30 ring-offset-2 transition-all text-foreground font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">리뷰 및 메모</label>
            <textarea 
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
              className="w-full px-6 py-4 bg-white/50 rounded-[2rem] border border-border focus:outline-none focus-visible:ring-2 ring-primary/30 ring-offset-2 transition-all resize-none font-medium"
              placeholder="책에 대한 감상이나 기억하고 싶은 문장을 남겨보세요."
            />
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3.5 rounded-full text-secondary font-bold border-2 border-secondary hover:bg-secondary/5 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-soft hover:shadow-[0_6px_24px_-4px_rgba(93,112,82,0.25)]"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
