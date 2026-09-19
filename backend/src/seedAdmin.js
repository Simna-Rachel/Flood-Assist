// One-off CLI script to create (or promote) an admin account.
//
// Admin is deliberately NOT self-requestable through the app (see
// User.REQUESTABLE_ROLES) — someone has to be the first admin, and this
// script is that "manual grant in the DB" the rest of the codebase's
// comments refer to.
//
// Usage:
//   cd backend
//   node src/seedAdmin.js "Admin Name" admin@example.com "a-strong-password"
//
// If a user with that email already exists, this promotes them to admin
// (and resets any pending role request) instead of creating a duplicate.

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']); // MUST be above connectDB() — same fix as index.js.
// Without this, resolving the MongoDB Atlas SRV record fails on networks
// whose default DNS can't answer _mongodb._tcp.<cluster>.mongodb.net.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const User = require('./models/User');

async function main() {
  const [, , name, email, password] = process.argv;

  if (!email || !password) {
    console.error('Usage: node src/seedAdmin.js "Admin Name" admin@example.com "password"');
    process.exit(1);
  }

  await connectDB();

  const normalizedEmail = String(email).toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail });

  if (user) {
    user.role = 'admin';
    user.requestedRole = null;
    user.roleStatus = 'approved';
    if (name) user.name = name;
    await user.save();
    console.log(`✅ Promoted existing user "${user.name}" (${user.email}) to admin.`);
  } else {
    if (!name) {
      console.error('A name is required when creating a brand-new admin account.');
      process.exit(1);
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: 'admin',
      roleStatus: 'none'
    });
    console.log(`✅ Created new admin account "${user.name}" (${user.email}).`);
  }

  console.log('You can now log in with these credentials from the normal login page.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Failed to seed admin:', err.message);
  process.exit(1);
});
