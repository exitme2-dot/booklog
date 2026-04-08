import React, { memo, useState, useEffect } from 'react';
import { Book } from '../types';
import { BookOpen, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { getBestseller, SearchResult } from '../lib/api';

interface DashboardProps {
  books: Book[];
}

export const Dashboard = memo(function Dashboard({ books }: DashboardProps) {
  const [recommendedBook, setRecommendedBook] = useState<SearchResult | null>(null);

  useEffect(() => {
    getBestseller().then(setRecommendedBook);
  }, []);

  const completedCount = books.filter(b => b.status === 'completed').length;
  const readingCount = books.filter(b => b.status === 'reading').length;
  const wantToReadCount = books.filter(b => b.status === 'want-to-read').length;
  
  const stats = [
    { label: '읽는 중', value: readingCount, icon: BookOpen, radius: 'rounded-[2rem] rounded-tr-[4rem]' },
    { label: '읽고 싶은 책', value: wantToReadCount, icon: Clock, radius: 'rounded-[2rem] rounded-bl-[4rem]' },
    { label: '완독한 책', value: completedCount, icon: CheckCircle, radius: 'rounded-[2rem] rounded-tl-[4rem]' },
    { 
      label: '이주의 추천 도서', 
      value: recommendedBook ? recommendedBook.title : '불러오는 중...', 
      icon: Sparkles, 
      radius: 'rounded-[2rem] rounded-br-[4rem]',
      isBook: true,
      coverImage: recommendedBook?.coverImage
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.label} 
            className={cn(
              "group bg-[#FEFEFA] px-6 py-4 border border-border/50 shadow-soft flex flex-col gap-3 transition-all duration-500 hover:-translate-y-1 hover:shadow-float relative overflow-hidden will-change-transform",
              stat.radius
            )}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/20 transition-colors duration-500" />
            
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              <Icon className="w-7 h-7" />
            </div>
            {stat.isBook && stat.coverImage && (
              <div className="absolute top-4 right-12 w-16 h-24 rounded-xl overflow-hidden shadow-md rotate-6 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500 z-10">
                <img src={stat.coverImage} alt={stat.value} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <div className="mt-1 h-16 flex flex-col justify-end">
              <p className="text-sm font-bold text-muted-foreground mb-1">{stat.label}</p>
              <p className={cn(
                "font-serif font-bold text-foreground group-hover:scale-105 origin-left transition-transform duration-300",
                stat.isBook ? "text-2xl line-clamp-2 leading-tight" : "text-4xl"
              )}>{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
});
