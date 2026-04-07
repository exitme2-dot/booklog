import React from 'react';
import { Book } from '../types';
import { BookOpen, CheckCircle, Clock, Star } from 'lucide-react';

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
    { label: '완독한 책', value: completedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '읽는 중', value: readingCount, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '읽고 싶은 책', value: wantToReadCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '평균 별점', value: averageRating, icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">{stat.label}</p>
              <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
