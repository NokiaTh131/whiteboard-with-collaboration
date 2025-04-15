import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { AuthenticatedSocketIoAdapter } from './adapters/ws.adapter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  app.useWebSocketAdapter(new AuthenticatedSocketIoAdapter(app));
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
