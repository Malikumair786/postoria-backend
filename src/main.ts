import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import 'winston-daily-rotate-file';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logFormat = winston.format.printf(
    ({ level, message, timestamp, context }) => {
      return `${timestamp} [${context}] ${level}: ${message}`;
    },
  );

  const transport = new winston.transports.DailyRotateFile({
    filename: 'logs/postoria-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '10d',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      logFormat,
    ),
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // bufferLogs: true,
    // logger: WinstonModule.createLogger({
    //   transports: [transport],
    // }),
  });

  const config = new DocumentBuilder()
    .setTitle('BinSaeed Ecommerce Store')
    .setDescription('BinSaeed Ecommerce Store API documentation')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const corsOptions: CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders:
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, Authorization, Timezone',
  };

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors(corsOptions);
  await app.listen(parseInt(process.env.PORT, 10) || 9090);
}
bootstrap();
