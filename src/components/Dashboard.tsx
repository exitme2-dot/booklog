import React from 'react';
import { Book } from '../types';
import { BookOpen, CheckCircle, Clock, Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface DashboardProps {
  books: Book[];
}

export function Dashboard({ books }: DashboardProps) {
  const completedCount = books.filter(b => b.status === 'completed').length;
  const readingCount = books.filter(b => b.status === 'reading').length;
  const wantToReadCount = books.filter(b => b.status === 'want-to-read').length;
  
  const ratedBooks = books.filter(b => b.rating > 0);
  const averageRating = ratedBooks.length > 0 
    ? (ratedBooks.reduce((acc, b) => acc + b.rating, 0) / ratedBooks.length).toFixed(1)
    : '0.0';

  const stats = [
    { label: '완독한 책', value: completedCount, icon: CheckCircle, radius: 'rounded-[2rem] rounded-tr-[4rem]' },
    { label: '읽는 중', value: readingCount, icon: BookOpen, radius: 'rounded-[2rem] rounded-bl-[4rem]' },
    { label: '읽고 싶은 책', value: wantToReadCount, icon: Clock, radius: 'rounded-[2rem] rounded-tl-[4rem]' },
    { label: '평균 별점', value: averageRating, icon: Star, radius: 'rounded-[2rem] rounded-br-[4rem]' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div 
            key={i} 
            className={cn(
              "group bg-[#FEFEFA] p-6 border border-border/50 shadow-soft flex flex-col gap-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-float relative overflow-hidden",
              stat.radius
            )}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-2xl rounded-full mix-blend-multiply -translate-y-1/2 translate-x-1/2" />
            
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              <Icon className="w-7 h-7" />
            </div>
            <div className="mt-2">
              <p className="text-sm font-bold text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-4xl font-serif font-bold text-foreground group-hover:scale-110 origin-left transition-transform duration-300">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
