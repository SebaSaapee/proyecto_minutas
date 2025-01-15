import { TimeOutInterceptor } from './common/interceptors/timeout.interceptor';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cors = require('cors')
  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalInterceptors(new TimeOutInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  // Configurar CORS usando el middleware
  app.use(cors({
    origin: ['http://localhost:3001'], // Cambiar según tu dominio
    methods: ['GET', 'POST','PUT','DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));

  const options = new DocumentBuilder()
    .setTitle('Proyección API')
    .setDescription('Proyecto Minutas App')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('/api/docs', app, document, {
    swaggerOptions: {
      filter: true,
    },
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
