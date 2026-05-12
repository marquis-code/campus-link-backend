import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ChatService } from './src/modules/chat/chat.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConversationDocument } from './src/schemas/conversation.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const convModel = app.get('ConversationModel') as Model<ConversationDocument>;
  
  const userIdStr = "65b9e7b4e3f3b9c8d1e2f3a4"; // Example
  // Find all to get a real user ID
  const oneConv = await convModel.findOne().exec();
  if (oneConv) {
    const realUser = oneConv.participants[0].toString();
    console.log("Real User ID:", realUser);
    
    console.log("--- FIND WITH STRING ---");
    const res1 = await convModel.find({ participants: realUser }).exec();
    console.log(res1.length);
    
    console.log("--- FIND WITH OBJECTID ---");
    const res2 = await convModel.find({ participants: new Types.ObjectId(realUser) }).exec();
    console.log(res2.length);
  }
  
  await app.close();
}
bootstrap();
