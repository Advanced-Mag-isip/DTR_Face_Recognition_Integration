const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const User = require('../models/User');
const Holiday = require('../models/Holiday');
const { Op } = require('sequelize');
const { protect, admin } = require('../middleware/authMiddleware');

const calcHours = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return parseFloat((diff / 60).toFixed(2));
};

// Helper function to check if a date is a holiday
const checkHoliday = async (date) => {
    try {
        const holiday = await Holiday.findOne({ where: { date } });
        if (holiday) {
            return {
                isHoliday: true,
                holidayType: holiday.type,
                holidayName: holiday.name
            };
        }
    } catch (err) {
        console.error('Error checking holiday:', err);
    }
    return {
        isHoliday: false,
        holidayType: null,
        holidayName: null
    };
};

// Create shift - for self or admin for employee
router.post('/', protect, async (req, res) => {
    const { date, morningIn, morningOut, afternoonIn, afternoonOut, overtimeStart, overtimeEnd, employeeId, notes } = req.body;



    try {
        // Determine whose shift it is (admin can create for others)
        const targetEmployeeId = (req.user.role === 'admin' && employeeId) ? employeeId : req.user.id;

        // Verify employee exists
        const employee = await User.findByPk(targetEmployeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const existing = await Shift.findOne({
            where: {
                employeeId: targetEmployeeId,
                date
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'A shift for this day already exists.' });
        }

        // Validate that at least one shift period is provided
        if ((!morningIn || !morningOut) && (!afternoonIn || !afternoonOut)) {
            return res.status(400).json({ message: 'Please provide at least Morning or Afternoon shift times' });
        }

        const morningHours = calcHours(morningIn, morningOut);
        const afternoonHours = calcHours(afternoonIn, afternoonOut);
        const overtimeHours = calcHours(overtimeStart, overtimeEnd);
        const totalHours = morningHours + afternoonHours + overtimeHours;

        // Check if the date is a holiday
        const holidayInfo = await checkHoliday(date);

        const shift = await Shift.create({
            employeeId: targetEmployeeId,
            date,
            morningTimeIn: morningIn || null,
            morningTimeOut: morningOut || null,
            morningHours,
            afternoonTimeIn: afternoonIn || null,
            afternoonTimeOut: afternoonOut || null,
            afternoonHours,
            overtimeTimeIn: overtimeStart || null,
            overtimeTimeOut: overtimeEnd || null,
            overtimeHours,
            totalHours,
            notes: notes || null,
            isHoliday: holidayInfo.isHoliday,
            holidayType: holidayInfo.holidayType,
            holidayName: holidayInfo.holidayName,
        });

        res.status(201).json({
            id: shift.id,
            employeeId: shift.employeeId,
            date: shift.date,
            morningTimeIn: shift.morningTimeIn,
            morningTimeOut: shift.morningTimeOut,
            morningHours: shift.morningHours,
            afternoonTimeIn: shift.afternoonTimeIn,
            afternoonTimeOut: shift.afternoonTimeOut,
            afternoonHours: shift.afternoonHours,
            overtimeTimeIn: shift.overtimeTimeIn,
            overtimeTimeOut: shift.overtimeTimeOut,
            overtimeHours: shift.overtimeHours,
            totalHours: shift.totalHours,
            notes: shift.notes,
            isHoliday: shift.isHoliday,
            holidayType: shift.holidayType,
            holidayName: shift.holidayName,
            isPaid: shift.isPaid,
            paidAt: shift.paidAt,
        });
    } catch (err) {
        console.error('Shift creation error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get shifts - for self or admin gets all
router.get('/', protect, async (req, res) => {
    try {
        let whereClause = {};

        // Admin can see all shifts, or filter by employeeId query param
        if (req.user.role === 'admin') {
            if (req.query.employeeId) {
                whereClause.employeeId = req.query.employeeId;
            }
        } else {
            whereClause.employeeId = req.user.id;
        }

        const shifts = await Shift.findAll({
            where: whereClause,
            order: [['date', 'DESC']]
        });
        res.json(shifts.map(s => ({
            id: s.id,
            employeeId: s.employeeId,
            date: s.date,
            morningTimeIn: s.morningTimeIn,
            morningTimeOut: s.morningTimeOut,
            morningHours: s.morningHours,
            afternoonTimeIn: s.afternoonTimeIn,
            afternoonTimeOut: s.afternoonTimeOut,
            afternoonHours: s.afternoonHours,
            overtimeTimeIn: s.overtimeTimeIn,
            overtimeTimeOut: s.overtimeTimeOut,
            overtimeHours: s.overtimeHours,
            totalHours: s.totalHours,
            notes: s.notes,
            isHoliday: s.isHoliday,
            holidayType: s.holidayType,
            holidayName: s.holidayName,
            isPaid: s.isPaid,
            paidAt: s.paidAt,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt
        })));
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update shift
router.put('/:id', protect, async (req, res) => {
    const { date, morningIn, morningOut, afternoonIn, afternoonOut, overtimeStart, overtimeEnd, notes } = req.body;

    try {
        const shift = await Shift.findByPk(req.params.id);

        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        // Check permission: owner or admin
        if (req.user.role !== 'admin' && shift.employeeId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this shift' });
        }

        // Check for duplicate date (excluding current shift)
        const existing = await Shift.findOne({
            where: {
                employeeId: shift.employeeId,
                date,
                id: { [Op.ne]: shift.id }
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'A shift for this day already exists.' });
        }

        // Validate that at least one shift period is provided
        if ((!morningIn || !morningOut) && (!afternoonIn || !afternoonOut)) {
            return res.status(400).json({ message: 'Please provide at least Morning or Afternoon shift times' });
        }

        const morningHours = calcHours(morningIn, morningOut);
        const afternoonHours = calcHours(afternoonIn, afternoonOut);
        const overtimeHours = calcHours(overtimeStart, overtimeEnd);
        const totalHours = morningHours + afternoonHours + overtimeHours;

        // Check if the date is a holiday
        const holidayInfo = await checkHoliday(date);

        shift.date = date;
        shift.morningTimeIn = morningIn || null;
        shift.morningTimeOut = morningOut || null;
        shift.morningHours = morningHours;
        shift.afternoonTimeIn = afternoonIn || null;
        shift.afternoonTimeOut = afternoonOut || null;
        shift.afternoonHours = afternoonHours;
        shift.overtimeTimeIn = overtimeStart || null;
        shift.overtimeTimeOut = overtimeEnd || null;
        shift.overtimeHours = overtimeHours;
        shift.totalHours = totalHours;
        shift.notes = notes || null;
        shift.isHoliday = holidayInfo.isHoliday;
        shift.holidayType = holidayInfo.holidayType;
        shift.holidayName = holidayInfo.holidayName;

        await shift.save();

        res.json({
            id: shift.id,
            employeeId: shift.employeeId,
            date: shift.date,
            morningTimeIn: shift.morningTimeIn,
            morningTimeOut: shift.morningTimeOut,
            morningHours: shift.morningHours,
            afternoonTimeIn: shift.afternoonTimeIn,
            afternoonTimeOut: shift.afternoonTimeOut,
            afternoonHours: shift.afternoonHours,
            overtimeTimeIn: shift.overtimeTimeIn,
            overtimeTimeOut: shift.overtimeTimeOut,
            overtimeHours: shift.overtimeHours,
            totalHours: shift.totalHours,
            notes: shift.notes,
            isHoliday: shift.isHoliday,
            holidayType: shift.holidayType,
            holidayName: shift.holidayName,
            isPaid: shift.isPaid,
            paidAt: shift.paidAt,
        });
    } catch (err) {
        console.error('Shift update error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete shift
router.delete('/:id', protect, async (req, res) => {
    try {
        const shift = await Shift.findByPk(req.params.id);

        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        // Check permission: owner or admin
        if (req.user.role !== 'admin' && shift.employeeId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this shift' });
        }

        await shift.destroy();
        res.json({ message: 'Shift deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
