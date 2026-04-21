const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('./index');

const User = sequelize.define('User', {
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    trim: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    minlength: 6,
  },
  firstName: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  lastName: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'employee',
    validate: {
      isIn: [['employee', 'admin']]
    }
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true,
    trim: true
  },
  dailySalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.0
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.0
  },
  monthlySalary: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0.0
  },
  overtimeHourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.0
  },
  paymentType: {
    type: DataTypes.ENUM('monthly', 'hourly'),
    defaultValue: 'hourly',
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'gcash', 'bank_transfer'),
    defaultValue: 'gcash',
    allowNull: true,
  },
  paymentDetails: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  payrollNotes: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    allowNull: true,
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
