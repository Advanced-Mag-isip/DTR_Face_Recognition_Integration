import { RiSearchLine, RiArrowDownSLine } from 'react-icons/ri';

function EmployeeFilters({
  searchTerm,
  setSearchTerm,
  filterDepartment,
  setFilterDepartment,
  filterRole,
  setFilterRole,
  departments
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        {/* Department Filter */}
        <div className="relative">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 px-4 py-3 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-w-[160px]"
          >
            <option value="all">All Departments</option>
            {departments.map((dept, index) => (
              <option key={dept?.id || dept?.name || index} value={dept?.name || dept}>{dept?.name || dept}</option>
            ))}
          </select>
          <RiArrowDownSLine className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
        {/* Role Filter */}
        <div className="relative">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 px-4 py-3 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-w-[140px]"
          >
            <option value="all">All Roles</option>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
          <RiArrowDownSLine className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

export default EmployeeFilters;
