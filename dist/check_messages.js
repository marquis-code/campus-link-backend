"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const msgModel = app.get('MessageModel');
    const messages = await msgModel.find().exec();
    console.log("Total messages in DB:", messages.length);
    if (messages.length > 0) {
        console.log("Sample message:", JSON.stringify(messages[0], null, 2));
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=check_messages.js.map