import { useState, useEffect } from 'react';
import { RiArrowDownSLine } from 'react-icons/ri';

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
  overtimeHourlyRate: '',
  paymentType: 'hourly',
  paymentMethod: 'gcash',
  paymentDetails: '',
  hourlyRate: '',
  monthlySalary: ''
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
        overtimeHourlyRate: employee.overtimeHourlyRate || '',
        paymentType: employee.paymentType || 'hourly',
        paymentMethod: employee.paymentMethod || 'gcash',
        paymentDetails: employee.paymentDetails || '',
        hourlyRate: employee.hourlyRate || '',
        monthlySalary: employee.monthlySalary || ''
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
                  <div className="relative">
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="appearance-none w-full bg-slate-50 border border-slate-200 px-4 py-4 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      {departments.length > 0 ? (
                        departments.map(dept => (
                          <option key={dept.id || dept} value={dept.name}>{dept.name}</option>
                        ))
                      ) : (
                        <option value="">No departments</option>
                      )}
                    </select>
                    <RiArrowDownSLine className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Role</label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="appearance-none w-full bg-slate-50 border border-slate-200 px-4 py-4 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      {ROLES.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                    <RiArrowDownSLine className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
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
                  <label className="text-sm font-semibold text-slate-700">Payment Type</label>
                  <div className="relative">
                    <select 
                      name="paymentType"
                      value={formData.paymentType}
                      onChange={handleInputChange}
                      className="appearance-none w-full bg-slate-50 border border-slate-200 px-4 py-4 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                      <option value="hourly">Hourly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <RiArrowDownSLine className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {formData.paymentType === 'hourly' ? (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">Hourly Rate</label>
                    <input
                      name="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      placeholder="e.g., 284.09"
                      step="0.01"
                      min="0"
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">Monthly Salary</label>
                    <input
                      name="monthlySalary"
                      type="number"
                      value={formData.monthlySalary}
                      onChange={handleInputChange}
                      placeholder="e.g., 50000"
                      step="0.01"
                      min="0"
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                )}
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
                {formData.paymentType === 'hourly' && formData.hourlyRate && (
                  <p className="text-xs text-slate-500">
                    Base rate: ₱{parseFloat(formData.hourlyRate).toFixed(2)}/hr
                  </p>
                )}
                {formData.paymentType === 'monthly' && formData.monthlySalary && (
                  <p className="text-xs text-slate-500">
                    Daily rate: ₱{(parseFloat(formData.monthlySalary) / 26).toFixed(2)}/day | Hourly: ₱{(parseFloat(formData.monthlySalary) / 208).toFixed(2)}/hr
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Payment Method</label>
                  <div className="relative">
                    <select 
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="appearance-none w-full bg-slate-50 border border-slate-200 px-4 py-4 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                      <option value="gcash">GCash</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                    <RiArrowDownSLine className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Payment Details
                  <span className="text-xs text-slate-400 font-normal ml-2">
                    {formData.paymentMethod === 'gcash' ? 'GCash Number' : formData.paymentMethod === 'bank_transfer' ? 'Bank Account Number' : 'N/A'}
                  </span>
                </label>
                <input
                  name="paymentDetails"
                  value={formData.paymentDetails}
                  onChange={handleInputChange}
                  placeholder={formData.paymentMethod === 'gcash' ? 'e.g., 09123456789' : formData.paymentMethod === 'bank_transfer' ? 'e.g., BDO 123456789' : 'N/A'}
                  disabled={formData.paymentMethod === 'cash'}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-slate-100 disabled:text-slate-400"
                />
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
