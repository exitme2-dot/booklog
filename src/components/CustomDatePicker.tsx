import React, { useState, useRef, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  parseISO
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function CustomDatePicker({ value, onChange, label }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? parseISO(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const days = ['일', '월', '화', '수', '목', '금', '토'];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const handleDateClick = (day: Date) => {
    // Correctly handle timezone offset for YYYY-MM-DD
    const offset = day.getTimezoneOffset() * 60000;
    const localDate = new Date(day.getTime() - offset);
    onChange(localDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const selectedDate = value ? parseISO(value) : null;

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-primary" /> {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 bg-white/50 rounded-[1.5rem] border border-border focus:outline-none focus:ring-2 ring-primary/30 ring-offset-2 transition-all text-foreground font-medium text-left flex items-center justify-between hover:bg-white"
      >
        <span>{value ? format(parseISO(value), 'yyyy년 MM월 dd일', { locale: ko }) : '날짜 선택'}</span>
        <CalendarIcon className="w-4 h-4 text-primary/50" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 p-3 bg-white rounded-[1.5rem] shadow-float border border-border/50 w-full left-0 origin-top"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-bold text-foreground">
                {format(currentMonth, 'yyyy년 MM월', { locale: ko })}
              </h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 hover:bg-muted rounded-full transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 hover:bg-muted rounded-full transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {days.map((day) => (
                <div key={day} className="text-center text-[9px] font-bold text-muted-foreground uppercase py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, idx) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "aspect-square flex items-center justify-center text-xs rounded-lg transition-all relative",
                      !isCurrentMonth && "text-muted-foreground/30",
                      isCurrentMonth && !isSelected && "hover:bg-primary/10 text-foreground",
                      isSelected && "bg-primary text-primary-foreground font-bold shadow-soft",
                      isToday(day) && !isSelected && "text-primary border border-primary/20 bg-primary/5"
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
