"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true }));
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
    await app.listen(port);
    console.log(`Server listening on ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map