import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HexData } from './hex-data.entity';
import { HexDataModule } from './hex-data.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: 3306,
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [HexData],
        synchronize: false, // shouldn't be used in production
      }),
      inject: [ConfigService],
    }),
    HexDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
