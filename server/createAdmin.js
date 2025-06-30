const bcrypt = require('bcryptjs');
const User = require('./models/User');

const createAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const adminExists = await User.findOne({ email: adminEmail });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = new User({
      name: 'Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin account created');
  } else {
    console.log('ℹ️ Admin account already exists');
  }
};

module.exports = createAdmin;
