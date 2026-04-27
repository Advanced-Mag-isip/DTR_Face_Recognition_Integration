import { useState, useEffect } from 'react';
import { getShifts, addShift, updateShift, deleteShift } from '../utils/shiftApi';
import { getCurrentMonthSalary } from '../utils/salaryApi';
import { useAuth } from '../context/AuthContext';
import Topbar from './Topbar';
import TableControls from './TableControls';
import ShiftTable from './ShiftTable';
import AddShiftModal from './AddShiftModal';
import SalaryReport from './SalaryReport';
import DeleteConfirmationModal from './DeleteConfirmationModal';

function EmployeeDashboard() {
  const { user } = useAuth();
  const [sortOrder, setSortOrder] = useState('newest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingshift, setEditingshift] = useState(null);
  const [deleteShiftData, setDeleteShiftData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [salaryData, setSalaryData] = useState(null);
  const [loadingSalary, setLoadingSalary] = useState(true);

  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Reset to current month on mount
  useEffect(() => {
    setSelectedMonth(getCurrentMonth());
  }, []);

  useEffect(() => {
    Promise.all([
      getShifts()
        .then(setShifts)
        .catch(console.error)
        .finally(() => setLoadingShifts(false)),
      getCurrentMonthSalary()
        .then((data) => {
          console.log('Salary data loaded:', data);
          setSalaryData(data);
        })
        .catch((err) => {
          console.error('Salary fetch error:', err);
          // If salary API fails but we have user data, use fallback
          if (user?.dailySalary && user.dailySalary > 0) {
            const hourlyRate = user.dailySalary / 8;
            setSalaryData({
              baseSalary: parseFloat(user.dailySalary),
              overtimeRate: user.overtimeHourlyRate > 0 ? parseFloat(user.overtimeHourlyRate) : hourlyRate
            });
          }
        })
        .finally(() => setLoadingSalary(false))
    ]);
  }, [user]);

  // Filter by month
  let filteredData = [...shifts];
  if (selectedMonth) {
    filteredData = filteredData.filter(shift => {
      const shiftMonth = new Date(shift.date).toISOString().slice(0, 7);
      return shiftMonth === selectedMonth;
    })
  }

  // Sort by date
  filteredData.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const handleSaveShift = async (shiftData, setError) => {
    try {
      if (editingshift) {
        const updated = await updateShift(editingshift.id, shiftData);
        setShifts(prev => prev.map(shift => shift.id === updated.id ? updated : shift));
        setShowAddModal(false);
        setEditingshift(null);
      } else {
        const newShift = await addShift(shiftData);
        console.log('New shift added:', newShift);
        // Refresh shifts from API to ensure data is in sync
        const updatedShifts = await getShifts();
        console.log('Refreshed shifts:', updatedShifts);
        setShifts(updatedShifts);
        setShowAddModal(false);
      }
    } catch (err) {
      console.error('Failed to save shift:', err);
      const errorMsg = err.response?.data?.message || 'Failed to save shift';
      if (setError) setError(errorMsg);
    }
  };

  const handleEdit = (shift) => {
    setEditingshift(shift);
    setShowAddModal(true);
  };

  const handleDeleteClick = (shift) => {
    setDeleteShiftData(shift);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteShift(deleteShiftData.id);
      setShifts(prev => prev.filter(shift => shift.id !== deleteShiftData.id));
      setShowDeleteConfirm(false);
      setDeleteShiftData(null);
    } catch (err) {
      console.error('Failed to delete shift:', err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <Topbar />

      <div className="p-6 flex justify-center">
        <div className="w-full max-w-5xl">
          {!loadingSalary && salaryData && (
            <div className="mt-6">
              <SalaryReport
                dailySalary={salaryData.dailySalary}
                overtimeHourlyRate={salaryData.overtimeRate}
                shifts={filteredData}
                paymentType={salaryData.paymentType}
                hourlyRate={salaryData.hourlyRate}
                monthlySalary={salaryData.monthlySalary}
              />
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
            <TableControls
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              onAddShift={() => setShowAddModal(true)}
            />

            {loadingShifts ? (
               <div className="text-center py-12 text-slate-400 text-sm">
                Loading shifts...
              </div>
            ) : (
              <ShiftTable
                data={filteredData}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                dailySalary={salaryData?.dailySalary || user?.dailySalary}
                overtimeHourlyRate={salaryData?.overtimeRate || user?.overtimeHourlyRate}
                paymentType={salaryData?.paymentType || user?.paymentType}
                hourlyRate={salaryData?.hourlyRate || user?.hourlyRate}
                monthlySalary={salaryData?.monthlySalary || user?.monthlySalary}
              />
            )}
          </div>
        </div>
      </div>

      <AddShiftModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingshift(null);
        }}
        onSave={handleSaveShift}
        editingshift={editingshift}
        employeeId={user?.id}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteShiftData(null);
        }}
        onConfirm={handleDeleteConfirm}
        shiftDate={deleteShiftData?.date}
      />
    </div>
  );
}

export default EmployeeDashboard;
