import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ChatService } from './src/modules/chat/chat.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationDocument, Conversation } from './src/schemas/conversation.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const chatService = app.get(ChatService);
  const convModel = app.get('ConversationModel') as Model<ConversationDocument>;
  
  const convs = await convModel.find().exec();
  console.log("ALL CONVERSATIONS:", JSON.stringify(convs, null, 2));
  
  await app.close();
}
bootstrap();
