// Department model is defined in index.js to avoid circular dependencies
// This file re-exports the Department model from the main sequelize instance
const sequelize = require('./index');
module.exports = sequelize.Department;
