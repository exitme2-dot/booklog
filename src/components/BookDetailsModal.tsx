import React from 'react';
import { Book } from '../types';
import { X, Star, Calendar, Edit3, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface BookDetailsModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function BookDetailsModal({ book, isOpen, onClose, onDelete }: BookDetailsModalProps) {
  if (!isOpen || !book) return null;

  const statusLabels = {
    'reading': '읽는 중',
    'completed': '완독',
    'want-to-read': '읽고 싶은 책',
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'yyyy년 M월 d일', { locale: ko });
    } catch {
      return dateString;
    }
  };

  const handleDelete = () => {
    if (window.confirm('정말 이 기록을 삭제하시겠습니까?')) {
      onDelete(book.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#FEFEFA] rounded-[2rem] shadow-float border border-border/50 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full mix-blend-multiply translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        {/* Left column: Cover */}
        <div className="w-full md:w-2/5 bg-muted/30 relative flex items-center justify-center p-8 border-r border-border/50">
          {book.coverImage ? (
            <div className="relative w-full aspect-[2/3] max-w-[240px] mx-auto">
              <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full -z-10 translate-y-4" />
              <img 
                src={book.coverImage} 
                alt={book.title} 
                className="w-full h-full object-cover rounded-xl shadow-float -rotate-2 border-4 border-white"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-full aspect-[2/3] max-w-[240px] mx-auto flex items-center justify-center text-muted-foreground p-8 text-center bg-accent/30 organic-shape-2 shadow-soft">
              <span className="font-serif text-2xl font-bold">{book.title}</span>
            </div>
          )}
          <button 
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-muted-foreground shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Right column: Details */}
        <div className="w-full md:w-3/5 flex flex-col max-h-[90vh] overflow-y-auto hide-scrollbar relative z-10">
          <div className="sticky top-0 bg-[#FEFEFA]/90 backdrop-blur-md px-8 py-6 flex items-start justify-between border-b border-border/50 z-10">
            <div>
              <div className="inline-block px-3 py-1.5 rounded-full bg-white border border-border shadow-sm text-foreground text-xs font-bold mb-3">
                {statusLabels[book.status]}
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground leading-tight">{book.title}</h2>
              <p className="text-muted-foreground mt-2 font-medium text-lg">{book.author}</p>
            </div>
            <button 
              onClick={onClose}
              className="hidden md:block p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 space-y-8 flex-grow">
            <div className="flex items-center">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-7 h-7", 
                      i < book.rating ? "fill-secondary text-secondary" : "fill-muted text-border"
                    )} 
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-6 border-y border-border/50">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>시작일</span>
                </div>
                <p className="font-medium text-foreground text-lg">{formatDate(book.startDate)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>종료일</span>
                </div>
                <p className="font-medium text-foreground text-lg">{formatDate(book.endDate)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                리뷰 및 메모
              </h3>
              {book.review ? (
                <div className="bg-white/50 p-6 rounded-[2rem] border border-border/50 shadow-sm">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap font-medium">{book.review}</p>
                </div>
              ) : (
                <div className="bg-white/30 p-6 rounded-[2rem] border border-border/30 border-dashed text-center">
                  <p className="text-muted-foreground italic text-sm">작성된 리뷰가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-[#FEFEFA]/90 backdrop-blur-md px-8 py-6 border-t border-border/50 flex justify-end gap-4 z-10 w-full mt-auto">
            <button
              onClick={handleDelete}
              className="px-6 py-3 rounded-full text-destructive font-bold border-2 border-destructive/20 hover:border-destructive hover:bg-destructive/5 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              기록 삭제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
