require('dotenv').config();
const connectDB = require('./db');
const Shelter = require('./models/Shelter');

async function main() {
  await connectDB();
  const result = await Shelter.updateMany(
    { version: { $exists: false } },
    { $set: { version: 0 } }
  );
  console.log(`Fixed ${result.modifiedCount} shelter(s) missing a version.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});