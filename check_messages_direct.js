const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb+srv://campus-link:campus-link2026@campus-link.7hgtzee.mongodb.net/test?appName=campus-link');
  // the DB name might not be "test", wait, let's just see collections.
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));
  
  const messages = db.collection('messages');
  const count = await messages.countDocuments();
  console.log("Total messages:", count);
  
  if (count > 0) {
    const docs = await messages.find({}).limit(2).toArray();
    console.log("Sample docs:", JSON.stringify(docs, null, 2));
  }
  
  await mongoose.disconnect();
}

check().catch(console.error);
