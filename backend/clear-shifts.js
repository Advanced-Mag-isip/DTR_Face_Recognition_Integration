require('dotenv').config();
const sequelize = require('./models');
const Shift = require('./models/Shift');

sequelize.sync().then(async () => {
    const count = await Shift.count();
    
    if (count === 0) {
        process.exit(0);
    }
    
    await Shift.destroy({ where: {} });
    
    process.exit(0);
}).catch(err => {
    console.error('Error clearing shifts:', err);
    process.exit(1);
});
