const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// GET /api/departments - Get all departments
router.get('/', async (req, res) => {
    try {
        const User = require('../models/User');
        const departments = await Department.findAll({
            order: [['name', 'ASC']]
        });

        // Count users for each department by matching department name (string field)
        const departmentsWithCount = await Promise.all(
            departments.map(async (dept) => {
                const userCount = await User.count({ where: { department: dept.name } });
                return {
                    ...dept.toJSON(),
                    userCount
                };
            })
        );

        res.json(departmentsWithCount);
    } catch (err) {
        console.error('Error fetching departments:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/departments - Create new department (admin only)
router.post('/', admin, async (req, res) => {
    const { name, description } = req.body;

    try {
        // Check if department already exists
        const existing = await Department.findOne({ where: { name: name.trim() } });
        if (existing) {
            return res.status(400).json({ message: 'Department with this name already exists' });
        }

        const department = await Department.create({
            name: name.trim(),
            description: description?.trim() || null
        });

        res.status(201).json(department);
    } catch (err) {
        console.error('Error creating department:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT /api/departments/:id - Update department (admin only)
router.put('/:id', admin, async (req, res) => {
    const { name, description, isActive } = req.body;

    try {
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Check for duplicate name if name is being changed
        if (name && name.trim() !== department.name) {
            const existing = await Department.findOne({
                where: {
                    name: name.trim(),
                    id: { [require('sequelize').Op.ne]: req.params.id }
                }
            });
            if (existing) {
                return res.status(400).json({ message: 'Department with this name already exists' });
            }
        }

        department.name = name?.trim() || department.name;
        department.description = description?.trim() !== undefined ? description.trim() : department.description;
        department.isActive = isActive !== undefined ? isActive : department.isActive;

        await department.save();
        res.json(department);
    } catch (err) {
        console.error('Error updating department:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /api/departments/:id - Hard delete department (admin only)
router.delete('/:id', admin, async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Check if department has users (matching by department name string field)
        const User = require('../models/User');
        const userCount = await User.count({ where: { department: department.name } });
        if (userCount > 0) {
            return res.status(400).json({
                message: `Cannot delete department with ${userCount} employee(s). Please reassign or remove employees first.`
            });
        }

        // Hard delete the department
        await department.destroy();

        res.json({ message: 'Department deleted successfully' });
    } catch (err) {
        console.error('Error deleting department:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
