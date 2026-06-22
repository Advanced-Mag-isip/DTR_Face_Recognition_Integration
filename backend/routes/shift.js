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

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || 'http://localhost:5001';

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

// Helper function to determine next action - UPDATE TIME-OUT ON REPEATED SCAN
const determineNextAction = (shift, timeContext) => {
  const { isMorning, isAfternoon, isOvertime, hour } = timeContext;
  
  // If no shift exists yet, start with the appropriate shift based on time
  if (!shift) {
    if (isMorning) return { action: 'in', field: 'morningTimeIn', period: 'Morning' };
    if (isAfternoon) return { action: 'in', field: 'afternoonTimeIn', period: 'Afternoon' };
    if (isOvertime) return { action: 'in', field: 'overtimeTimeIn', period: 'Overtime' };
    return { action: 'unknown', field: null, period: null };
  }

  if (isMorning) {
    // If morning in is missing, allow morning in
    if (!shift.morningTimeIn) {
      return { action: 'in', field: 'morningTimeIn', period: 'Morning' };
    }
    // If morning in exists but no out, allow morning out
    if (shift.morningTimeIn && !shift.morningTimeOut) {
      return { action: 'out', field: 'morningTimeOut', period: 'Morning' };
    }
    // Morning is complete (both in and out exist)
    // If they scan again in morning, UPDATE the time-out
    if (shift.morningTimeIn && shift.morningTimeOut) {
      // Check if afternoon is available
      if (!shift.afternoonTimeIn) {
        // Allow starting afternoon early
        if (hour >= 11) {
          return { action: 'in', field: 'afternoonTimeIn', period: 'Afternoon' };
        }
        // Still morning - UPDATE the morning time-out
        return { action: 'update_out', field: 'morningTimeOut', period: 'Morning' };
      }
      // If afternoon in exists but no out, allow afternoon out
      if (shift.afternoonTimeIn && !shift.afternoonTimeOut) {
        return { action: 'out', field: 'afternoonTimeOut', period: 'Afternoon' };
      }
      // Afternoon is complete, check overtime
      if (shift.afternoonTimeIn && shift.afternoonTimeOut) {
        if (!shift.overtimeTimeIn) {
          // Allow starting overtime anytime after afternoon is complete
          return { action: 'in', field: 'overtimeTimeIn', period: 'Overtime' };
        }
        if (shift.overtimeTimeIn && !shift.overtimeTimeOut) {
          return { action: 'out', field: 'overtimeTimeOut', period: 'Overtime' };
        }
        // Everything is complete
        return { action: 'complete', field: null, period: null,
                  message: 'All shifts for today are complete!' };
      }
    }
  }

  if (isAfternoon) {
    // If afternoon in is missing, allow afternoon in
    if (!shift.afternoonTimeIn) {
      return { action: 'in', field: 'afternoonTimeIn', period: 'Afternoon' };
    }
    // If afternoon in exists but no out, allow afternoon out
    if (shift.afternoonTimeIn && !shift.afternoonTimeOut) {
      return { action: 'out', field: 'afternoonTimeOut', period: 'Afternoon' };
    }
    // Afternoon is complete, check if they want to update or move to overtime
    if (shift.afternoonTimeIn && shift.afternoonTimeOut) {
      if (!shift.overtimeTimeIn) {
        // Allow starting overtime anytime after afternoon is complete
        if (hour >= 17) {
          return { action: 'in', field: 'overtimeTimeIn', period: 'Overtime' };
        }
        // Still afternoon - UPDATE the afternoon time-out
        return { action: 'update_out', field: 'afternoonTimeOut', period: 'Afternoon' };
      }
      if (shift.overtimeTimeIn && !shift.overtimeTimeOut) {
        return { action: 'out', field: 'overtimeTimeOut', period: 'Overtime' };
      }
      // Everything is complete
      return { action: 'complete', field: null, period: null,
                message: 'All shifts for today are complete!' };
    }
  }

  if (isOvertime) {
    // If overtime in is missing, allow overtime in
    if (!shift.overtimeTimeIn) {
      return { action: 'in', field: 'overtimeTimeIn', period: 'Overtime' };
    }
    // If overtime in exists but no out, allow overtime out
    if (shift.overtimeTimeIn && !shift.overtimeTimeOut) {
      return { action: 'out', field: 'overtimeTimeOut', period: 'Overtime' };
    }
    // Overtime is complete - allow updating the time-out
    if (shift.overtimeTimeIn && shift.overtimeTimeOut) {
      return { action: 'update_out', field: 'overtimeTimeOut', period: 'Overtime' };
    }
  }

  return { action: 'unknown', field: null, period: null };
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

    const response = await axios.post(`${FACE_SERVICE_URL}/verify`, {
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
    const { liveImage } = req.body;
    if (!liveImage) return res.status(400).json({ error: 'No image frame captured.' });

    // 1. Save kiosk webcam capture frame to temp folder
    const tempFilename = `kiosk_${Date.now()}.jpg`;
    const tempPath = path.join(__dirname, '../storage/temp/', tempFilename);
    const base64Data = liveImage.replace(/^data:image\/\w+;base64,/, '');
    
    fs.mkdirSync(path.dirname(tempPath), { recursive: true });
    fs.writeFileSync(tempPath, Buffer.from(base64Data, 'base64'));

    // 2. Call the Python /identify endpoint
    const response = await axios.post(`${FACE_SERVICE_URL}/identify`, {
      live_path: tempPath,
    });

    const { verified: isFaceRecognized, employeeId: identifiedEmployeeId, error: aiError } = response.data;

    console.log('DEBUG — Python returned employeeId:', identifiedEmployeeId, typeof identifiedEmployeeId);

    if (!isFaceRecognized) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return res.status(401).json({ error: aiError || 'Biometric recognition match refused.' });
    }

    const parsedEmployeeId = parseInt(identifiedEmployeeId, 10);
    console.log('DEBUG — Querying MySQL with converted Integer ID:', parsedEmployeeId, typeof parsedEmployeeId);

    const user = await User.findByPk(isNaN(parsedEmployeeId) ? identifiedEmployeeId : parsedEmployeeId);
    console.log('DEBUG — User.findByPk result:', user ? user.id : 'NOT FOUND');

    if (!user) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return res.status(404).json({ error: 'Identified database user record not found.' });
    }

    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5); // "HH:MM"
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`; // Fixed: Local safe YYYY-MM-DD format
    
    const hour = now.getHours();

    const isMorning = hour < 12;
    const isAfternoon = hour >= 12 && hour < 18;
    const isOvertime = hour >= 18;

    // 7. Get today's shift
    let shift = await Shift.findOne({ where: { employeeId: user.id, date: today } });
    const holidayInfo = await checkHoliday(today);

    // 8. Determine next action using the helper
    const timeContext = { isMorning, isAfternoon, isOvertime, hour };
    const nextAction = determineNextAction(shift, timeContext);

    // 9. Handle cases
    if (nextAction.action === 'complete') {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return res.status(400).json({ 
        error: nextAction.message || 'All shifts for today are complete!' 
      });
    }

    if (nextAction.action === 'unknown') {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return res.status(400).json({ error: 'Unable to determine appropriate action.' });
    }

    // 10. Process the action
    let updateFields = { faceVerified: true };
    let actionMessage = '';
    let hoursField = '';

    // Handle IN actions
    if (nextAction.action === 'in') {
      updateFields[nextAction.field] = timeStr;
      actionMessage = `Timed In - ${nextAction.period} Shift`;
    }
    // Handle OUT actions
    else if (nextAction.action === 'out') {
      const fieldMap = {
        'morningTimeOut': { inField: 'morningTimeIn', hoursField: 'morningHours' },
        'afternoonTimeOut': { inField: 'afternoonTimeIn', hoursField: 'afternoonHours' },
        'overtimeTimeOut': { inField: 'overtimeTimeIn', hoursField: 'overtimeHours' }
      };
      
      updateFields[nextAction.field] = timeStr;
      const inField = fieldMap[nextAction.field].inField;
      hoursField = fieldMap[nextAction.field].hoursField;
      
      // Calculate hours
      if (shift && shift[inField]) {
        updateFields[hoursField] = calcHours(shift[inField], timeStr);
      }
      actionMessage = `Timed Out - ${nextAction.period} Shift`;
    }
    // Handle UPDATE_OUT actions (update existing time-out)
    else if (nextAction.action === 'update_out') {
      const fieldMap = {
        'morningTimeOut': { inField: 'morningTimeIn', hoursField: 'morningHours' },
        'afternoonTimeOut': { inField: 'afternoonTimeIn', hoursField: 'afternoonHours' },
        'overtimeTimeOut': { inField: 'overtimeTimeIn', hoursField: 'overtimeHours' }
      };
      
      // Update the time-out with the new time
      updateFields[nextAction.field] = timeStr;
      const inField = fieldMap[nextAction.field].inField;
      hoursField = fieldMap[nextAction.field].hoursField;
      
      // Recalculate hours with the new time
      if (shift && shift[inField]) {
        updateFields[hoursField] = calcHours(shift[inField], timeStr);
      }
      actionMessage = `Updated Time-Out - ${nextAction.period} Shift`;
    }

    // 11. Update or create shift
    if (shift) {
      await shift.update(updateFields);
      
      // Recalculate total hours
      const freshShift = await Shift.findByPk(shift.id);
      const totalHours = (freshShift.morningHours || 0) + 
                        (freshShift.afternoonHours || 0) + 
                        (freshShift.overtimeHours || 0);
      await freshShift.update({ totalHours });
    } else {
      // Create new shift with appropriate fields
      const newShiftData = {
        employeeId: user.id,
        date: today,
        isHoliday: holidayInfo.isHoliday,
        faceVerified: true,
        totalHours: 0
      };
      
      // Add the specific time field
      newShiftData[nextAction.field] = timeStr;
      
      // If it's an OUT or UPDATE_OUT action, we need the corresponding IN field too
      if (nextAction.action === 'in') {
        await Shift.create(newShiftData);
      } else {
        // Shouldn't happen - can't OUT/UPDATE without existing shift
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        return res.status(400).json({ error: 'Cannot clock out without an existing shift.' });
      }
    }

    // 12. Clean up
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    return res.json({
      success: true,
      employeeName: user.name || user.firstName || user.username || 'Employee',
      message: actionMessage,
      action: nextAction.action,
      period: nextAction.period,
      time: timeStr
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
