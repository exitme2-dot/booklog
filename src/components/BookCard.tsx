import React from 'react';
import { Book } from '../types';
import { Star, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface BookCardProps {
  key?: React.Key;
  book: Book;
  onClick: (book: Book) => void;
  index?: number;
}

export function BookCard({ book, onClick, index = 0 }: BookCardProps) {
  const statusConfig = {
    'reading': { icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10', label: '읽는 중' },
    'completed': { icon: CheckCircle, color: 'text-secondary', bg: 'bg-secondary/10', label: '완독' },
    'want-to-read': { icon: Clock, color: 'text-destructive', bg: 'bg-destructive/10', label: '읽고 싶은 책' },
  };

  const StatusIcon = statusConfig[book.status].icon;
  
  // Cycle through different asymmetric radii for organic feel
  const radiiPatterns = [
    'rounded-[2rem] rounded-tl-[4rem]',
    'rounded-[2rem] rounded-tr-[4rem]',
    'rounded-[2rem] rounded-bl-[4rem]',
    'rounded-[2rem] rounded-br-[4rem]',
    'rounded-[2rem]',
  ];
  const cardRadius = radiiPatterns[index % radiiPatterns.length];

  return (
    <div 
      onClick={() => onClick(book)}
      className={cn(
        "group flex flex-col bg-[#FEFEFA] border border-border/50 overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-float shadow-soft",
        cardRadius
      )}
    >
      <div className="relative aspect-[2/3] w-full bg-muted/30 overflow-hidden p-2">
        <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt={book.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center bg-accent/20">
              <BookOpen className="w-12 h-12 mb-3 opacity-30" />
              <span className="text-sm font-bold font-serif line-clamp-3 px-2">{book.title}</span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-white/90", statusConfig[book.status].color)}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusConfig[book.status].label}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-serif font-bold text-lg text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-1 font-medium">{book.author}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "w-4 h-4", 
                  i < book.rating ? "fill-secondary text-secondary" : "fill-muted text-border"
                )} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
