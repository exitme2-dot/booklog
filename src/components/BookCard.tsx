import React from 'react';
import { Book } from '../types';
import { Star, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface BookCardProps {
  key?: React.Key;
  book: Book;
  onClick: (book: Book) => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  const statusConfig = {
    'reading': { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', label: '읽는 중' },
    'completed': { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: '완독' },
    'want-to-read': { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: '읽고 싶은 책' },
  };

  const StatusIcon = statusConfig[book.status].icon;

  return (
    <div 
      onClick={() => onClick(book)}
      className="group flex flex-col bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="relative aspect-[2/3] w-full bg-stone-100 overflow-hidden">
        {book.coverImage ? (
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-4 text-center">
            <BookOpen className="w-12 h-12 mb-2 opacity-20" />
            <span className="text-sm font-medium font-serif line-clamp-3">{book.title}</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm backdrop-blur-md bg-white/90", statusConfig[book.status].color)}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusConfig[book.status].label}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-serif font-semibold text-lg text-stone-900 line-clamp-1 mb-1 group-hover:text-amber-700 transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-stone-500 mb-3 line-clamp-1">{book.author}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "w-4 h-4", 
                  i < book.rating ? "fill-amber-400 text-amber-400" : "fill-stone-100 text-stone-200"
                )} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
