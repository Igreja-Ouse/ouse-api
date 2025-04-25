import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar cookie parser
  app.use(cookieParser());
  
  // Configurar CORS com suporte a cookies
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
  });
  
  // Configurar versionamento de API 
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  
  configureSwagger(app);
  configureValidationPipe(app);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}

function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('OUSE API')
    .setDescription('API para o sistema OUSE')
    .setVersion('1.0')
    .addServer(process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`, 'API Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Informe o JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addCookieAuth(
      'access_token',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
      },
      'cookie-auth',
    )
    .addTag('Auth', 'Autenticação e autorização')
    .addTag('Users', 'Gerenciamento de usuários')
    // Adicione mais tags conforme necessário
    .setContact('Equipe OUSE', 'https://ouse.com.br', 'contato@ouse.com.br')
    .setLicense('Proprietary', 'https://ouse.com.br/license')
    .setExternalDoc('Documentação adicional', 'https://ouse.com.br/docs')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
    operationIdFactory: (
      controllerKey: string,
      methodKey: string,
    ) => methodKey,
  });
  
  // Opções avançadas do Swagger UI
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      displayRequestDuration: true,
      syntaxHighlight: {
        theme: 'monokai',
      },
    },
    customCssUrl: process.env.SWAGGER_CUSTOM_CSS,
    customJs: process.env.SWAGGER_CUSTOM_JS,
    customfavIcon: process.env.SWAGGER_CUSTOM_FAVICON,
  });
}

function configureValidationPipe(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 422, // Unprocessable Entity para erros de validação
    }),
  );
}

bootstrap();
