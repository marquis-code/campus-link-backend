"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const chat_service_1 = require("./src/modules/chat/chat.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const chatService = app.get(chat_service_1.ChatService);
    const msgs = await chatService.getMessages("6a0315cc62c78c5911c45dbb", null, 1, 50);
    console.log("MESSAGES FOUND BY SERVICE:", msgs.length);
    await app.close();
}
bootstrap();
//# sourceMappingURL=check_messages_log.js.map