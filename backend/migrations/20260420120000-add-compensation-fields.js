'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.addColumn('users', 'hourlyRate', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        after: 'dailySalary'
      }, { transaction: t });

      await queryInterface.addColumn('users', 'monthlySalary', {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00,
        after: 'hourlyRate'
      }, { transaction: t });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeColumn('users', 'monthlySalary', { transaction: t });
      await queryInterface.removeColumn('users', 'hourlyRate', { transaction: t });
    });
  }
};
