require('dotenv').config();
const sequelize = require('./models');
const User = require('./models/User');
const Shift = require('./models/Shift');
const Department = require('./models/Department');

sequelize.sync({ alter: true }).then(async () => {
    // Clear existing data (shifts first due to foreign key constraint)
    await Shift.destroy({ where: {} });
    await User.destroy({ where: {} });
    
    // Create default departments
    const departments = await Promise.all([
        Department.findOrCreate({ 
            where: { name: 'IT' },
            defaults: { description: 'Information Technology' }
        }),
        Department.findOrCreate({ 
            where: { name: 'HR' },
            defaults: { description: 'Human Resources' }
        }),
        Department.findOrCreate({ 
            where: { name: 'Marketing' },
            defaults: { description: 'Marketing and Communications' }
        })
    ]);

    const itDept = departments[0][0];
    const hrDept = departments[1][0];

    // Create admin user
    await User.create({
        employeeId: 'ADMIN-001',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        departmentId: itDept.id,
        department: 'IT',
        position: 'System Administrator',
        dailySalary: 2727.27,
        overtimeHourlyRate: 0
    });

    // Create employee user
    await User.create({
        employeeId: 'EMP-001',
        password: 'employee123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'employee',
        departmentId: hrDept.id,
        department: 'HR',
        position: 'HR Specialist',
        dailySalary: 2272.73,
        overtimeHourlyRate: 0
    });

    console.log('Users seeded successfully:');
    console.log('  Admin: ADMIN-001 / admin123 (Daily Salary: ₱2,727.27 | Hourly: ₱340.91/hr)');
    console.log('  Employee: EMP-001 / employee123 (Daily Salary: ₱2,272.73 | Hourly: ₱284.09/hr)');
    console.log('Departments seeded successfully:');
    departments.forEach(([dept]) => {
        console.log(`  - ${dept.name}: ${dept.description || 'No description'}`);
    });
    process.exit();
}).catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
});
