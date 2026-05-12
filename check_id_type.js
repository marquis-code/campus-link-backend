const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb+srv://campus-link:campus-link2026@campus-link.7hgtzee.mongodb.net/test?appName=campus-link');
  const db = mongoose.connection.db;
  const messages = db.collection('messages');
  
  const docs = await messages.find({}).limit(2).toArray();
  
  docs.forEach(doc => {
    console.log("Message _id type:", typeof doc._id, doc._id instanceof mongoose.Types.ObjectId ? 'is ObjectId' : 'is NOT ObjectId');
    console.log("Message conversation type:", typeof doc.conversation, doc.conversation instanceof mongoose.Types.ObjectId ? 'is ObjectId' : 'is NOT ObjectId');
  });
  
  await mongoose.disconnect();
}

check().catch(console.error);
