import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { BigIntToStringInterceptor } from './common/interceptors/bigint-to-string.interceptor';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: [/localhost:3000$/],
        credentials: true,
    });
    app.use(cookieParser());

    app.useGlobalFilters(new PrismaExceptionFilter());

    app.useGlobalInterceptors(new BigIntToStringInterceptor());

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    app.enableShutdownHooks();

    const config = new DocumentBuilder()
        .setTitle("Church API")
        .setDescription("교회 홈페이지 API")
        .setVersion("1.0.0")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);

    const port = process.env.PORT ?? 4000;
    await app.listen(port);
    console.log(`API listening on http://localhost:${port}`);
}
bootstrap();