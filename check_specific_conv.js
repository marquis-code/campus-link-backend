const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb+srv://campus-link:campus-link2026@campus-link.7hgtzee.mongodb.net/test?appName=campus-link');
  const db = mongoose.connection.db;
  const messages = db.collection('messages');
  
  const count = await messages.countDocuments({ conversation: new mongoose.Types.ObjectId("6a0315cc62c78c5911c45dbb") });
  console.log("Total messages for 6a0315cc62c78c5911c45dbb:", count);
  
  await mongoose.disconnect();
}

check().catch(console.error);
