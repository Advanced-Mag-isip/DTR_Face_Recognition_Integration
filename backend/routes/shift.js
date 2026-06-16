const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const User = require('../models/User');
const Holiday = require('../models/Holiday');
const { Op } = require('sequelize');
const { protect, admin } = require('../middleware/authMiddleware');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
    const { date, morningIn, morningOut, afternoonIn, afternoonOut, overtimeStart, overtimeEnd, employeeId, notes, faceVerified } = req.body;



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
        if (!morningIn && !afternoonIn && !overtimeStart) {
            return res.status(400).json({ message: 'Please provide at least one shift period' });
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
            faceVerified: faceVerified || false
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
            faceVerified: shift.faceVerified,
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
            faceVerified: s.faceVerified,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt
        })));
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update shift
router.put('/:id', protect, async (req, res) => {
    const { date, morningIn, morningOut, afternoonIn, afternoonOut, overtimeStart, overtimeEnd, notes, faceVerified } = req.body;

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
        if (!morningIn && !afternoonIn && !overtimeStart) {
            return res.status(400).json({ message: 'Please provide at least one time entry' });
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
        shift.faceVerified = faceVerified || false;
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
            faceVerified: shift.faceVerified,
        });
    } catch (err) {
        console.error('Shift update error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/verify-face', protect, async (req, res) => {
  try {
    const { liveImage } = req.body;

    if (!liveImage) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (!user.facePhoto) {
      return res.status(400).json({
        error: 'No reference photo enrolled. Please contact your admin.'
      });
    }

    const refPath = path.resolve(__dirname, '..', 'storage', 'faces', path.basename(user.facePhoto));
    if (!fs.existsSync(refPath)) {
      return res.status(400).json({
        error: 'Reference photo missing from server. Please re-enroll.'
      });
    }

    const base64Data = liveImage.replace(/^data:image\/\w+;base64,/, '');
    const tempFilename = `selfie_${req.user.id}_${Date.now()}.jpg`;
    const tempPath = path.join(__dirname, '../storage/temp/', tempFilename);
    fs.writeFileSync(tempPath, Buffer.from(base64Data, 'base64'));

    const response = await axios.post('http://localhost:5001/verify', {
      live_path: tempPath,
      ref_path: refPath,
    });

    const { verified, similarity_score, error } = response.data;

    // 4. Return result to frontend
    res.json({
      verified: verified ?? false,
      similarity_score: similarity_score ?? null,
      error: error ?? null,
    });

  } catch (err) {
    console.error('Verify face error:', err.message);
    res.status(500).json({ error: 'Face verification failed' });
  }
});

// POST /api/shifts/kiosk-clock
router.post('/kiosk-clock', async (req, res) => {
  try {
    const { liveImage, livenessAction } = req.body;
    if (!liveImage) return res.status(400).json({ error: 'No image frame captured.' });

    // 1. Save kiosk webcam capture frame to temp folder
    const tempFilename = `kiosk_${Date.now()}.jpg`;
    const tempPath = path.join(__dirname, '../storage/temp/', tempFilename);
    const base64Data = liveImage.replace(/^data:image\/\w+;base64,/, '');
    
    // Ensure directories exist
    fs.mkdirSync(path.dirname(tempPath), { recursive: true });
    fs.writeFileSync(tempPath, Buffer.from(base64Data, 'base64'));

    // 2. Call the Python /identify endpoint matrix (1:N search loop)
    const response = await axios.post('http://localhost:5001/identify', {
      live_path: tempPath,
    });

    const { verified, employeeId, error } = response.data;

    if (!verified) {
      // NOTE: File deletion line commented out to preserve snapshots for audit logs as requested
      // if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return res.status(401).json({ error: error || 'Biometric recognition match refused.' });
    }

    // 3. Look up employee inside MySQL using the identified primary key value
    const user = await User.findByPk(employeeId); 
    if (!user) {
      // if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return res.status(404).json({ error: 'Identified database user record not found.' });
    }

    // 4. Track local date and time parameters configuration
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5); // "HH:MM"
    const today = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const hour = now.getHours();

    const isMorning = hour < 12;
    const isAfternoon = hour >= 12 && hour < 18;
    const isOvertime = hour >= 18;

    let shift = await Shift.findOne({ where: { employeeId: user.id, date: today } });
    const action = livenessAction || 'in';
    const holidayInfo = await checkHoliday(today);

    if (action === 'in') {
      if (isMorning) {
        // GUARD: Block double morning check-ins
        if (shift && shift.morningTimeIn) {
          return res.status(400).json({ error: 'You have already timed in for the morning shift today.' });
        }
        
        if (shift) {
          await shift.update({ morningTimeIn: timeStr, faceVerified: true });
        } else {
          await Shift.create({ employeeId: user.id, date: today, morningTimeIn: timeStr, totalHours: 0, isHoliday: holidayInfo.isHoliday, faceVerified: true });
        }
      } 
      
      else if (isAfternoon) {
        // GUARD: Block double afternoon check-ins
        if (shift && shift.afternoonTimeIn) {
          return res.status(400).json({ error: 'You have already timed in for the afternoon shift today.' });
        }

        if (shift) {
          await shift.update({ afternoonTimeIn: timeStr, faceVerified: true });
        } else {
          await Shift.create({ employeeId: user.id, date: today, afternoonTimeIn: timeStr, totalHours: 0, isHoliday: holidayInfo.isHoliday, faceVerified: true });
        }
      } 
      
      else if (isOvertime) {
        // GUARD: Block double overtime check-ins
        if (shift && shift.overtimeTimeIn) {
          return res.status(400).json({ error: 'You have already timed in for overtime tonight.' });
        }

        if (shift) {
          await shift.update({ overtimeTimeIn: timeStr, faceVerified: true });
        } else {
          await Shift.create({ employeeId: user.id, date: today, overtimeTimeIn: timeStr, totalHours: 0, isHoliday: holidayInfo.isHoliday, faceVerified: true });
        }
      }
    } 
    
    else if (action === 'out') {
      // GUARD: Must have an entry row for today to register a out stamp
      if (!shift) {
        return res.status(400).json({ error: 'No active work record found for today. Please Time In first.' });
      }

      let updateFields = { faceVerified: true };

      if (isMorning) {
        // GUARD: Must have typed in to type out
        if (!shift.morningTimeIn) {
          return res.status(400).json({ error: 'Cannot Time Out. You never timed in this morning.' });
        }
        // GUARD: Block duplicate out clicks
        if (shift.morningTimeOut) {
          return res.status(400).json({ error: 'You have already timed out for the morning shift today.' });
        }
        updateFields.morningTimeOut = timeStr;
        updateFields.morningHours = calcHours(shift.morningTimeIn, timeStr);
      } 
      
      else if (isAfternoon) {
        // GUARD: Must have an afternoon in stamp
        if (!shift.afternoonTimeIn) {
          return res.status(400).json({ error: 'Cannot Time Out. You never timed in this afternoon.' });
        }
        // GUARD: Block duplicate out clicks
        if (shift.afternoonTimeOut) {
          return res.status(400).json({ error: 'You have already timed out for the afternoon shift today.' });
        }
        updateFields.afternoonTimeOut = timeStr;
        updateFields.afternoonHours = calcHours(shift.afternoonTimeIn, timeStr);
      } 
      
      else if (isOvertime) {
        const otIn = shift.overtimeTimeIn || shift.overtimeStart;
        // GUARD: Must have an overtime check in stamp
        if (!otIn) {
          return res.status(400).json({ error: 'Cannot Time Out. You never timed in for overtime tonight.' });
        }
        // GUARD: Block duplicate out clicks
        if (shift.overtimeTimeOut) {
          return res.status(400).json({ error: 'You have already timed out for your overtime shift tonight.' });
        }
        updateFields.overtimeTimeOut = timeStr;
        updateFields.overtimeHours = calcHours(otIn, timeStr);
      }

      await shift.update(updateFields);
      
      // Recalculate runtime aggregated total hours column cleanly
      const freshShift = await Shift.findByPk(shift.id);
      const totalHours = (freshShift.morningHours || 0) + (freshShift.afternoonHours || 0) + (freshShift.overtimeHours || 0);
      await freshShift.update({ totalHours });
    }

    //NOTE: File deletion step removed here as well to permanently save your temp selfies!
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    return res.json({
      success: true,
      employeeName: user.name || user.firstName || user.username || 'Employee', 
      message: `Successfully recorded Time-${action.toUpperCase()} transaction.`
    });

  } catch (err) {
    console.error('Kiosk route error:', err);
    res.status(500).json({ error: 'Internal Kiosk Bridge Server Error Processing Request.' });
  }
});

// // Delete shift
// router.delete('/:id', protect, async (req, res) => {
//     try {
//         const shift = await Shift.findByPk(req.params.id);

//         if (!shift) {
//             return res.status(404).json({ message: 'Shift not found' });
//         }

//         // Check permission: owner or admin
//         if (req.user.role !== 'admin' && shift.employeeId !== req.user.id) {
//             return res.status(403).json({ message: 'Not authorized to delete this shift' });
//         }

//         await shift.destroy();
//         res.json({ message: 'Shift deleted successfully' });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error', error: err.message });
//     }
// });




router.delete('/:id', protect, async (req, res) => {
    try {
        const shift = await Shift.findByPk(req.params.id);
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        // ✅ LOOSE TYPE EQUALITY COMPARISON (Handles integer database IDs vs string employee IDs smoothly)
        const isOwner = shift.employeeId == req.user.id || shift.employeeId == req.user.employeeId;
        const isAdmin = req.user.role === 'admin';

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to delete this shift' });
        }

        await shift.destroy();
        res.json({ message: 'Shift deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
