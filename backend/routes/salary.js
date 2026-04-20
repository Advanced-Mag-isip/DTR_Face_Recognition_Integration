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
      attributes: ['id', 'firstName', 'lastName', 'employeeId', 'position', 'dailySalary', 'hourlyRate', 'monthlySalary', 'overtimeHourlyRate', 'department', 'paymentType']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const paymentType = user.paymentType || 'hourly';
    const hourlyRate = parseFloat(user.hourlyRate) || 0;
    const monthlySalary = parseFloat(user.monthlySalary) || 0;
    const dailySalary = parseFloat(user.dailySalary) || 0;

    if (paymentType === 'hourly' && hourlyRate <= 0 && dailySalary <= 0) {
      return res.status(400).json({
        message: 'Hourly rate not set for this employee',
        employee: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          employeeId: user.employeeId,
          position: user.position,
          paymentType
        }
      });
    }

    if (paymentType === 'monthly' && monthlySalary <= 0 && dailySalary <= 0) {
      return res.status(400).json({
        message: 'Monthly salary not set for this employee',
        employee: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          employeeId: user.employeeId,
          position: user.position,
          paymentType
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
      paymentType,
      hourlyRate,
      monthlySalary,
      user.overtimeHourlyRate && parseFloat(user.overtimeHourlyRate)
    );

    res.json({
      employee: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        employeeId: user.employeeId,
        position: user.position,
        department: user.department,
        paymentType
      },
      period: { startDate, endDate },
      shiftsCount: shifts.length,
      hourlyRate,
      monthlySalary,
      dailySalary,
      ...salaryData,
      breakdown: salaryData.breakdown
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
      attributes: ['id', 'firstName', 'lastName', 'employeeId', 'position', 'dailySalary', 'hourlyRate', 'monthlySalary', 'overtimeHourlyRate', 'department', 'paymentType']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const paymentType = user.paymentType || 'hourly';
    const hourlyRate = parseFloat(user.hourlyRate) || 0;
    const monthlySalary = parseFloat(user.monthlySalary) || 0;
    const dailySalary = parseFloat(user.dailySalary) || 0;

    if (paymentType === 'hourly' && hourlyRate <= 0 && dailySalary <= 0) {
      return res.status(400).json({
        message: 'Hourly rate not set for this employee',
        employee: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          employeeId: user.employeeId,
          position: user.position,
          paymentType
        }
      });
    }

    if (paymentType === 'monthly' && monthlySalary <= 0 && dailySalary <= 0) {
      return res.status(400).json({
        message: 'Monthly salary not set for this employee',
        employee: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          employeeId: user.employeeId,
          position: user.position,
          paymentType
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
      paymentType,
      hourlyRate,
      monthlySalary,
      user.overtimeHourlyRate && parseFloat(user.overtimeHourlyRate)
    );

    res.json({
      employee: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        employeeId: user.employeeId,
        position: user.position,
        department: user.department,
        paymentType
      },
      period: {
        startDate,
        endDate,
        month: now.toLocaleString('default', { month: 'long', year: 'numeric' })
      },
      shiftsCount: shifts.length,
      hourlyRate,
      monthlySalary,
      dailySalary,
      ...salaryData,
      breakdown: salaryData.breakdown
    });
  } catch (err) {
    console.error('Current month salary error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
