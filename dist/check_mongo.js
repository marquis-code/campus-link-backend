"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const chat_service_1 = require("./src/modules/chat/chat.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const chatService = app.get(chat_service_1.ChatService);
    const convModel = app.get('ConversationModel');
    const convs = await convModel.find().exec();
    console.log("ALL CONVERSATIONS:", JSON.stringify(convs, null, 2));
    await app.close();
}
bootstrap();
//# sourceMappingURL=check_mongo.js.map