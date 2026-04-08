import React from 'react';
import { SearchResult } from '../lib/api';
import { X, Search, Loader2, Image as ImageIcon, Plus } from 'lucide-react';

interface SearchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: SearchResult[];
  isSearching: boolean;
  onSelectBook: (book: SearchResult) => void;
  searchQuery: string;
  totalResults: number;
  onLoadMore: () => void;
}

export function SearchResultModal({ isOpen, onClose, results, isSearching, onSelectBook, searchQuery, totalResults, onLoadMore }: SearchResultModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#FEFEFA] rounded-[2rem] shadow-float border border-border/50 w-full max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden hide-scrollbar relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full mix-blend-multiply -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="sticky top-0 bg-[#FEFEFA]/90 backdrop-blur-md border-b border-border/50 px-8 py-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              알라딘 도서 검색 결과 
              <span className="text-muted-foreground font-medium text-base ml-2">"{searchQuery}"</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 relative z-0">
          {results.length === 0 && isSearching ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
              {results.map((book) => (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className="group cursor-pointer bg-white/50 backdrop-blur-sm border border-border shadow-soft rounded-[2rem] p-4 hover:shadow-float hover:-translate-y-1 transition-all duration-300 flex flex-col"
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
                  <h3 className="font-bold text-foreground text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors flex-grow">
                    {book.title}
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground line-clamp-1">
                    {book.author}
                  </p>
                </div>
              ))}
              </div>
              {results.length < totalResults && (
                <div className="mt-10 flex justify-center pb-4">
                  <button 
                    onClick={onLoadMore}
                    disabled={isSearching}
                    className="px-8 py-3 rounded-full bg-white border border-border shadow-soft font-bold text-foreground hover:border-primary/50 hover:text-primary transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-float active:scale-95"
                  >
                    {isSearching ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> 불러오는 중...</>
                    ) : (
                      `더 보기 (+${Math.min(5, totalResults - results.length)}권)`
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-border/50">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground font-medium">다른 검색어로 다시 시도해보세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
