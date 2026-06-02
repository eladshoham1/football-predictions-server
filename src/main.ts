import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  // Configure CORS for production
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000
  await app.listen(port)
  console.log(`Server listening on ${port}`)
  console.log(`CORS enabled for: ${frontendUrl}`)
}

bootstrap()
