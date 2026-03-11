const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Shift = sequelize.define('Shift', {
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE',
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    morningTimeIn: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    morningTimeOut: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    morningHours: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    afternoonTimeIn: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    afternoonTimeOut: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    afternoonHours: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    overtimeTimeIn: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    overtimeTimeOut: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    overtimeHours: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    totalHours: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    }
}, {
    timestamps: true,
    tableName: 'Shifts'
});

module.exports = Shift;
