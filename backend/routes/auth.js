const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

router.post('/login', async (req, res) => {
    const { employeeId, password } = req.body;

    if (!employeeId || !password)
        return res.status(401).json({ message: 'Please provide Employee ID or password' });

    try {
        const user = await User.findOne({ where: { employeeId } });

        if (!user || !(await user.comparePassword(password)))
            return res.status(401).json({ message: 'Invalid Employee ID or password'});

        if (!user.isActive)
            return res.status(403).json({ message: 'Account is deactivated. Contact admin.' });

        res.json({
            token: generateToken(user.id),
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
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});

router.put('/change-password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide current and new password' });
    }

    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
