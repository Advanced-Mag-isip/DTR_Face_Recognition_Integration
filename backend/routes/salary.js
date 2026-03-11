const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Shift = require('../models/Shift');
const User = require('../models/User');
const { calculateMonthlySalary } = require('../utils/salaryCalculator');
const { protect } = require('../middleware/authMiddleware');

/**
 * GET /api/salary/compute
 * Compute salary for a given period
 * Query params: startDate, endDate, employeeId (admin only)
 */
router.get('/compute', protect, async (req, res) => {
  const { startDate, endDate, employeeId } = req.query;
  
  try {
    // Admin can view any employee, employees can only view their own
    const targetId = (req.user.role === 'admin' && employeeId) ? employeeId : req.user.id;
    
    const user = await User.findByPk(targetId, {
      attributes: ['id', 'firstName', 'lastName', 'employeeId', 'position', 'monthlySalary', 'overtimeHourlyRate', 'department']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.monthlySalary || user.monthlySalary <= 0) {
      return res.status(400).json({ 
        message: 'Monthly salary not set for this employee',
        employee: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          employeeId: user.employeeId,
          position: user.position
        }
      });
    }
    
    // Build date range filter
    const whereClause = { employeeId: targetId };
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      whereClause.date = { [Op.gte]: startDate };
    } else if (endDate) {
      whereClause.date = { [Op.lte]: endDate };
    }
    
    const shifts = await Shift.findAll({
      where: whereClause,
      order: [['date', 'DESC']]
    });
    
    const salaryData = calculateMonthlySalary(
      shifts, 
      parseFloat(user.monthlySalary), 
      user.overtimeHourlyRate && parseFloat(user.overtimeHourlyRate)
    );
    
    res.json({
      employee: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        employeeId: user.employeeId,
        position: user.position,
        department: user.department
      },
      period: { startDate, endDate },
      shiftsCount: shifts.length,
      ...salaryData
    });
  } catch (err) {
    console.error('Salary computation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * GET /api/salary/current-month
 * Get salary for current month
 */
router.get('/current-month', protect, async (req, res) => {
  const { employeeId } = req.query;
  
  try {
    const targetId = (req.user.role === 'admin' && employeeId) ? employeeId : req.user.id;
    
    const user = await User.findByPk(targetId, {
      attributes: ['id', 'firstName', 'lastName', 'employeeId', 'position', 'monthlySalary', 'overtimeHourlyRate', 'department']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.monthlySalary || user.monthlySalary <= 0) {
      return res.status(400).json({ 
        message: 'Monthly salary not set for this employee',
        employee: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          employeeId: user.employeeId,
          position: user.position
        }
      });
    }
    
    // Get current month range
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    
    const shifts = await Shift.findAll({
      where: {
        employeeId: targetId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'DESC']]
    });
    
    const salaryData = calculateMonthlySalary(
      shifts, 
      parseFloat(user.monthlySalary), 
      user.overtimeHourlyRate && parseFloat(user.overtimeHourlyRate)
    );
    
    res.json({
      employee: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        employeeId: user.employeeId,
        position: user.position,
        department: user.department
      },
      period: { 
        startDate, 
        endDate,
        month: now.toLocaleString('default', { month: 'long', year: 'numeric' })
      },
      shiftsCount: shifts.length,
      ...salaryData
    });
  } catch (err) {
    console.error('Current month salary error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
