import { useState, useEffect } from 'react';
import { RiTimeLine } from 'react-icons/ri';
import { RiLogoutBoxLine } from 'react-icons/ri';
import { RiSettings4Line } from 'react-icons/ri';
import { RiAddLine } from 'react-icons/ri';
import { RiUserAddLine } from 'react-icons/ri';
import { RiCloseLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers, createUser, updateUser, deleteUser } from '../utils/usersApi';
import { getShifts, addShift, updateShift, deleteShift } from '../utils/shiftApi';
import SettingsModal from './SettingsModal';
import AddShiftModal from './AddShiftModal';
import ShiftTable from './ShiftTable';
import StatsCards from './StatsCards';
import SalaryReport from './SalaryReport';
import MonthPicker from './MonthPicker';
import SortDropdown from './SortDropdown';
import ConfirmModal from './ConfirmModal';
import EmployeeStats from './EmployeeStats';
import EmployeeFilters from './EmployeeFilters';
import EmployeeTable from './EmployeeTable';
import AddEmployeeModal from './AddEmployeeModal';
import ViewTabs from './ViewTabs';

const TABS = [
  { value: 'employees', label: 'Employee Management' },
  { value: 'shiftHistory', label: 'Shift History' }
];

function AdminDashboard() {
  // Modal states
  const [showSettings, setShowSettings] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [showEmployeeHistoryModal, setShowEmployeeHistoryModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Data states
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [shifts, setShifts] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(true);

  // Filter states
  const [currentView, setCurrentView] = useState('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedMonth, setSelectedMonth] = useState('2026-03');

  // Action states
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingShift, setEditingShift] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [showDeleteShiftConfirm, setShowDeleteShiftConfirm] = useState(false);
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [updatingEmployee, setUpdatingEmployee] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState(false);

  const { logout, user, setUser } = useAuth();
  const navigate = useNavigate();

  // Fetch data on mount
  useEffect(() => {
    Promise.all([
      getUsers()
        .then(setEmployees)
        .catch(console.error)
        .finally(() => setLoadingEmployees(false)),
      getShifts()
        .then(setShifts)
        .catch(console.error)
        .finally(() => setLoadingShifts(false))
    ]);
  }, []);

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const departments = [...new Set(employees.map(e => e.department))];

  // Get shifts for specific employee
  const getEmployeeShifts = (empId) => {
    if (!empId) return [];
    let empShifts = shifts.filter(s => s.employeeId === empId);
    if (selectedMonth) {
      empShifts = empShifts.filter(shift => {
        const shiftMonth = new Date(shift.date).toISOString().slice(0, 7);
        return shiftMonth === selectedMonth;
      });
    }
    empShifts.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return empShifts;
  };

  // Get filtered shifts
  const getFilteredShifts = () => {
    let filtered = [...shifts];
    if (selectedMonth) {
      filtered = filtered.filter(shift => {
        const shiftMonth = new Date(shift.date).toISOString().slice(0, 7);
        return shiftMonth === selectedMonth;
      });
    }
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return filtered;
  };

  // Handlers
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddEmployee = async (formData) => {
    setAddingEmployee(true);
    try {
      await createUser(formData);
      const updated = await getUsers();
      setEmployees(updated);
      setShowAddEmployeeModal(false);
    } catch (err) {
      return err.response?.data?.message || 'Failed to add employee';
    } finally {
      setAddingEmployee(false);
    }
  };

  const handleEditEmployee = async (formData) => {
    setUpdatingEmployee(true);
    try {
      await updateUser(editingEmployee.id, formData);
      const updated = await getUsers();
      setEmployees(updated);
      // Update user context if editing own profile
      if (editingEmployee.id === user?.id) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      setShowAddEmployeeModal(false);
      setEditingEmployee(null);
    } catch (err) {
      return err.response?.data?.message || 'Failed to update employee';
    } finally {
      setUpdatingEmployee(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    setDeletingEmployee(true);
    try {
      await deleteUser(employeeToDelete.id);
      const updated = await getUsers();
      setEmployees(updated);
      setShowDeleteConfirm(false);
      setEmployeeToDelete(null);
    } catch (err) {
      console.error('Failed to delete employee:', err);
      return err.response?.data?.message || 'Failed to delete employee';
    } finally {
      setDeletingEmployee(false);
    }
  };

  const handleSaveShift = async (savedShift, setError) => {
    try {
      if (editingShift) {
        const updated = await updateShift(editingShift.id, savedShift);
        setShifts(prev => prev.map(shift => shift.id === updated.id ? updated : shift));
        setShowAddShiftModal(false);
        setEditingShift(null);
      } else {
        const newShift = await addShift(savedShift);
        setShifts(prev => [newShift, ...prev]);
        setShowAddShiftModal(false);
        setEditingShift(null);
      }
    } catch (err) {
      console.error('Failed to save shift:', err);
      const errorMsg = err.response?.data?.message || 'Failed to save shift';
      if (setError) setError(errorMsg);
    }
  };

  const handleDeleteShift = async () => {
    if (!shiftToDelete) return;
    try {
      await deleteShift(shiftToDelete.id);
      setShifts(prev => prev.filter(s => s.id !== shiftToDelete.id));
      setShowDeleteShiftConfirm(false);
      setShiftToDelete(null);
    } catch (err) {
      console.error('Failed to delete shift:', err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Topbar */}
      <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-xl shadow-sm">
              <RiTimeLine className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">DTR Tracker</h1>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              Hi, <strong className="text-slate-800">{user?.firstName || 'Admin'}</strong>
            </span>
            <button
              className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
              onClick={() => setShowSettings(true)}
            >
              <RiSettings4Line className="w-5 h-5" />
              Settings
            </button>
            <button
              className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <RiLogoutBoxLine className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* View Tabs */}
          <ViewTabs
            tabs={TABS}
            activeTab={currentView}
            onTabChange={setCurrentView}
          />

          {currentView === 'employees' && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Employee Management</h2>
                  <p className="text-sm text-slate-500">View and manage all employee records and shifts</p>
                </div>
                <button
                  onClick={() => setShowAddEmployeeModal(true)}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors shadow-sm"
                >
                  <RiUserAddLine className="w-5 h-5" />
                  Add New Employee
                </button>
              </div>

              {/* Stats */}
              <EmployeeStats employees={employees} />

              {/* Filters */}
              <EmployeeFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterDepartment={filterDepartment}
                setFilterDepartment={setFilterDepartment}
                filterRole={filterRole}
                setFilterRole={setFilterRole}
                departments={departments}
              />

              {/* Table */}
              <EmployeeTable
                employees={filteredEmployees}
                loading={loadingEmployees}
                onViewHistory={(emp) => {
                  setSelectedEmployee(emp);
                  setShowEmployeeHistoryModal(true);
                }}
                onEdit={(emp) => {
                  setEditingEmployee(emp);
                  setShowAddEmployeeModal(true);
                }}
                onDelete={(emp) => {
                  setEmployeeToDelete(emp);
                  setShowDeleteConfirm(true);
                }}
              />
            </>
          )}

          {currentView === 'shiftHistory' && (
            <div className="w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">My Shift History</h2>
                <p className="text-sm text-slate-500">View and manage your own attendance records</p>
              </div>

              <StatsCards data={getFilteredShifts()} />

              {(user?.monthlySalary && user.monthlySalary > 0) && (
                <div className="mt-8">
                  <SalaryReport
                    monthlySalary={user.monthlySalary}
                    overtimeHourlyRate={user.overtimeHourlyRate}
                    shifts={getFilteredShifts()}
                  />
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
                    <MonthPicker selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
                  </div>
                  <button
                    onClick={() => {
                      setEditingShift(null);
                      setShowAddShiftModal(true);
                    }}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
                  >
                    <RiAddLine className="w-5 h-5" />
                    Add Shift
                  </button>
                </div>

                {loadingShifts ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    Loading shifts...
                  </div>
                ) : (
                  <ShiftTable
                    data={getFilteredShifts()}
                    onEdit={(shift) => {
                      setEditingShift(shift);
                      setShowAddShiftModal(true);
                    }}
                    onDelete={(shift) => {
                      setShiftToDelete(shift);
                      setShowDeleteShiftConfirm(true);
                    }}
                    monthlySalary={user?.monthlySalary}
                    overtimeHourlyRate={user?.overtimeHourlyRate}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={showAddEmployeeModal}
        onClose={() => {
          setShowAddEmployeeModal(false);
          setEditingEmployee(null);
        }}
        onSubmit={editingEmployee ? handleEditEmployee : handleAddEmployee}
        loading={editingEmployee ? updatingEmployee : addingEmployee}
        employee={editingEmployee}
      />

      <AddShiftModal
        isOpen={showAddShiftModal}
        onClose={() => {
          setShowAddShiftModal(false);
          setEditingShift(null);
        }}
        onSave={handleSaveShift}
        editingshift={editingShift}
        zIndex={showEmployeeHistoryModal ? 60 : 50}
        employeeId={showEmployeeHistoryModal ? selectedEmployee?.id : null}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setEmployeeToDelete(null);
        }}
        onConfirm={handleDeleteEmployee}
        title="Delete Employee"
        message={`Are you sure you want to delete <strong>${employeeToDelete?.firstName} ${employeeToDelete?.lastName}</strong> (${employeeToDelete?.employeeId})?<br/><br/><strong class="text-red-600">Warning:</strong> This will also delete all associated shift records. This action cannot be undone.`}
        confirmText="Delete"
        confirmClassName="bg-red-500 hover:bg-red-600"
        disabled={deletingEmployee}
      />

      <ConfirmModal
        isOpen={showDeleteShiftConfirm}
        onClose={() => {
          setShowDeleteShiftConfirm(false);
          setShiftToDelete(null);
        }}
        onConfirm={handleDeleteShift}
        title="Delete Shift"
        message={`Are you sure you want to delete the shift for <strong>${shiftToDelete?.date}</strong>? This action cannot be undone.`}
        confirmText="Delete"
        confirmClassName="bg-red-500 hover:bg-red-600"
      />

      {/* Employee Shift History Modal */}
      {showEmployeeHistoryModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Shift History</h3>
                <p className="text-sm text-slate-500">
                  {selectedEmployee.firstName} {selectedEmployee.lastName} ({selectedEmployee.employeeId})
                </p>
              </div>
              <button
                onClick={() => setShowEmployeeHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <RiCloseLine className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
                  <MonthPicker selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
                </div>
                <button
                  onClick={() => {
                    setEditingShift(null);
                    setShowAddShiftModal(true);
                  }}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
                >
                  <RiAddLine className="w-5 h-5" />
                  Add Shift
                </button>
              </div>

              <StatsCards data={getEmployeeShifts(selectedEmployee.id)} />

              {(selectedEmployee.monthlySalary && selectedEmployee.monthlySalary > 0) && (
                <div className="mt-8">
                  <SalaryReport
                    monthlySalary={selectedEmployee.monthlySalary}
                    overtimeHourlyRate={selectedEmployee.overtimeHourlyRate}
                    shifts={getEmployeeShifts(selectedEmployee.id)}
                  />
                </div>
              )}

              <ShiftTable
                data={getEmployeeShifts(selectedEmployee.id)}
                onEdit={(shift) => {
                  setEditingShift(shift);
                  setShowAddShiftModal(true);
                }}
                onDelete={(shift) => {
                  setShiftToDelete(shift);
                  setShowDeleteShiftConfirm(true);
                }}
                monthlySalary={selectedEmployee.monthlySalary}
                overtimeHourlyRate={selectedEmployee.overtimeHourlyRate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
