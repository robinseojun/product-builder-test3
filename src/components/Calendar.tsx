import React from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays 
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  taskDates: string[]; // Dates with tasks to show indicators
}

export function Calendar({ selectedDate, onSelectDate, taskDates }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(selectedDate));

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm text-slate-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="w-6 h-6 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <button 
            onClick={nextMonth}
            className="w-6 h-6 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEE';
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-[10px] font-semibold text-slate-400 py-2">
          {format(addDays(startDate, i), dateFormat).charAt(0)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-y-3 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const dateString = format(day, 'yyyy-MM-dd');
        const hasTask = taskDates.includes(dateString);

        days.push(
          <div
            key={day.toString()}
            onClick={() => onSelectDate(cloneDay)}
            className={`relative flex justify-center items-center cursor-pointer transition-all ${
              !isCurrentMonth ? 'text-slate-300' : 'text-slate-700 hover:text-indigo-600'
            }`}
          >
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isToday
                  ? 'bg-indigo-50 text-indigo-600'
                  : ''
              }`}
            >
              {formattedDate}
            </div>
            {hasTask && !isSelected && (
              <div className="absolute bottom-0 w-1 h-1 bg-indigo-400 rounded-full"></div>
            )}
            {hasTask && isSelected && (
              <div className="absolute bottom-0 w-1 h-1 bg-white rounded-full opacity-80"></div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
    }
    return <div className="grid grid-cols-7 gap-y-3 text-center">{days}</div>;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col shadow-sm">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
