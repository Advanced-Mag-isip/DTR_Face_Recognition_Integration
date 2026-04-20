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

## 🚧 In Progress
- **Step 6**: PaySalaryModal - Create admin modal to mark shifts as paid.

## 📋 Pending Steps
1. **RemainingSalary**: Create component for employee unpaid balance view.
2. **Build Deployment**: Run `npm run build` and deploy to VPS.
3. **Git Integration**: Establish `git pull` as deployment method on VPS.

## 💡 Key Logic Implemented
- **Employee Props**: `position`, `paymentType` (monthly/hourly), `paymentMethod`, `paymentDetails`, `hourlyRate`, `monthlySalary`, `dailySalary`.
- **Salary Calculation**:
  - Hourly workers: Uses `hourlyRate` or derives from `dailySalary / 8`
  - Monthly workers: Derives hourly rate from `monthlySalary / 26 / 8`
- **Existing Fields**: `overtimeHourlyRate`, `isPaid`, `paidAt` on Shift.

## 💡 Key Logic (Pending)
- **Pay Salary Modal**: Checkbox for unpaid days, Payment Summary, Confirm button (marks shifts as `isPaid: true`).
- **Remaining Salary**: logic to sum unpaid shifts; hide for monthly users until 1 day before the last Friday.
- **Payroll Report**: 1st Cut-off (2nd Friday), 2nd Cut-off (Last Friday).

## 🛠 Server Access Notes
- **User**: root
- **Directory**: `/home/advancedthinkers-dtr/htdocs/dtr.advancedthinkers.app/`
- **PM2 App**: `server`
- **DB Backup Path**: `/home/advancedthinkers-dtr/backups/`

## 🗄 Database Migration Notes
Run in TablePlus on local and production:
```sql
ALTER TABLE users 
ADD COLUMN hourlyRate DECIMAL(10, 2) DEFAULT 0.00 AFTER dailySalary,
ADD COLUMN monthlySalary DECIMAL(12, 2) DEFAULT 0.00 AFTER hourlyRate;
```

---
*This file serves as a context bridge. Do not delete until the "Salary Loop" feature is fully deployed.*
