import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageDocument } from './src/schemas/message.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const msgModel = app.get('MessageModel') as Model<MessageDocument>;
  
  const messages = await msgModel.find().exec();
  console.log("Total messages in DB:", messages.length);
  if (messages.length > 0) {
    console.log("Sample message:", JSON.stringify(messages[0], null, 2));
  }
  
  await app.close();
}
bootstrap();
