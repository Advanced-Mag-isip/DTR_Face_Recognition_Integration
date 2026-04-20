'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [users] = await queryInterface.sequelize.query(
      'SELECT id, dailySalary, paymentType FROM users WHERE dailySalary > 0',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const user of users) {
      const daily = parseFloat(user.dailySalary);
      
      let hourlyRate = 0;
      let monthlySalary = 0;

      if (user.paymentType === 'hourly') {
        hourlyRate = daily / 8;
      } else if (user.paymentType === 'monthly') {
        monthlySalary = daily * 26;
      }

      await queryInterface.sequelize.query(
        `UPDATE users SET hourlyRate = :hourlyRate, monthlySalary = :monthlySalary WHERE id = :userId`,
        { replacements: { hourlyRate, monthlySalary, userId: user.id } }
      );
    }
  },

  down: async () => {}
};
