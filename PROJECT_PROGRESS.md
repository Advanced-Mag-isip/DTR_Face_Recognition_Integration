# 🎯 Project Progress & Context Manifest

## 📋 Current Objective
Implement the "Salary Loop" feature for the DTR system and transition the workflow from manual WinSCP uploads to a Git-based, production-ready architecture.

## 🏗 System Architecture (Current)
- **Frontend**: React 19 (Vite) - *Currently running in Dev Mode on VPS.*
- **Backend**: Node.js/Express - *Managed by PM2 (Process Name: 'server', ID: 0).*
- **Database**: MySQL - *Managed via TablePlus and Sequelize.*
- **Environment**: Linux VPS (Sandbox) at `/home/advancedthinkers-dtr/htdocs/dtr.advancedthinkers.app/`.

## ✅ Completed Steps
- [x] Initial Codebase Analysis.
- [x] Committed existing local changes to GitHub (`main` branch).
- [x] Created `TECHNICAL_DOCS.md` (Industry-standard documentation).
- [x] Identified Server PIDs and PM2 process status.
- [x] **Step 1**: Database Models - Added `paymentType`, `paymentMethod`, `paymentDetails` to User; Added `isPaid`, `paidAt` to Shift.
- [x] **Step 2**: Backend Salary Routes - Updated salary computation with payment type support.
- [x] **Step 3**: Frontend Update - Updated `AddEmployeeModal.jsx` with payment fields (paymentType, paymentMethod, paymentDetails).
- [x] **Step 4**: Proper Fix - Added `hourlyRate` and `monthlySalary` fields with Sequelize migration.
- [x] **Step 5**: Salary UI Update - Updated `SalaryReport.jsx` and `ShiftTable.jsx` to support hourly/monthly payment types.
- [x] **Step 6**: PaySalaryModal - Admin modal to mark shifts as paid.
- [x] **Step 7**: Employee Table Enhancements - Added Position, Payment Type, Salary Rate, Remaining Salary columns, and Pay button in Actions.
- [x] **Step 8**: Payroll Report - Full-page report with 1st Half, 2nd Half, and Monthly tabs, department filter, notes editing, CSV export.
- [x] **Step 9**: Fixed isPaid status - Payroll Report now correctly shows PAID/UNPAID based on shift.isPaid field.
- [x] **Step 10**: Fixed Monthly Salary Logic - Implemented logic for employees with fixed salaries (paid even with 0 shifts).
- [x] **Step 11**: SalaryReport Enhancements - Added Paid Status, Payment Method, and Remaining Balance display.

## 🚧 In Progress
- **Bug Fixing & Refinement**: Polishing UI layouts and fixing account deletion issues.

## 📋 Pending Steps (Future Implementation)
1. **Build Deployment**: Run `npm run build` and deploy to VPS.
2. **Git Integration**: Establish `git pull` as deployment method on VPS.
3. **Automated Backups**: Script to auto-backup MySQL database daily.
4. **Security Hardening**: Implement rate limiting and secure headers for production.

## 💡 Key Logic Implemented
### Employee Props
| Field | Description |
|-------|-------------|
| `position` | Employee position/title |
| `paymentType` | `monthly` or `hourly` |
| `paymentMethod` | cash, gcash, bank_transfer |
| `paymentDetails` | GCash number or bank account |
| `hourlyRate` | Hourly rate (for hourly workers) |
| `monthlySalary` | Monthly salary (for monthly workers) |
| `dailySalary` | Daily rate (legacy) |
| `overtimeHourlyRate` | Overtime rate |
| `payrollNotes` | JSON - stores notes like "PAID" or custom notes per period |

### Salary Calculation
- Hourly workers: Uses `hourlyRate` or derives from `dailySalary / 8`
- Monthly workers: Derives hourly rate from `monthlySalary / 26 / 8`

### Shift Fields
| Field | Description |
|-------|-------------|
| `isPaid` | Boolean - whether shift has been paid |
| `paidAt` | Timestamp - when shift was paid |

### Pay Period Options
- **1st Cut-off**: Days 1-15 (Paid on 2nd Friday of month)
- **2nd Cut-off**: Days 16-End (Paid on last Friday of month)
- **Monthly**: Full month (Paid on last Friday of month)

### Payroll Report Status Logic
- **Hourly/Daily**: Checks `shift.isPaid` for each shift. All paid = "PAID", any unpaid = "UNPAID"
- **Monthly**: Checks if "PAID" note exists in `payrollNotes` for that period

## 🛠 Server Access Notes
- **User**: root
- **Directory**: `/home/advancedthinkers-dtr/htdocs/dtr.advancedthinkers.app/`
- **PM2 App**: `server`
- **DB Backup Path**: `/home/advancedthinkers-dtr/backups/`

## 📝 Future Implementation: Fixed Monthly Salary Logic

### Problem Statement
Some employees receive a **fixed monthly salary** regardless of whether they add shifts or come to the office. They don't need to log shifts - their salary is simply paid at the end of the month.

Currently, if a monthly employee adds no shifts, their Payroll shows ₱0 (incorrect).

### Proposed Solution
For `paymentType = 'monthly'` employees in Payroll Report:

```
IF employee has shifts in period:
    amount = calculated from shifts
ELSE:
    amount = monthlySalary (full month)
```

### Implementation Steps
1. **Backend**: Modify Payroll Report calculation for monthly employees
2. **Frontend**: Automatic detection - no changes needed
3. **Database**: No new fields needed (uses existing `monthlySalary`)

### Files to Modify
- `backend/routes/salary.js` - Update `/unpaid` and `/pay` routes for monthly logic
- `src/components/PayrollReport.jsx` - Update amount calculation for monthly employees

## 📝 Future Implementation: SalaryReport Enhancements

### Problem Statement
SalaryReport component currently doesn't show:
- Payment status (PAID/UNPAID)
- Payment method details (GCash number, bank account)
- Remaining unpaid balance

### Proposed Solution
Add the following to SalaryReport component:
1. **Paid Status** - Show if all shifts paid or highlight unpaid ones
2. **Payment Method** - Display paymentMethod + paymentDetails
3. **Remaining Balance** - Calculate and show unpaid amount

### Implementation Steps
1. Pass `paymentMethod`, `paymentDetails`, and shift data to SalaryReport
2. Calculate unpaid shifts vs paid shifts
3. Display payment info (if available)
4. Update UI to show balances

### Files to Modify
- `src/components/SalaryReport.jsx` - Add new props and display logic

---

## 🗄 Database Migration Notes

### Completed Migrations
```sql
-- Add salary fields
ALTER TABLE users 
ADD COLUMN hourlyRate DECIMAL(10, 2) DEFAULT 0.00 AFTER dailySalary,
ADD COLUMN monthlySalary DECIMAL(12, 2) DEFAULT 0.00 AFTER hourlyRate;

-- Add isPaid and paidAt to shifts (already done in Step 1)
ALTER TABLE shifts 
ADD COLUMN isPaid BOOLEAN DEFAULT FALSE,
ADD COLUMN paidAt DATETIME;

-- Add payroll notes for storing notes per period
ALTER TABLE users ADD COLUMN payrollNotes TEXT;
```

---

*This file serves as a context bridge. Do not delete until the "Salary Loop" feature is fully deployed.*