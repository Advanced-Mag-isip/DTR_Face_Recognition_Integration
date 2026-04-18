const express = require('express');
const router = express.Router();
const Holiday = require('../models/Holiday');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all holidays (with optional date range filter)
router.get('/', protect, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let whereClause = {};
        if (startDate && endDate) {
            whereClause.date = {
                [require('sequelize').Op.between]: [startDate, endDate]
            };
        }
        
        const holidays = await Holiday.findAll({
            where: whereClause,
            order: [['date', 'ASC']]
        });
        
        res.json(holidays.map(h => ({
            id: h.id,
            name: h.name,
            date: h.date,
            type: h.type,
            description: h.description,
            createdAt: h.createdAt,
            updatedAt: h.updatedAt
        })));
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get single holiday by date
router.get('/check/:date', protect, async (req, res) => {
    try {
        const holiday = await Holiday.findOne({
            where: { date: req.params.date }
        });
        
        if (holiday) {
            res.json({
                isHoliday: true,
                name: holiday.name,
                type: holiday.type,
                displayName: getHolidayDisplayName(holiday.type)
            });
        } else {
            res.json({
                isHoliday: false,
                name: null,
                type: null,
                displayName: null
            });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Create holiday (admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, date, type, description } = req.body;
        
        // Validate required fields
        if (!name || !date || !type) {
            return res.status(400).json({ message: 'Name, date, and type are required' });
        }
        
        // Check if holiday already exists for this date
        const existing = await Holiday.findOne({ where: { date } });
        if (existing) {
            return res.status(400).json({ message: 'A holiday already exists for this date' });
        }
        
        const holiday = await Holiday.create({
            name,
            date,
            type,
            description: description || null
        });
        
        res.status(201).json({
            id: holiday.id,
            name: holiday.name,
            date: holiday.date,
            type: holiday.type,
            description: holiday.description,
            createdAt: holiday.createdAt,
            updatedAt: holiday.updatedAt
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update holiday (admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, date, type, description } = req.body;
        
        const holiday = await Holiday.findByPk(req.params.id);
        if (!holiday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }
        
        // Check if new date conflicts with another holiday
        if (date && date !== holiday.date) {
            const existing = await Holiday.findOne({
                where: {
                    date,
                    id: { [require('sequelize').Op.ne]: req.params.id }
                }
            });
            if (existing) {
                return res.status(400).json({ message: 'A holiday already exists for this date' });
            }
        }
        
        holiday.name = name || holiday.name;
        holiday.date = date || holiday.date;
        holiday.type = type || holiday.type;
        holiday.description = description !== undefined ? description : holiday.description;
        
        await holiday.save();
        
        res.json({
            id: holiday.id,
            name: holiday.name,
            date: holiday.date,
            type: holiday.type,
            description: holiday.description,
            createdAt: holiday.createdAt,
            updatedAt: holiday.updatedAt
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete holiday (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const holiday = await Holiday.findByPk(req.params.id);
        if (!holiday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }
        
        await holiday.destroy();
        res.json({ message: 'Holiday deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Helper function to get display name for holiday type
function getHolidayDisplayName(type) {
    switch (type) {
        case 'regular':
            return 'Regular Holiday';
        case 'special_non_working':
            return 'Special Non-Working Holiday';
        case 'special_working':
            return 'Special Working Holiday';
        default:
            return null;
    }
}

module.exports = router;
