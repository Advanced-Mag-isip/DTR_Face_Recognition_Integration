import { RiArrowDownSLine } from 'react-icons/ri';
import { RiAddLine } from 'react-icons/ri';
import SortDropdown from './SortDropdown';
import MonthPicker from './MonthPicker';

function TableControls({ sortOrder, setSortOrder, selectedMonth, setSelectedMonth, onAddShift }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h2 className="text-2xl font-bold text-slate-800">Shift History</h2>

      <div className="flex items-center gap-3">
        <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
        <MonthPicker selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
        <button
          onClick={onAddShift}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
        >
          <RiAddLine className="w-5 h-5" />
          Add Shift
        </button>
      </div>
    </div>
  );
}

export default TableControls;
