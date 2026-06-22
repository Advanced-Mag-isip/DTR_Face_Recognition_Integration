const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
  }
);

// Export immediately to avoid circular dependency issues
module.exports = sequelize;
module.exports.Sequelize = Sequelize;
module.exports.DataTypes = DataTypes;

// Define Department model directly here
const Department = sequelize.define('Department', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'departments'
});

module.exports.Department = Department;

// Now require other models (they will get sequelize from this already-exported module)
const User = require('./User');
const Shift = require('./Shift');
const Holiday = require('./Holiday');

module.exports.User = User;
module.exports.Shift = Shift;
module.exports.Holiday = Holiday;

// Define associations (using 'dept' alias to avoid naming collision with department string field)
User.belongsTo(Department, { foreignKey: 'departmentId', as: 'dept' });
Department.hasMany(User, { foreignKey: 'departmentId', as: 'users' });
