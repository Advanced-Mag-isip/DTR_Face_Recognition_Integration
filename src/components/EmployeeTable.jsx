import { RiCalendarEventLine } from 'react-icons/ri';
import { RiEditLine } from 'react-icons/ri';
import { RiDeleteBinLine } from 'react-icons/ri';

function EmployeeTable({
  employees,
  loading,
  onViewHistory,
  onEdit,
  onDelete
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-12 text-center text-slate-400 text-sm">
          Loading employees...
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-12 text-center text-slate-400 text-sm">
          No employees found matching your criteria.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary text-left">
              <th className="px-6 py-4 text-sm font-semibold text-white rounded-tl-xl">Employee ID</th>
              <th className="px-6 py-4 text-sm font-semibold text-white">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-white">Department</th>
              <th className="px-6 py-4 text-sm font-semibold text-white">Role</th>
              <th className="px-6 py-4 text-sm font-semibold text-white">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-white rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-800">{emp.employeeId}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <span className="text-sm text-slate-700 font-medium">{emp.firstName} {emp.lastName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">{emp.department}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                    emp.role === 'admin'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {emp.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                    emp.isActive
                      ? 'bg-success-bg text-success'
                      : 'bg-danger-bg text-danger'
                  }`}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewHistory(emp)}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium"
                      title="View Shift History"
                    >
                      <RiCalendarEventLine className="w-4 h-4" />
                      History
                    </button>
                    <button
                      onClick={() => onEdit(emp)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <RiEditLine className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(emp)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeTable;
