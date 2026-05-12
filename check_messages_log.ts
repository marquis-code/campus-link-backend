import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ChatService } from './src/modules/chat/chat.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const chatService = app.get(ChatService);
  
  const msgs = await chatService.getMessages("6a0315cc62c78c5911c45dbb", null, 1, 50);
  console.log("MESSAGES FOUND BY SERVICE:", msgs.length);
  
  await app.close();
}
bootstrap();
