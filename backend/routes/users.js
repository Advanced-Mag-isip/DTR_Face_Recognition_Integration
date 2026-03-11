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
            monthlySalary: u.monthlySalary,
            overtimeHourlyRate: u.overtimeHourlyRate,
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
    const { employeeId, password, firstName, lastName, role, department, isActive, position, monthlySalary, overtimeHourlyRate } = req.body;

    try {
        const existingUser = await User.findOne({ where: { employeeId } });
        if (existingUser) {
            return res.status(400).json({ message: 'Employee ID already exists' });
        }

        const user = await User.create({
            employeeId,
            password,
            firstName,
            lastName,
            role,
            department,
            isActive: isActive !== undefined ? isActive : true,
            position: position || null,
            monthlySalary: monthlySalary || 0,
            overtimeHourlyRate: overtimeHourlyRate || 0
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
                monthlySalary: user.monthlySalary,
                overtimeHourlyRate: user.overtimeHourlyRate,
                isActive: user.isActive
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update user (admin only)
router.put('/:id', protect, admin, async (req, res) => {
    const { employeeId, password, firstName, lastName, role, department, isActive, position, monthlySalary, overtimeHourlyRate } = req.body;

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
        if (monthlySalary !== undefined) user.monthlySalary = monthlySalary;
        if (overtimeHourlyRate !== undefined) user.overtimeHourlyRate = overtimeHourlyRate;

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
                monthlySalary: user.monthlySalary,
                overtimeHourlyRate: user.overtimeHourlyRate,
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

module.exports = router;
