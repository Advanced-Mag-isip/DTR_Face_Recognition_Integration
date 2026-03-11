import { RiCalendarLine } from 'react-icons/ri';
import { RiArrowDownSLine } from 'react-icons/ri';
import { RiArrowLeftSLine } from 'react-icons/ri';
import { RiArrowRightSLine } from 'react-icons/ri';
import { RiCloseLine } from 'react-icons/ri';
import { useState, useRef, useEffect } from 'react';

function MonthPicker({ selectedMonth, setSelectedMonth }) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(2026);
  const pickerRef = useRef(null);

  const months = [
    { value: '01', label: 'Jan' },
    { value: '02', label: 'Feb' },
    { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' },
    { value: '05', label: 'May' },
    { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' },
    { value: '08', label: 'Aug' },
    { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dec' },
  ];

  const years = [2024, 2025, 2026, 2027, 2028];

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedMonthLabel = () => {
    const [year, month] = selectedMonth.split('-');
    const monthObj = months.find(m => m.value === month);
    return monthObj ? `${monthObj.label} ${year}` : 'Select Month';
  };

  const handleMonthSelect = (monthValue) => {
    setSelectedMonth(`${pickerYear}-${monthValue}`);
    setShowPicker(false);
  };

  const handleYearChange = (direction) => {
    setPickerYear(prev => prev + direction);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <RiCalendarLine className="w-5 h-5" />
        {getSelectedMonthLabel()}
        <RiArrowDownSLine className={`w-5 h-5 text-slate-500 transition-transform ${showPicker ? 'rotate-180' : ''}`} />
      </button>

      {showPicker && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 min-w-[220px]">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => handleYearChange(-1)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RiArrowLeftSLine className="w-5 h-5 text-slate-700" />
            </button>
            <span className="text-sm font-bold text-slate-800">{pickerYear}</span>
            <button
              onClick={() => handleYearChange(1)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RiArrowRightSLine className="w-5 h-5 text-slate-700" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {months.map((month) => {
              const isSelected = selectedMonth === `${pickerYear}-${month.value}`;
              const isDisabled = !years.includes(pickerYear) ||
                (pickerYear === 2028 && month.value > '02');
              return (
                <button
                  key={month.value}
                  onClick={() => !isDisabled && handleMonthSelect(month.value)}
                  disabled={isDisabled}
                  className={`px-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-primary text-white'
                      : isDisabled
                      ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {month.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthPicker;
