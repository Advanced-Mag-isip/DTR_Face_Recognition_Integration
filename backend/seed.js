require('dotenv').config();
const sequelize = require('./models');
const User = require('./models/User');
const Shift = require('./models/Shift');

sequelize.sync({ alter: true }).then(async () => {
    // Clear existing data (shifts first due to foreign key constraint)
    await Shift.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create admin user
    await User.create({
        employeeId: 'ADMIN-001',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        department: 'IT',
        position: 'System Administrator',
        monthlySalary: 60000.00,
        overtimeHourlyRate: 0  // Auto-calculated from hourly rate
    });

    // Create employee user
    await User.create({
        employeeId: 'EMP-001',
        password: 'employee123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'employee',
        department: 'Engineering',
        position: 'Senior Developer',
        monthlySalary: 50000.00,
        overtimeHourlyRate: 0  // Auto-calculated from hourly rate
    });

    console.log('Users seeded successfully:');
    console.log('  Admin: ADMIN-001 / admin123 (Salary: ₱60,000.00 | Hourly: ₱340.91/hr)');
    console.log('  Employee: EMP-001 / employee123 (Salary: ₱50,000.00 | Hourly: ₱284.09/hr)');
    process.exit();
}).catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
});