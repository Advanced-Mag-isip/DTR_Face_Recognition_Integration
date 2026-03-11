import { RiUserLine } from 'react-icons/ri';
import { RiUserAddLine } from 'react-icons/ri';
import { RiBuilding2Line } from 'react-icons/ri';

function EmployeeStats({ employees }) {
  const stats = [
    {
      label: 'Total Employees',
      value: employees.length,
      icon: RiUserLine,
    },
    {
      label: 'Active',
      value: employees.filter(e => e.isActive).length,
      icon: RiUserAddLine,
    },
    {
      label: 'Admins',
      value: employees.filter(e => e.role === 'admin').length,
      icon: RiUserLine,
    },
    {
      label: 'Departments',
      value: [...new Set(employees.map(e => e.department))].length,
      icon: RiBuilding2Line,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-slate-100 p-3 rounded-xl">
            <stat.icon className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EmployeeStats;
