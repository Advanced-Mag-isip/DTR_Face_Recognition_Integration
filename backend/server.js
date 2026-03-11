require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./models');
const User = require('./models/User');
const Shift = require('./models/Shift');

const authRoutes = require('./routes/auth');
const shiftRoutes = require('./routes/shift');
const usersRoutes = require('./routes/users');
const salaryRoutes = require('./routes/salary');

const app = express();

// Define associations with cascade delete
Shift.belongsTo(User, { foreignKey: 'employeeId', as: 'employee', onDelete: 'CASCADE' });
User.hasMany(Shift, { foreignKey: 'employeeId', as: 'shifts', onDelete: 'CASCADE' });

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/salary', salaryRoutes);

sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database connected and models synced');
        app.listen(process.env.PORT, () =>
            console.log(`Server running on http://localhost:${process.env.PORT}`)
        );
    })
    .catch((err) => console.error('Database connection error:', err));
