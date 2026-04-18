const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Holiday = sequelize.define('Holiday', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true,
    },
    type: {
        type: DataTypes.ENUM('regular', 'special_non_working', 'special_working'),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    timestamps: true,
    tableName: 'Holidays'
});

module.exports = Holiday;
