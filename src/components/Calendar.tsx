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
  const [isEditingDate, setIsEditingDate] = React.useState(false);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    if (!isNaN(year) && year > 1900 && year < 2100) {
      setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-center mb-6 h-8">
        {isEditingDate ? (
          <div className="flex gap-1.5 items-center bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
            <select
              value={currentMonth.getMonth()}
              onChange={handleMonthChange}
              className="text-base font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{format(new Date(0, i), 'MMMM')}</option>
              ))}
            </select>
            <span className="text-slate-300 font-bold text-lg">-</span>
            <input
              type="number"
              defaultValue={currentMonth.getFullYear()}
              onChange={handleYearChange}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingDate(false)}
              className="w-16 text-base font-bold text-slate-700 bg-transparent outline-none text-center"
            />
            <button 
              onClick={() => setIsEditingDate(false)} 
              className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded flex items-center justify-center hover:bg-indigo-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditingDate(true)}
            className="font-bold text-lg text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            {format(currentMonth, 'MMMM - yyyy')}
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
        )}
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

  const renderFooter = () => {
    return (
      <div className="flex justify-center gap-4 mt-6">
        <button 
          onClick={prevMonth}
          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors shadow-sm border border-slate-100"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <button 
          onClick={nextMonth}
          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors shadow-sm border border-slate-100"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col shadow-sm relative">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      {renderFooter()}
    </div>
  );
}
