import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Directory where the socket file would be (current directory)
const dir = process.cwd();
// The prefix of the stale socket file to remove (adjust if needed)
const SOCKET_PREFIX = '3023';

function cleanUpSockets() {
  // Remove any file starting with SOCKET_PREFIX (handles trailing spaces)
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.startsWith(SOCKET_PREFIX)) {
      try {
        fs.unlinkSync(path.join(dir, file));
        console.log(`Removed stale socket file: ${file}`);
      } catch (error) {
        console.warn(`Failed to remove socket file ${file}:`, error);
      }
    }
  }
}

async function bootstrap() {
  // Clean up any stale sockets on startup.
  cleanUpSockets();

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: process.env.MQTT_URL || 'mqtt://localhost:1883',
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);

  // Clean up on exit/shutdown signals
  const shutdown = async () => {
    try {
      await app.close(); // Properly close nest app and microservices
      cleanUpSockets();
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  // Optional: listen for uncaughtException and unhandledRejection for extra safety
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    shutdown();
  });
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    shutdown();
  });
}

bootstrap();
