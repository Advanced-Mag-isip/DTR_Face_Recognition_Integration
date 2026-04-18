import { useState, useEffect } from 'react';
import { RiCloseLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiBuildingLine } from 'react-icons/ri';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../utils/departmentApi';

function DepartmentManagement({ isOpen, onClose, onDepartmentsChange }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      setError('Failed to load departments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (department = null) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        description: department.description || ''
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setIsFormOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDepartment(null);
    setFormData({
      name: '',
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
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, formData);
        setSuccess('Department updated successfully');
      } else {
        await createDepartment(formData);
        setSuccess('Department created successfully');
      }
      handleCloseForm();
      fetchDepartments();
      
      // Notify parent component of change
      if (onDepartmentsChange) {
        onDepartmentsChange();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save department');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      await deleteDepartment(id);
      setSuccess('Department deleted successfully');
      fetchDepartments();
      
      // Notify parent component of change
      if (onDepartmentsChange) {
        onDepartmentsChange();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department');
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 60 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <RiBuildingLine className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Department Management</h2>
              <p className="text-xs text-slate-500">Manage company departments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors"
            >
              <RiAddLine className="w-4 h-4" />
              Add Department
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <RiCloseLine className="w-6 h-6" />
            </button>
          </div>
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

        {/* Department List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No departments found. Click "Add Department" to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {departments.map(dept => (
              <div
                key={dept.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <RiBuildingLine className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{dept.name}</span>
                    </div>
                    {dept.description && (
                      <div className="text-xs text-slate-500 mt-1">
                        {dept.description}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">
                      {dept.userCount || 0} employees
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenForm(dept)}
                    className="text-sm text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-medium"
                  >
                    <RiEditLine className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
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
                {editingDepartment ? 'Edit Department' : 'Add Department'}
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
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Human Resources"
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this department..."
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
                  {editingDepartment ? 'Update Department' : 'Save Department'}
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

export default DepartmentManagement;
