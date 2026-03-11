import { RiArrowDownSLine } from 'react-icons/ri';

function SortDropdown({ sortOrder, setSortOrder }) {
  return (
    <div className="relative">
      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        className="appearance-none bg-slate-50 border border-slate-200 px-4 py-2 pr-10 rounded-xl text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>
      <RiArrowDownSLine className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
    </div>
  );
}

export default SortDropdown;
