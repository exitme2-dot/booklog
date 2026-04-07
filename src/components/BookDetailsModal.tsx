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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left column: Cover */}
        <div className="w-full md:w-2/5 bg-stone-100 relative">
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt={book.title} 
              className="w-full h-full object-cover absolute inset-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full min-h-[300px] flex items-center justify-center text-stone-400 p-8 text-center bg-stone-100">
              <span className="font-serif text-xl">{book.title}</span>
            </div>
          )}
          <button 
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-stone-600 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Right column: Details */}
        <div className="w-full md:w-3/5 flex flex-col max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 flex items-start justify-between border-b border-stone-100 z-10">
            <div>
              <div className="inline-block px-2.5 py-1 rounded-md bg-stone-100 text-stone-600 text-xs font-medium mb-2">
                {statusLabels[book.status]}
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 leading-tight">{book.title}</h2>
              <p className="text-stone-500 mt-1">{book.author}</p>
            </div>
            <button 
              onClick={onClose}
              className="hidden md:block p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8 flex-grow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-6 h-6", 
                      i < book.rating ? "fill-amber-400 text-amber-400" : "fill-stone-100 text-stone-200"
                    )} 
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleDelete}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-stone-100">
              <div>
                <div className="flex items-center gap-1.5 text-stone-400 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>시작일</span>
                </div>
                <p className="font-medium text-stone-800">{formatDate(book.startDate)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-stone-400 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>종료일</span>
                </div>
                <p className="font-medium text-stone-800">{formatDate(book.endDate)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-stone-400 mb-3 flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                리뷰 및 메모
              </h3>
              {book.review ? (
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{book.review}</p>
                </div>
              ) : (
                <p className="text-stone-400 italic text-sm">작성된 리뷰가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
