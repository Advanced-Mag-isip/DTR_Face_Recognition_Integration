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

/**
 * POST /api/salary/pay
 * Mark shifts as paid (batch)
 * Body: { employeeId, shiftIds[], payPeriod: 'first' | 'second' }
 */
router.post('/pay', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { employeeId, shiftIds, payPeriod, startDate, endDate } = req.body;

  try {
    const targetId = employeeId;
    const user = await User.findByPk(targetId, {
      attributes: ['id', 'firstName', 'lastName', 'employeeId', 'position', 'paymentType', 'hourlyRate', 'monthlySalary', 'dailySalary', 'overtimeHourlyRate']
    });

    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const hourlyRate = parseFloat(user.hourlyRate) || 0;
    const monthlySalary = parseFloat(user.monthlySalary) || 0;
    const dailySalary = parseFloat(user.dailySalary) || 0;
    const paymentType = user.paymentType || 'hourly';

    let whereClause = { employeeId: targetId, isPaid: false };

    if (shiftIds && shiftIds.length > 0) {
      whereClause.id = { [Op.in]: shiftIds };
    } else if (startDate && endDate) {
      whereClause.date = { [Op.between]: [startDate, endDate] };
    } else if (payPeriod) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);

      if (payPeriod === 'first') {
        whereClause.date = {
          [Op.between]: [
            monthStart.toISOString().split('T')[0],
            new Date(year, month, 15).toISOString().split('T')[0]
          ]
        };
      } else if (payPeriod === 'monthly') {
        whereClause.date = {
          [Op.between]: [
            monthStart.toISOString().split('T')[0],
            monthEnd.toISOString().split('T')[0]
          ]
        };
      } else {
        whereClause.date = {
          [Op.between]: [
            new Date(year, month, 16).toISOString().split('T')[0],
            monthEnd.toISOString().split('T')[0]
          ]
        };
      }
    }

    const shifts = await Shift.findAll({ where: whereClause });

    const totalShifts = shifts.length;
    let totalAmount = 0;

    if (paymentType === 'monthly' && monthlySalary > 0) {
      // Use calculator to get OT and Holiday premiums
      const salaryData = calculateMonthlySalary(
        shifts,
        paymentType,
        hourlyRate,
        monthlySalary,
        user.overtimeHourlyRate && parseFloat(user.overtimeHourlyRate)
      );
      
      let baseAmount = monthlySalary;
      if (payPeriod === 'first' || payPeriod === 'second') {
        baseAmount = monthlySalary / 2;
      }
      
      // Amount is at least baseAmount for the period, plus any OT/Holidays from shifts
      totalAmount = Math.max(baseAmount, salaryData.baseSalary) + salaryData.totalHolidayPremium + salaryData.overtimePay;
    } else if (totalShifts === 0) {
      return res.status(400).json({ message: 'No unpaid shifts found for the selected period' });
    } else if (hourlyRate > 0) {
      shifts.forEach(shift => {
        const regularHours = (shift.morningHours || 0) + (shift.afternoonHours || 0);
        const overtimeHours = shift.overtimeHours || 0;
        const otRate = user.overtimeHourlyRate ? parseFloat(user.overtimeHourlyRate) : hourlyRate;
        totalAmount += (regularHours * hourlyRate) + (overtimeHours * otRate);
      });
    } else if (dailySalary > 0) {
      totalAmount = shifts.length * dailySalary;
    }

    const paidAt = new Date().toISOString();

    // Update shifts if any
    if (totalShifts > 0) {
      await Shift.update(
        { isPaid: true, paidAt },
        { where: whereClause }
      );
    }

    // For monthly employees, also update payrollNotes
    if (paymentType === 'monthly') {
      try {
        const currentMonth = startDate ? startDate.slice(0, 7) : new Date().toISOString().slice(0, 7);
        const periodKey = `${payPeriod}-${currentMonth}`;
        let notes = {};
        try {
          notes = user.payrollNotes ? (typeof user.payrollNotes === 'string' ? JSON.parse(user.payrollNotes) : user.payrollNotes) : {};
        } catch (e) { notes = {}; }
        
        notes[periodKey] = 'PAID';
        await user.update({ payrollNotes: JSON.stringify(notes) });
      } catch (noteErr) {
        console.error('Failed to update payroll notes:', noteErr);
      }
    }

    res.json({
      message: `Successfully processed payment for ${user.firstName}`,
      paidCount: totalShifts,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      payPeriod,
      paidAt,
      employee: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        employeeId: user.employeeId,
        paymentType
      }
    });
  } catch (err) {
    console.error('Pay salary error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * GET /api/salary/unpaid
 * Get unpaid shifts for an employee
 * Query: employeeId, payPeriod (first/second), month (YYYY-MM)
 */
router.get('/unpaid', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { employeeId, payPeriod, month } = req.query;

  try {
    const targetId = employeeId;
    const user = await User.findByPk(targetId, {
      attributes: ['id', 'firstName', 'lastName', 'employeeId', 'position', 'paymentType', 'hourlyRate', 'monthlySalary', 'dailySalary', 'overtimeHourlyRate']
    });

    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    let whereClause = { employeeId: targetId, isPaid: false };

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const monthStart = new Date(year, monthNum - 1, 1);
      const monthEnd = new Date(year, monthNum, 0);

      if (payPeriod === 'first') {
        whereClause.date = {
          [Op.between]: [
            monthStart.toISOString().split('T')[0],
            new Date(year, monthNum - 1, 15).toISOString().split('T')[0]
          ]
        };
      } else if (payPeriod === 'monthly') {
        whereClause.date = {
          [Op.between]: [
            monthStart.toISOString().split('T')[0],
            monthEnd.toISOString().split('T')[0]
          ]
        };
      } else if (payPeriod === 'second') {
        whereClause.date = {
          [Op.between]: [
            new Date(year, monthNum - 1, 16).toISOString().split('T')[0],
            monthEnd.toISOString().split('T')[0]
          ]
        };
      } else {
        whereClause.date = {
          [Op.between]: [
            monthStart.toISOString().split('T')[0],
            monthEnd.toISOString().split('T')[0]
          ]
        };
      }
    }

    const shifts = await Shift.findAll({
      where: whereClause,
      order: [['date', 'DESC']]
    });

    const hourlyRate = parseFloat(user.hourlyRate) || 0;
    const monthlySalary = parseFloat(user.monthlySalary) || 0;
    const dailySalary = parseFloat(user.dailySalary) || 0;
    const paymentType = user.paymentType || 'hourly';

    let totalAmount = 0;
    if (paymentType === 'monthly' && monthlySalary > 0) {
      // Use calculator to get OT and Holiday premiums
      const salaryData = calculateMonthlySalary(
        shifts,
        paymentType,
        hourlyRate,
        monthlySalary,
        user.overtimeHourlyRate && parseFloat(user.overtimeHourlyRate)
      );
      
      let baseAmount = monthlySalary;
      if (payPeriod === 'first' || payPeriod === 'second') {
        baseAmount = monthlySalary / 2;
      } else if (payPeriod === 'monthly') {
        baseAmount = monthlySalary;
      }
      
      // Amount is at least baseAmount for the period, plus any OT/Holidays from shifts
      totalAmount = Math.max(baseAmount, salaryData.baseSalary) + salaryData.totalHolidayPremium + salaryData.overtimePay;
    } else if (hourlyRate > 0) {
      shifts.forEach(shift => {
        const regularHours = (shift.morningHours || 0) + (shift.afternoonHours || 0);
        const overtimeHours = shift.overtimeHours || 0;
        const otRate = user.overtimeHourlyRate ? parseFloat(user.overtimeHourlyRate) : hourlyRate;
        totalAmount += (regularHours * hourlyRate) + (overtimeHours * otRate);
      });
    } else if (dailySalary > 0) {
      totalAmount = shifts.length * dailySalary;
    }

    res.json({
      employee: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        employeeId: user.employeeId,
        position: user.position,
        paymentType,
        hourlyRate,
        monthlySalary,
        dailySalary
      },
      shifts,
      unpaidCount: shifts.length,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      payPeriod,
      month
    });
  } catch (err) {
    console.error('Get unpaid shifts error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
