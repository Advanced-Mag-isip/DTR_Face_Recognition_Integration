# 📋 Payroll & Salary System User Guide

This guide explains how to manage employee salaries, process payments, and generate payroll reports using the Attendance Tracker.

---

## 📅 The Pay Cycle Rules (The "Friday" Logic)

The system is designed to follow a specific two-part pay cycle every month:

1.  **1st Cut-off:** Ends every **2nd Friday** of the month.
2.  **2nd Cut-off:** Ends every **Last Friday** of the month.

### What is "Rolling Balance"?
The system uses **Rolling Logic**. This means if an employee has work from a previous month or period that was never marked as "Paid," it will automatically be added to their next paycheck. No work is ever lost or forgotten.

---

## 👥 Employee Types & Pay Rules

There are two ways employees are paid in this system:

### 1. Hourly/Daily Employees
*   **How they are paid:** Based on the actual shifts they log in the system.
*   **Formula:** (Regular Hours × Rate) + (Overtime Hours × OT Rate) + (Holiday Premiums).
*   **Payment Schedule:** They can be paid during both the 1st Cut-off and the 2nd Cut-off.

### 2. Monthly (Output-Based) Employees
*   **How they are paid:** They receive a fixed, guaranteed monthly salary regardless of how many shifts are logged.
*   **Formula:** (Fixed Monthly Salary) + (Extra Overtime) + (Extra Holiday Premiums).
*   **Payment Schedule:** They are paid **once a month**, during the **2nd Cut-off** (Last Friday). Their 1st Cut-off amount will always show as ₱0.00.

---

## 🖥️ How to Use the System

### 1. The Management Table (Overview)
In the "Employees" tab, look at the **Remaining** column.
*   **What it shows:** This is the **Total Global Debt**. It shows exactly how much the company owes that employee for *all* unpaid work they have ever done, including work done *after* the current cutoff.
*   **Purpose:** Use this for a quick "Health Check" to see total outstanding obligations.

### 2. Processing a Payment (The Pay Modal)
To pay an employee, click the **"Pay"** button next to their name.
1.  **Select Month:** Choose the month you are paying for.
2.  **Select Period:** 
    *   Choose **1st Cut-off** for mid-month pay.
    *   Choose **2nd Cut-off** for month-end pay.
3.  **Review Shifts:** The system will list every shift included in that payment. You can uncheck specific shifts if you wish to hold them for later.
4.  **Confirm:** Click "Confirm Payment." This will mark those shifts as **Paid** in the database and record the date/time of payment.

### 3. The Payroll Report (Documentation)
Go to the **Payroll Report** tab to see the big picture for the whole company.
*   **1st Half Tab:** Shows only Hourly employees due for payment on the 2nd Friday.
*   **2nd Half Tab:** Shows everyone (Hourly + Monthly) due for payment on the Last Friday.
*   **Status Labels:** 
    *   **UNPAID (Amber):** Employee has work that hasn't been paid yet for this period.
    *   **PAID (Green):** You have already successfully processed this person's pay.

---

## 🏖️ Holiday Pay Rules
The system automatically detects holidays and adds the following premiums:
*   **Regular Holiday:** +100% of the daily rate (Double Pay).
*   **Special Non-Working Holiday:** +30% of the daily rate.

*Note: For Monthly employees, their base pay for the holiday is already in their fixed salary, so the system only adds the "Extra" premium portion (e.g., the extra 100% or 30%).*

---

## ❓ Troubleshooting & FAQs

### Why does the "Remaining" balance in the table show more than the "Pay Modal"?
The **Table** shows every unpaid shift the employee has logged, even if it's for *next* week. The **Pay Modal** only shows work done *up until the Friday cutoff*. 
*Example: If today is Saturday and the cutoff was yesterday (Friday), the shift from today will show in the Table balance but won't be in your paycheck until the next cutoff.*

### Why is the Monthly Employee showing ₱0.00 in the 1st Cut-off?
This is correct. Monthly employees are paid their full fixed salary at the end of the month (2nd Cut-off).

### Why are shifts from April 25-27 not appearing in the April Payroll?
Because the April cutoff ended on the **Last Friday (April 24)**. Any work done after that Friday is automatically moved into the **May 1st Cut-off**.

### An amount looks wrong. What should I check?
1.  **Employee Settings:** Click "Edit" on the employee. Ensure their **Payment Type** (Monthly/Hourly) is correct and their **Rates** are filled in properly.
2.  **Shift Accuracy:** Check the employee's Shift History to ensure no duplicate shifts or incorrect hours were logged.
