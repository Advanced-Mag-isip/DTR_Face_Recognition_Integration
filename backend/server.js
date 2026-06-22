require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./models');
const User = require('./models/User');
const Shift = require('./models/Shift');
const Holiday = require('./models/Holiday');
const authRoutes = require('./routes/auth');
const shiftRoutes = require('./routes/shift');
const usersRoutes = require('./routes/users');
const salaryRoutes = require('./routes/salary');
const holidayRoutes = require('./routes/holiday');
const departmentRoutes = require('./routes/department');


const app = express();
const PORT = process.env.PORT || 3001;

// Define associations with cascade delete
Shift.belongsTo(User, { foreignKey: 'employeeId', as: 'employee', onDelete: 'CASCADE' });
User.hasMany(Shift, { foreignKey: 'employeeId', as: 'shifts', onDelete: 'CASCADE' });

// CORS configuration
const allowedOrigins = ['http://localhost:5173', 'https://dtr.advancedthinkers.app', 'http://localhost:8315', 'http://127.0.0.1:8315'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Serve React build (dist) folder in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.use('/api/auth', authRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/departments', departmentRoutes);


// Catch-all: send React app for any non-API route
app.use(express.static(distPath));

app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
    } else {
        next();
    }
});


sequelize.sync({ alter: true })
    .then(() => {
        app.listen(PORT, () => {});
    })
    .catch((err) => console.error('Database connection error:', err));