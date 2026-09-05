import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format, startOfMonth, endOfMonth, isSameDay, isSameMonth, addMonths, subMonths, isToday } from 'date-fns';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { enUS, ptBR } from 'date-fns/locale';
import { useLanguage } from '../../contexts/LanguageContext';

interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  id?: string;
  required?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  fullWidth = true,
  disabled = false,
  minDate,
  maxDate,
  className,
  id,
  required = false,
}) => {
  const { language } = useLanguage();
  const locale = language === 'pt' ? ptBR : enUS;
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasError = !!error;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (date: Date) => {
    if (onChange) {
      onChange(date);
    }
    setIsOpen(false);
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'PPP');
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the first day of week for the month (to calculate padding)
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array(firstDayOfWeek).fill(null);

  const weekDays = language === 'pt' 
    ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={clsx('relative', fullWidth && 'w-full')} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block mb-1 text-sm font-medium text-neutral-700"
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={formatDisplayDate(value)}
          placeholder={placeholder || (language === 'pt' ? 'Selecione uma data' : 'Select a date')}
          onClick={handleInputClick}
          readOnly
          disabled={disabled}
          className={clsx(
            'w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-3 py-2 pr-10 cursor-pointer',
            {
              'border-neutral-300 focus:ring-primary-500 focus:border-transparent': !hasError,
              'border-danger-300 focus:ring-danger-500 focus:border-transparent': hasError,
              'bg-neutral-50 cursor-not-allowed': disabled,
            },
            className
          )}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <CalendarIcon className={clsx(
            'h-5 w-5',
            hasError ? 'text-danger-400' : 'text-neutral-400'
          )} />
        </div>
      </div>
      
      {(error || helperText) && (
        <p className={clsx(
          'mt-1 text-sm',
          hasError ? 'text-danger-600' : 'text-neutral-500'
        )}>
          {error || helperText}
        </p>
      )}

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-white rounded-lg shadow-soft-lg border border-neutral-200 p-4 animate-slide-down">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-semibold text-neutral-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-xs font-medium text-neutral-500"
              >
                {day}
              </div>
            ))}
            
            {/* Padding days */}
            {paddingDays.map((_, index) => (
              <div key={`padding-${index}`} className="h-8" />
            ))}
            
            {/* Month days */}
            {monthDays.map((date: Date) => {
              const isSelected = value && isSameDay(date, value);
              const isDisabled = isDateDisabled(date);
              const isTodayDate = isToday(date);
              
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDateSelect(date)}
                  className={clsx(
                    'h-8 w-8 flex items-center justify-center text-sm rounded-lg transition-all duration-150',
                    {
                      'bg-primary-600 text-white': isSelected,
                      'hover:bg-primary-50 text-neutral-900': !isSelected && !isDisabled && !isTodayDate,
                      'bg-primary-100 text-primary-800 font-semibold': isTodayDate && !isSelected,
                      'text-neutral-400 cursor-not-allowed': isDisabled,
                      'hover:scale-105': !isDisabled,
                    }
                  )}
                >
                  {format(date, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;