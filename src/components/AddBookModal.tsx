import React, { useState } from 'react';
import { Book, BookStatus } from '../types';
import { X, Star, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../lib/utils';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (book: Book) => void;
}

export function AddBookModal({ isOpen, onClose, onAdd }: AddBookModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<BookStatus>('want-to-read');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-serif font-semibold text-stone-900">새로운 책 기록하기</h2>
          <button 
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">제목 *</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  placeholder="책 제목을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">저자 *</label>
                <input 
                  type="text" 
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  placeholder="저자를 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">상태</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['want-to-read', 'reading', 'completed'] as BookStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={cn(
                        "px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
                        status === s 
                          ? "bg-stone-900 text-white border-stone-900" 
                          : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                      )}
                    >
                      {s === 'want-to-read' ? '읽고 싶은 책' : s === 'reading' ? '읽는 중' : '완독'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">별점</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star 
                        className={cn(
                          "w-8 h-8 transition-colors", 
                          star <= rating ? "fill-amber-400 text-amber-400" : "fill-stone-100 text-stone-200 hover:fill-amber-200 hover:text-amber-200"
                        )} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">표지 이미지 URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon className="h-4 w-4 text-stone-400" />
                    </div>
                    <input 
                      type="url" 
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                {coverImage && (
                  <div className="mt-3 aspect-[2/3] w-32 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                    <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">시작일</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">종료일</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-stone-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">리뷰 및 메모</label>
            <textarea 
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none"
              placeholder="책에 대한 감상이나 기억하고 싶은 문장을 남겨보세요."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-stone-600 font-medium hover:bg-stone-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors shadow-md shadow-stone-900/10"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
