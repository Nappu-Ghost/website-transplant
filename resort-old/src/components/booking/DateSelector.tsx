import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isWithinInterval,
  parseISO
} from 'date-fns';

interface DateSelectorProps {
  checkInDate: string;
  checkOutDate: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  checkInDate,
  checkOutDate,
  onInputChange
}) => {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const today = new Date();

  const calendarDays = monthStart && monthEnd
    ? eachDayOfInterval({ start: monthStart, end: monthEnd })
    : [];

  const leadingEmptyDays = monthStart ? getDay(monthStart) : 0;
  
  const checkIn = checkInDate ? parseISO(checkInDate) : null;
  const checkOut = checkOutDate ? parseISO(checkOutDate) : null;
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-4">Select your date range</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="checkInDate" className="block text-lg font-medium text-white mb-2">
            Check-in Date
          </label>
          <input
            type="date"
            id="checkInDate"
            name="checkInDate"
            value={checkInDate}
            onChange={onInputChange}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="checkOutDate" className="block text-lg font-medium text-white mb-2">
            Check-out Date
          </label>
          <input
            type="date"
            id="checkOutDate"
            name="checkOutDate"
            value={checkOutDate}
            onChange={onInputChange}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {checkInDate && checkOutDate && (
          <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <div className="flex items-center justify-between text-blue-300">
              <span>Length of Stay:</span>
              <span className="font-bold">
                {Math.max(
                  Math.floor((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)), 
                  1
                )} nights
              </span>
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousMonth}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-white">
              {format(monthStart, 'MMMM yyyy')}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-sm font-medium text-gray-300">
                {d}
              </div>
            ))}

            {[...Array(leadingEmptyDays)].map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {calendarDays.map((day: Date) => {
              const isSelected =
                checkIn && checkOut &&
                isWithinInterval(day, { start: checkIn, end: checkOut });
              const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 text-sm rounded-full ${
                    isSelected 
                      ? 'bg-blue-500 text-white' 
                      : isToday
                        ? 'bg-purple-500 text-white ring-2 ring-purple-300'
                        : 'text-white hover:bg-white/10'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateSelector;