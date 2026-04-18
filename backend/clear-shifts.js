require('dotenv').config();
const sequelize = require('./models');
const Shift = require('./models/Shift');

sequelize.sync().then(async () => {
    console.log('Connected to database...');
    
    const count = await Shift.count();
    console.log(`Current shifts in database: ${count}`);
    
    if (count === 0) {
        console.log('No shifts to clear.');
        process.exit(0);
    }
    
    await Shift.destroy({ where: {} });
    
    console.log('✓ All shifts cleared successfully!');
    console.log(`Deleted ${count} shift record(s).`);
    process.exit(0);
}).catch(err => {
    console.error('Error clearing shifts:', err);
    process.exit(1);
});
