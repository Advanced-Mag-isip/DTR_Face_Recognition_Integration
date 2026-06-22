const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Shift = require('../models/Shift');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../storage/faces/'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${req.params.id}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Images only'));
  }
});

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
            facePhoto: u.facePhoto ? true : false,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt
        })));
    } catch (err) {
        console.error('CREATE USER ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
    }
});

// Create new user (admin only)
router.post('/', protect, admin, async (req, res) => {
    const { employeeId, password, firstName, lastName, role, department, isActive, position, dailySalary, hourlyRate, monthlySalary, overtimeHourlyRate, paymentType, paymentMethod, paymentDetails } = req.body;

    try {
        const prefix = role === 'admin' ? 'ADMIN' : 'EMP';

        // Auto-generate employeeId if not provided or empty
        let generatedEmployeeId = employeeId && employeeId.trim() !== '' 
            ? employeeId.trim() 
            : null;

        if (!generatedEmployeeId) {
            // Find highest number among all users of this role
            const allUsers = await User.findAll({ where: { role } });
            let highestNum = 0;
            allUsers.forEach(u => {
                if (!u.employeeId) return;
                const match = u.employeeId.match(/(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > highestNum) highestNum = num;
                }
            });
            generatedEmployeeId = `${prefix}-${String(highestNum + 1).padStart(3, '0')}`;
        } else {
            // Check if provided ID already exists
            const existingUser = await User.findOne({ 
                where: { employeeId: generatedEmployeeId } 
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Employee ID already exists' });
            }
        }

        // Default password = employeeId if not provided
        const finalPassword = (password && password.trim() !== '') 
            ? password.trim() 
            : generatedEmployeeId;

        const user = await User.create({
            employeeId: generatedEmployeeId,
            password: finalPassword,
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
        console.error('CREATE USER ERROR:', err);
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
        const idToDelete = req.params.id;
        const user = await User.findByPk(idToDelete);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is trying to delete themselves
        if (parseInt(idToDelete) === parseInt(req.user.id)) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Shifts are deleted via CASCADE, but we can do it manually for extra safety
        // if we want to follow user's request explicitly
        await Shift.destroy({ where: { employeeId: idToDelete } });

        await user.destroy();

        res.json({ message: 'User and all associated records deleted successfully' });
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

// POST /api/users/:id/enroll-face (admin only)
router.post('/:id/enroll-face',
  protect,
  admin,
  upload.single('facePhoto'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No photo uploaded' });
      }

      // Delete old photo if exists
      if (user.facePhoto && fs.existsSync(user.facePhoto)) {
        fs.unlinkSync(user.facePhoto);
      }

      // Store relative path
      const photoPath = `backend/storage/faces/${req.file.filename}`;
      await user.update({ facePhoto: photoPath });

      res.json({
        message: 'Face enrolled successfully',
        employeeId: user.employeeId,
        faceEnrolled: true,
      });

    } catch (err) {
      console.error('Enroll error:', err);
      res.status(500).json({ message: 'Enroll failed', error: err.message });
    }
  }
);

// DELETE /api/users/:id/enroll-face (admin only) — remove reference photo
router.delete('/:id/enroll-face',
  protect,
  admin,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      if (user.facePhoto && fs.existsSync(user.facePhoto)) {
        fs.unlinkSync(user.facePhoto);
      }

      await user.update({ facePhoto: null });

      res.json({ message: 'Face photo removed successfully' });

    } catch (err) {
      console.error('Remove face error:', err);
      res.status(500).json({ message: 'Remove failed', error: err.message });
    }
  }
);

module.exports = router;
