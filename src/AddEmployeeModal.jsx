import { useState, useEffect } from 'react';

const ROLES = [
  { value: 'employee', label: 'Employee' },
  { value: 'admin', label: 'Admin' }
];

const initialFormState = {
  firstName: '',
  lastName: '',
  department: '',
  role: 'employee',
  isActive: true,
  position: '',
  dailySalary: '',
  overtimeHourlyRate: ''
};

function AddEmployeeModal({ isOpen, onClose, onSubmit, loading, employee, departments = [] }) {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const isEditMode = !!employee;

  // Populate form when editing an employee
  useEffect(() => {
    if (employee) {
      setFormData({
        employeeId: employee.employeeId || '',
        password: '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        department: employee.department || (departments.length > 0 ? departments[0].name : ''),
        role: employee.role || 'employee',
        isActive: employee.isActive !== undefined ? employee.isActive : true,
        position: employee.position || '',
        dailySalary: employee.dailySalary || '',
        overtimeHourlyRate: employee.overtimeHourlyRate || ''
      });
    } else {
      setFormData(initialFormState);
    }
  }, [employee, departments]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    await onSubmit(formData);
    if (!isEditMode) {
      setFormData(initialFormState);
    }
  };

  const handleClose = () => {
    setError('');
    setFormData(initialFormState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-xl font-bold text-slate-800">
            {isEditMode ? 'Edit Employee' : 'Add New Employee'}
          </h3>
          <p className="text-sm text-slate-500">
            {isEditMode ? 'Update employee information' : 'Enter the employee details below'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <div className="p-6 overflow-y-auto flex-1">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">First Name</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Last Name</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    {departments.length > 0 ? (
                      departments.map(dept => (
                        <option key={dept.id || dept} value={dept.name}>{dept.name}</option>
                      ))
                    ) : (
                      <option value="">No departments</option>
                    )}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    {ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Position</label>
                  <input
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Developer"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Daily Salary</label>
                  <input
                    name="dailySalary"
                    type="number"
                    value={formData.dailySalary}
                    onChange={handleInputChange}
                    placeholder="e.g., 2272.73"
                    step="0.01"
                    min="0"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Overtime Hourly Rate (Optional)
                  <span className="text-xs text-slate-400 font-normal ml-2">
                    Default: Same as hourly rate
                  </span>
                </label>
                <input
                  name="overtimeHourlyRate"
                  type="number"
                  value={formData.overtimeHourlyRate}
                  onChange={handleInputChange}
                  placeholder="Auto-calculated if empty"
                  step="0.01"
                  min="0"
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {formData.dailySalary && (
                  <p className="text-xs text-slate-500">
                    Hourly rate: ₱{(parseFloat(formData.dailySalary) / 8).toFixed(2)}/hr
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700">Active account</label>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition disabled:opacity-50"
            >
              {loading ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Employee')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEmployeeModal;
