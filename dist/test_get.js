"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const mongoose_1 = require("mongoose");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const convModel = app.get('ConversationModel');
    const userIdStr = "65b9e7b4e3f3b9c8d1e2f3a4";
    const oneConv = await convModel.findOne().exec();
    if (oneConv) {
        const realUser = oneConv.participants[0].toString();
        console.log("Real User ID:", realUser);
        console.log("--- FIND WITH STRING ---");
        const res1 = await convModel.find({ participants: realUser }).exec();
        console.log(res1.length);
        console.log("--- FIND WITH OBJECTID ---");
        const res2 = await convModel.find({ participants: new mongoose_1.Types.ObjectId(realUser) }).exec();
        console.log(res2.length);
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=test_get.js.map