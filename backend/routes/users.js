const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Shift = require('../models/Shift');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all users (admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(users.map(u => ({
            id: u.id,
            employeeId: u.employeeId,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            department: u.department,
            position: u.position,
            dailySalary: u.dailySalary,
            hourlyRate: u.hourlyRate,
            monthlySalary: u.monthlySalary,
            overtimeHourlyRate: u.overtimeHourlyRate,
            paymentType: u.paymentType,
            paymentMethod: u.paymentMethod,
            paymentDetails: u.paymentDetails,
            payrollNotes: u.payrollNotes,
            isActive: u.isActive,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt
        })));
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Create new user (admin only)
router.post('/', protect, admin, async (req, res) => {
    const { employeeId, password, firstName, lastName, role, department, isActive, position, dailySalary, hourlyRate, monthlySalary, overtimeHourlyRate, paymentType, paymentMethod, paymentDetails } = req.body;

    try {
        // Auto-generate employee ID based on role if not provided
        let generatedEmployeeId = employeeId;
        if (!generatedEmployeeId) {
            const prefix = role === 'admin' ? 'ADMIN' : 'EMP';
            const lastUser = await User.findOne({
                where: { role },
                order: [['employeeId', 'DESC']]
            });
            
            let nextNum = 1;
            if (lastUser && lastUser.employeeId) {
                const match = lastUser.employeeId.match(new RegExp(`^${prefix}-(\\d+)$`));
                if (match) {
                    nextNum = parseInt(match[1], 10) + 1;
                }
            }
            generatedEmployeeId = `${prefix}-${String(nextNum).padStart(3, '0')}`;
        } else {
            // Check if provided employee ID already exists
            const existingUser = await User.findOne({ where: { employeeId: generatedEmployeeId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Employee ID already exists' });
            }
        }

        // Default password is the same as employee ID
        const generatedPassword = generatedEmployeeId;

        const user = await User.create({
            employeeId: generatedEmployeeId,
            password: password || generatedPassword,
            firstName,
            lastName,
            role,
            department,
            isActive: isActive !== undefined ? isActive : true,
            position: position || null,
            dailySalary: dailySalary || 0,
            hourlyRate: hourlyRate || 0,
            monthlySalary: monthlySalary || 0,
            overtimeHourlyRate: overtimeHourlyRate || 0,
            paymentType: paymentType || 'hourly',
            paymentMethod: paymentMethod || 'gcash',
            paymentDetails: paymentDetails || null
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                employeeId: user.employeeId,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                department: user.department,
                position: user.position,
                dailySalary: user.dailySalary,
                hourlyRate: user.hourlyRate,
                monthlySalary: user.monthlySalary,
                overtimeHourlyRate: user.overtimeHourlyRate,
                paymentType: user.paymentType,
                paymentMethod: user.paymentMethod,
                paymentDetails: user.paymentDetails,
                isActive: user.isActive
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update user (admin only)
router.put('/:id', protect, admin, async (req, res) => {
    const { employeeId, password, firstName, lastName, role, department, isActive, position, dailySalary, hourlyRate, monthlySalary, overtimeHourlyRate, paymentType, paymentMethod, paymentDetails } = req.body;

    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (employeeId && employeeId !== user.employeeId) {
            const existingUser = await User.findOne({ where: { employeeId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Employee ID already exists' });
            }
            user.employeeId = employeeId;
        }

        if (password) user.password = password;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (role) user.role = role;
        if (department) user.department = department;
        if (isActive !== undefined) user.isActive = isActive;
        if (position !== undefined) user.position = position;
        if (dailySalary !== undefined) user.dailySalary = dailySalary;
        if (hourlyRate !== undefined) user.hourlyRate = hourlyRate;
        if (monthlySalary !== undefined) user.monthlySalary = monthlySalary;
        if (overtimeHourlyRate !== undefined) user.overtimeHourlyRate = overtimeHourlyRate;
        if (paymentType !== undefined) user.paymentType = paymentType;
        if (paymentMethod !== undefined) user.paymentMethod = paymentMethod;
        if (paymentDetails !== undefined) user.paymentDetails = paymentDetails;

        await user.save();

        res.json({
            message: 'User updated successfully',
            user: {
                id: user.id,
                employeeId: user.employeeId,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                department: user.department,
                position: user.position,
                dailySalary: user.dailySalary,
                hourlyRate: user.hourlyRate,
                monthlySalary: user.monthlySalary,
                overtimeHourlyRate: user.overtimeHourlyRate,
                paymentType: user.paymentType,
                paymentMethod: user.paymentMethod,
                paymentDetails: user.paymentDetails,
                isActive: user.isActive
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete user (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare as strings to handle type mismatch
        if (String(user.id) === String(req.user.id)) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        console.log(`Deleting shifts for user ${user.id}...`);
        // Delete associated shifts first to avoid foreign key constraint
        const deletedShiftsCount = await Shift.destroy({ where: { employeeId: user.id } });
        console.log(`Deleted ${deletedShiftsCount} shifts for user ${user.id}`);

        console.log(`Deleting user ${user.id}...`);
        await user.destroy();
        console.log(`User ${user.id} deleted successfully`);

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Save payroll note for employee
router.put('/:id/payroll-note', protect, admin, async (req, res) => {
    const { id } = req.params;
    const { period, note } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let notes = {};
        try {
          if (user.payrollNotes) {
            notes = typeof user.payrollNotes === 'string' 
              ? JSON.parse(user.payrollNotes) 
              : user.payrollNotes;
          }
        } catch (e) {
          notes = {};
        }
        notes[period] = note;

        await user.update({ payrollNotes: JSON.stringify(notes) });

        res.json({ message: 'Payroll note saved', payrollNotes: notes });
    } catch (err) {
        console.error('Save payroll note error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
