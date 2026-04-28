# 📋 DTR & Payroll System: Salary & Payroll User Guide

This guide focuses specifically on the **Salary Loop** and **Payroll Management** features implemented in the system. It is designed to help you process employee payments and generate reports accurately.

---

## ⚠️ CRITICAL REMINDER: Employee Payment Details
Before processing payroll, ensure that every employee has their **Payment Method** (Cash, GCash, or Bank Transfer) and **Payment Details** (e.g., GCash Number or Account Number) correctly entered in their profile. 
*   Without these details, your exported Payroll Reports will be incomplete, and you won't know where to send the funds!

---

## 1. Understanding the "Salary Loop" (Cutoff Logic)
The system uses a "Rolling Start" logic to ensure that every single day worked is accounted for, even during the transition between months. No shifts are ever "lost."

### The Two Cutoffs
1.  **First Half (1st Cycle)**: 
    *   **Start Date**: The day immediately after the *previous month's* last Friday.
    *   **End Date**: The **2nd Friday** of the current month.
    *   *Purpose*: Primarily pays out accumulated shifts for hourly workers.
2.  **Second Half (2nd Cycle)**: 
    *   **Start Date**: The day after the 2nd Friday.
    *   **End Date**: The **Last Friday** of the month.
    *   *Purpose*: Pays out the remaining hourly shifts **PLUS** the full fixed salary for Monthly employees.

> 📸 **[IMAGE CUE: Insert Screenshot of the Payroll Report Page showing the Cycle Toggle (1st Half / 2nd Half)]**

---

## 2. Processing Payments (The "Pay" Button)
When you are ready to release salaries, use the **Employee Management** table.

### How to Pay an Employee:
1.  Locate the employee and click the green **"Pay"** button in the Actions column.
2.  **The Payment Modal**: A window will appear listing all **Unpaid Shifts** that fall within the current cutoff.
3.  **Total Gross**: The system calculates the total amount earned for those shifts, including any Overtime or Holiday Premiums.
4.  **Confirming**: Select the shifts you wish to pay and click **"Confirm Payment"**. 
    *   *Note*: These shifts will now be marked as "PAID" in the system and will no longer appear as "Unpaid" in future cutoffs.

> 📸 **[IMAGE CUE: Insert Screenshot of the Pay Salary Modal showing the list of shifts and the 'Confirm Payment' button]**

---

## 3. The Payroll Report & Dashboard
The **Payroll Report** tab is your tool for generating the master list for the company.

### Using the Report:
1.  **Select Period & Cycle**: Choose the month and the specific half you are paying.
2.  **Financial Transparency**:
    *   **Amount Column**: Shows the **Total Gross Amount** (the full salary the employee earned for that cycle).
    *   **Remaining Balance**: If you only paid an employee partially, the system will display a note like "Remaining: ₱500.00" so you know what is still owed.
3.  **Adding Notes**: You can click on the "Note" column to type custom messages (e.g., "Incentive added" or "Late deduction"). These are saved per employee, per month.

> 📸 **[IMAGE CUE: Insert Screenshot of the Payroll Report Table highlighting the 'Amount' and 'Status' columns]**

---

## 4. Exporting to Excel
For the final touch, use the **"Export Excel"** button to generate a professional file.

### Excel Features:
*   **Multi-Table Layout**: The file automatically separates employees into different tables based on their **Department** and **Cycle**.
*   **Marketing Department Special Rule**: For departments like Marketing that have only monthly salaries, the system creates a single consolidated table named "PAYROLL - MARKETING."
*   **Professional Formatting**: 
    *   **Green Column**: Total Amount.
    *   **Yellow Column**: Payment Status (PAID, UNPAID, or PARTIAL).
    *   **Wrapped Text**: Long notes will automatically move to a second line within the cell to keep the file readable.

> 📸 **[IMAGE CUE: Insert Screenshot of the Exported Excel File highlighting the different department tables and color-coded columns]**

---

## 5. Employee Self-Service
Employees can log in to view their own **Salary Report**.
*   **Transparency**: They can see exactly how many days they were paid for and any premiums added.
*   **Status**: They will see "PAID" or "PENDING" in real-time based on your actions in the Admin dashboard.
*   **Monthly Privacy**: Fixed monthly amounts are hidden from employees until **1 day before the 2nd cutoff** to maintain internal payroll confidentiality.

---
*End of Guide*
