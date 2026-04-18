import { useState, useEffect } from 'react';
import { RiCloseLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiCalendarLine, RiArrowDownSLine } from 'react-icons/ri';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import { getHolidays, createHoliday, updateHoliday, deleteHoliday } from '../utils/holidayApi';

const HOLIDAY_TYPES = [
  { value: 'regular', label: 'Regular Holiday', description: 'Double pay (2x)', color: 'red' },
  { value: 'special_non_working', label: 'Special Non-Working', description: '30% extra pay (1.3x)', color: 'orange' },
  { value: 'special_working', label: 'Special Working Holiday', description: 'Normal pay (1x)', color: 'blue' }
];

const MONTHS = [
  { value: 0, label: 'Jan', full: 'January' },
  { value: 1, label: 'Feb', full: 'February' },
  { value: 2, label: 'Mar', full: 'March' },
  { value: 3, label: 'Apr', full: 'April' },
  { value: 4, label: 'May', full: 'May' },
  { value: 5, label: 'Jun', full: 'June' },
  { value: 6, label: 'Jul', full: 'July' },
  { value: 7, label: 'Aug', full: 'August' },
  { value: 8, label: 'Sep', full: 'September' },
  { value: 9, label: 'Oct', full: 'October' },
  { value: 10, label: 'Nov', full: 'November' },
  { value: 11, label: 'Dec', full: 'December' }
];

function HolidayManagement({ isOpen, onClose }) {
  const [holidays, setHolidays] = useState([]);
  const [allHolidays, setAllHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'regular',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchHolidays();
    }
  }, [isOpen]);

  // Filter holidays when month/year changes
  useEffect(() => {
    if (allHolidays.length > 0) {
      const filtered = allHolidays.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate.getFullYear() === selectedYear && 
               holidayDate.getMonth() === selectedMonth;
      });
      setHolidays(filtered);
    }
  }, [selectedYear, selectedMonth, allHolidays]);

  const fetchHolidays = async () => {
    setLoading(true);
    setError('');
    try {
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;
      const data = await getHolidays(startDate, endDate);
      setAllHolidays(data);
    } catch (err) {
      setError('Failed to load holidays');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (holiday = null) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setFormData({
        name: holiday.name,
        date: holiday.date,
        type: holiday.type,
        description: holiday.description || ''
      });
    } else {
      setEditingHoliday(null);
      // Pre-fill with selected month/year
      const monthStr = String(selectedMonth + 1).padStart(2, '0');
      const defaultDate = `${selectedYear}-${monthStr}-15`;
      setFormData({
        name: '',
        date: defaultDate,
        type: 'regular',
        description: ''
      });
    }
    setIsFormOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHoliday(null);
    setFormData({
      name: '',
      date: '',
      type: 'regular',
      description: ''
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingHoliday) {
        await updateHoliday(editingHoliday.id, formData);
        setSuccess('Holiday updated successfully');
      } else {
        await createHoliday(formData);
        setSuccess('Holiday created successfully');
      }
      handleCloseForm();
      fetchHolidays();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save holiday');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;

    try {
      await deleteHoliday(id);
      setSuccess('Holiday deleted successfully');
      fetchHolidays();
    } catch (err) {
      setError('Failed to delete holiday');
      console.error(err);
    }
  };

  const getHolidayTypeColor = (type) => {
    switch (type) {
      case 'regular': return 'bg-red-100 text-red-700 border-red-200';
      case 'special_non_working': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'special_working': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getHolidayTypeLabel = (type) => {
    const holiday = HOLIDAY_TYPES.find(h => h.value === type);
    return holiday ? holiday.label : type;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getYearOptions = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 2; i <= currentYear + 3; i++) {
      years.push(i);
    }
    return years;
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  if (!isOpen) return null;

  const currentMonthLabel = MONTHS[selectedMonth];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 60 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <RiCalendarLine className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Holiday Management</h2>
              <p className="text-xs text-slate-500">Manage company holidays and pay rates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors"
            >
              <RiAddLine className="w-4 h-4" />
              Add Holiday
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <RiCloseLine className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Month/Year Navigator */}
        <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RiArrowLeftSLine className="w-5 h-5 text-slate-600" />
          </button>
          
          <div className="flex items-center gap-3">
            {/* Month Selector */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-white border border-slate-200 px-3 py-1.5 pr-8 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              >
                {MONTHS.map(month => (
                  <option key={month.value} value={month.value}>{month.full}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <RiArrowDownSLine className="w-4 h-4" />
              </div>
            </div>

            {/* Year Selector */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-white border border-slate-200 px-3 py-1.5 pr-8 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              >
                {getYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <RiArrowDownSLine className="w-4 h-4" />
              </div>
            </div>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RiArrowRightSLine className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {HOLIDAY_TYPES.map(type => (
            <div key={type.value} className={`p-4 rounded-xl border-2 ${getHolidayTypeColor(type.value)}`}>
              <div className="font-bold text-sm">{type.label}</div>
              <div className="text-xs mt-1 opacity-80">{type.description}</div>
            </div>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            {success}
          </div>
        )}

        {/* Holiday List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading holidays...</div>
        ) : holidays.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <RiCalendarLine className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No holidays for {currentMonthLabel.full} {selectedYear}</p>
            <p className="text-xs mt-1">Click "Add Holiday" to create one</p>
          </div>
        ) : (
          <div className="space-y-3">
            {holidays.map(holiday => (
              <div
                key={holiday.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[70px]">
                    <div className="text-xs text-slate-500 uppercase font-semibold">
                      {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                      {new Date(holiday.date).getDate()}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{holiday.name}</div>
                    <div className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium border ${getHolidayTypeColor(holiday.type)}`}>
                      {getHolidayTypeLabel(holiday.type)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenForm(holiday)}
                    className="text-sm text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-medium"
                  >
                    <RiEditLine className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(holiday.id)}
                    className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-medium"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 70 }}
          onClick={handleCloseForm}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <RiCloseLine className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Holiday Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Christmas Day"
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Holiday Type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                    >
                      {HOLIDAY_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label} - {type.description}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <RiArrowDownSLine className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional notes about this holiday..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
                >
                  {editingHoliday ? 'Update Holiday' : 'Save Holiday'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HolidayManagement;
