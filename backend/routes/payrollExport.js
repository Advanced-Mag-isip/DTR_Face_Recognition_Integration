const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const User = require('../models/User');
const { Op } = require('sequelize');
const { calculateMonthlySalary } = require('../utils/salaryCalculator');


const requireApiKey = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== process.env.PAYROLL_API_KEY) {
    return res.status(401).json({ message: 'Invalid API key' });
  }
  next();
};

// GET /api/payroll-export/timesheet?start=2026-06-01&end=2026-06-15
router.get('/timesheet', requireApiKey, async (req, res) => {
  const { start, end, employeeId } = req.query;

  if (!start || !end) {
    return res.status(400).json({ message: 'start and end dates required' });
  }

  try {
    const whereClause = {
      date: { [Op.between]: [start, end] }
    };

    // employeeId here is Users.id (integer), not the string employeeId
    if (employeeId) whereClause.employeeId = employeeId;

    const shifts = await Shift.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'employee',
        attributes: [
          'id',
          'employeeId',       // the string like "EMP-001"
          'firstName',
          'lastName',
          'department',
          'position',
          'paymentType',      // 'hourly' or 'monthly'
          'hourlyRate',
          'dailySalary',
          'monthlySalary',
          'overtimeHourlyRate',
          'paymentMethod',
        ]
      }],
      order: [['date', 'ASC']]
    });

    const formatted = shifts.map(s => ({
      // Worker info
      shiftId: s.id,
      workerId: s.employee.id,              // integer id
      workerEmployeeId: s.employee.employeeId,  // string "EMP-001"
      workerName: `${s.employee.firstName} ${s.employee.lastName}`,
      department: s.employee.department,
      position: s.employee.position,
      paymentType: s.employee.paymentType,
      hourlyRate: s.employee.hourlyRate,
      dailySalary: s.employee.dailySalary,
      monthlySalary: s.employee.monthlySalary,
      overtimeHourlyRate: s.employee.overtimeHourlyRate,
      paymentMethod: s.employee.paymentMethod,

      // Shift info
      date: s.date,
      morningTimeIn: s.morningTimeIn,
      morningTimeOut: s.morningTimeOut,
      morningHours: s.morningHours || 0,
      afternoonTimeIn: s.afternoonTimeIn,
      afternoonTimeOut: s.afternoonTimeOut,
      afternoonHours: s.afternoonHours || 0,
      overtimeTimeIn: s.overtimeTimeIn,
      overtimeTimeOut: s.overtimeTimeOut,
      overtimeHours: s.overtimeHours || 0,
      totalHours: s.totalHours || 0,
      isHoliday: s.isHoliday,
      holidayType: s.holidayType,       // 'regular', 'special_non_working', 'special_working'
      holidayName: s.holidayName,
      faceVerified: s.faceVerified,
      isPaid: s.isPaid,
      paidAt: s.paidAt,
    }));

    res.json({ count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/payroll-export/workers
router.get('/workers', requireApiKey, async (req, res) => {
  try {
    const workers = await User.findAll({
      where: { role: 'employee', isActive: true },
      attributes: [
        'id',
        'employeeId',
        'firstName',
        'lastName',
        'department',
        'position',
        'paymentType',
        'hourlyRate',
        'dailySalary',
        'monthlySalary',
        'overtimeHourlyRate',
        'paymentMethod',
      ]
    });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// GET /api/payroll-export/salary?employeeId=&start=&end=
router.get('/salary', requireApiKey, async (req, res) => {
  const { employeeId, start, end } = req.query;

  if (!employeeId || !start || !end) {
    return res.status(400).json({ message: 'employeeId, start, end required' });
  }

  try {
    const user = await User.findByPk(employeeId, {
      attributes: ['id', 'firstName', 'lastName', 'employeeId',
                   'hourlyRate', 'monthlySalary', 'dailySalary',
                   'overtimeHourlyRate', 'paymentType']
    });

    if (!user) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const shifts = await Shift.findAll({
      where: {
        employeeId,
        date: { [Op.between]: [start, end] }
      }
    });

    if (shifts.length === 0) {
      return res.json({
        employee: {
          id: user.id,
          employeeId: user.employeeId,
          name: `${user.firstName} ${user.lastName}`,
        },
        shiftsCount: 0,
        grossPay: 0,
        breakdown: null
      });
    }

    const salaryData = calculateMonthlySalary(
      shifts,
      user.paymentType || 'hourly',
      parseFloat(user.hourlyRate) || 0,
      parseFloat(user.monthlySalary) || 0,
      parseFloat(user.overtimeHourlyRate) || 0
    );

    res.json({
      employee: {
        id: user.id,
        employeeId: user.employeeId,
        name: `${user.firstName} ${user.lastName}`,
        paymentType: user.paymentType,
      },
      shiftsCount: shifts.length,
      ...salaryData
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/mark-paid', requireApiKey, async (req, res) => {
  const { shiftIds } = req.body;
  if (!Array.isArray(shiftIds) || shiftIds.length === 0) {
    return res.status(400).json({ message: 'shiftIds array required' });
  }
  try {
    const [updatedCount] = await Shift.update(
      { isPaid: true, paidAt: new Date().toISOString() },
      { where: { id: { [Op.in]: shiftIds } } }
    );
    res.json({ 
      message: `${updatedCount} shifts marked as paid`,
      updatedCount,
      shiftIds
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/payroll-export/workers/:id
router.put('/workers/:id', requireApiKey, async (req, res) => {
  const { hourlyRate, dailySalary, monthlySalary, overtimeHourlyRate, paymentType } = req.body;

  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    if (hourlyRate !== undefined) user.hourlyRate = hourlyRate;
    if (dailySalary !== undefined) user.dailySalary = dailySalary;
    if (monthlySalary !== undefined) user.monthlySalary = monthlySalary;
    if (overtimeHourlyRate !== undefined) user.overtimeHourlyRate = overtimeHourlyRate;
    if (paymentType !== undefined) user.paymentType = paymentType;

    await user.save();

    res.json({
      message: 'Worker rates updated successfully',
      worker: {
        id: user.id,
        employeeId: user.employeeId,
        firstName: user.firstName,
        lastName: user.lastName,
        hourlyRate: user.hourlyRate,
        dailySalary: user.dailySalary,
        monthlySalary: user.monthlySalary,
        overtimeHourlyRate: user.overtimeHourlyRate,
        paymentType: user.paymentType,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;