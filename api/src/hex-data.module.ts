import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HexData } from './hex-data.entity';
import { HexDataService } from './hex-data.service';
import { HexDataController } from './hex-data.controller';
//import { MqttService } from './mqtt.service';

@Module({
  imports: [TypeOrmModule.forFeature([HexData])],
  providers: [HexDataService],
  controllers: [HexDataController],
  exports: [HexDataService], // Export HexDataService
})
export class HexDataModule {}
