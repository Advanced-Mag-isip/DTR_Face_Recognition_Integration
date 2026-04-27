# 🎯 Project Progress & Context Manifest

## 📋 Current Objective
Implement the \"Salary Loop\" feature for the DTR system and transition the workflow from manual WinSCP uploads to a Git-based, production-ready architecture.

## 🏗 System Architecture (Current)
- **Frontend**: React 19 (Vite) - *Served as static files by Backend in Production.*
- **Backend**: Node.js/Express - *Managed by PM2 (Process Name: 'server', ID: 0).*
- **Database**: MySQL - *Managed via phpMyAdmin/TablePlus.*
- **Environment**: Linux VPS (Production) at `/home/advancedthinkers-dtr/htdocs/dtr.advancedthinkers.app/`.

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
- [x] **Step 12**: UI Polish - Fixed dropdown icon spacing and standardized layout across all components.
- [x] **Step 13**: Production Readiness - Fixed `server.js` catch-all route and created `deploy.sh` script.

## 🚧 In Progress
- **Production Transition**: User confirmed all employees have `hourlyRate`. Manual SQL migration prepared for Cloud Panel execution.

## 📋 Pending Steps (Next Session)
1. **Database Migration**: 
   - Execute the **Master SQL Patch** below in the VPS Cloud Panel (phpMyAdmin).
2. **Production Code Deployment**:
   - Run `chmod +x deploy.sh` on VPS.
   - Run `./deploy.sh` to pull changes, build frontend, and restart PM2.
3. **Validation**: Verify that employees with `dailySalary` have been successfully migrated to `hourlyRate`.

## 🗄️ Master SQL Patch (Run this in phpMyAdmin)
```sql
-- 1. CLEAN UP REDUNDANT INDEXES (Users)
ALTER TABLE `Users` DROP INDEX `employeeId_2`, DROP INDEX `employeeId_3`, DROP INDEX `employeeId_4`, DROP INDEX `employeeId_5`, DROP INDEX `employeeId_6`, DROP INDEX `employeeId_7`, DROP INDEX `employeeId_8`, DROP INDEX `employeeId_9`, DROP INDEX `employeeId_10`, DROP INDEX `employeeId_11`, DROP INDEX `employeeId_12`, DROP INDEX `employeeId_13`, DROP INDEX `employeeId_14`, DROP INDEX `employeeId_15`, DROP INDEX `employeeId_16`, DROP INDEX `employeeId_17`, DROP INDEX `employeeId_18`, DROP INDEX `employeeId_19`, DROP INDEX `employeeId_20`, DROP INDEX `employeeId_21`, DROP INDEX `employeeId_22`, DROP INDEX `employeeId_23`, DROP INDEX `employeeId_24`, DROP INDEX `employeeId_25`, DROP INDEX `employeeId_26`, DROP INDEX `employeeId_27`, DROP INDEX `employeeId_28`, DROP INDEX `employeeId_29`, DROP INDEX `employeeId_30`, DROP INDEX `employeeId_31`, DROP INDEX `employeeId_32`, DROP INDEX `employeeId_33`, DROP INDEX `employeeId_34`, DROP INDEX `employeeId_35`, DROP INDEX `employeeId_36`, DROP INDEX `employeeId_37`, DROP INDEX `employeeId_38`, DROP INDEX `employeeId_39`, DROP INDEX `employeeId_40`, DROP INDEX `employeeId_41`, DROP INDEX `employeeId_42`, DROP INDEX `employeeId_43`, DROP INDEX `employeeId_44`, DROP INDEX `employeeId_45`, DROP INDEX `employeeId_46`, DROP INDEX `employeeId_47`, DROP INDEX `employeeId_48`, DROP INDEX `employeeId_49`, DROP INDEX `employeeId_50`, DROP INDEX `employeeId_51`, DROP INDEX `employeeId_52`, DROP INDEX `employeeId_53`, DROP INDEX `employeeId_54`, DROP INDEX `employeeId_55`, DROP INDEX `employeeId_56`, DROP INDEX `employeeId_57`, DROP INDEX `employeeId_58`, DROP INDEX `employeeId_59`, DROP INDEX `employeeId_60`, DROP INDEX `employeeId_61`, DROP INDEX `employeeId_62`;

-- 2. ADD NEW COLUMNS TO Users
ALTER TABLE `Users` 
ADD COLUMN `hourlyRate` DECIMAL(10, 2) DEFAULT 0.00 AFTER `dailySalary`,
ADD COLUMN `monthlySalary` DECIMAL(12, 2) DEFAULT 0.00 AFTER `hourlyRate`,
ADD COLUMN `paymentType` ENUM('monthly', 'hourly') DEFAULT 'hourly' AFTER `monthlySalary`,
ADD COLUMN `paymentMethod` ENUM('cash', 'gcash', 'bank_transfer') DEFAULT 'gcash' AFTER `paymentType`,
ADD COLUMN `paymentDetails` VARCHAR(255) NULL AFTER `paymentMethod`,
ADD COLUMN `payrollNotes` TEXT NULL AFTER `paymentDetails`;

-- 3. MIGRATE DATA (Daily -> Hourly)
UPDATE `Users` 
SET `hourlyRate` = `dailySalary` / 8,
    `paymentType` = 'hourly'
WHERE `dailySalary` > 0;

-- 4. ADD NEW COLUMNS TO Shifts
ALTER TABLE `Shifts` 
ADD COLUMN `isPaid` BOOLEAN DEFAULT FALSE AFTER `holidayName`,
ADD COLUMN `paidAt` DATETIME NULL AFTER `isPaid`;
```

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
| `payrollNotes` | JSON - stores notes like \"PAID\" or custom notes per period |

---

*This file serves as a context bridge. Do not delete until the \"Salary Loop\" feature is fully deployed.*