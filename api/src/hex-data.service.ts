import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { HexData } from './hex-data.entity';

@Injectable()
export class HexDataService {
  constructor(
    @InjectRepository(HexData)
    private readonly hexDataRepository: Repository<HexData>,
  ) {}

  async create(information: string): Promise<HexData> {
    const hexData = new HexData();
    information = information.toUpperCase();
    hexData.data = information;

    // Parsing logic
    hexData.device_identifier = information.substring(0, 12);
    hexData.data_type = information.substring(12, 14);
    hexData.function_type = information.substring(14, 16);
    hexData.number_of_bytes = information.substring(16, 18);
    hexData['1byte_1st_sensor'] = information.substring(18, 20);
    hexData['1byte_2nd_sensor'] = information.substring(20, 22);
    hexData['1byte_3rd_sensor'] = information.substring(22, 24);
    hexData['1byte_4th_sensor'] = information.substring(24, 26);
    hexData['2byte_crc'] = information.substring(26, 30);

    try {
      const savedData = await this.hexDataRepository.save(hexData);
      console.log('HexDataService: Data saved successfully:', savedData);
      return savedData;
    } catch (error) {
      console.error('HexDataService: Error saving data:', error);
      throw error;
    }
  }

  async findAll(page: number, limit: number, startDate?: Date, endDate?: Date): Promise<{ data: HexData[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const [data, total] = await this.hexDataRepository.findAndCount({
      where,
      order: {
        createdAt: 'DESC',
      },
      skip: skip,
      take: limit,
    });
    return { data, total };
  }

  async getStatusCounts(startDate: Date, endDate: Date): Promise<any> {
    const results = await this.hexDataRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const sensorCounts = {
      sensor1: { on: 0, off: 0 },
      sensor2: { on: 0, off: 0 },
      sensor3: { on: 0, off: 0 },
      sensor4: { on: 0, off: 0 },
    };

    for (const row of results) {
      if (row['1byte_1st_sensor'] === '01') sensorCounts.sensor1.on++;
      else sensorCounts.sensor1.off++;

      if (row['1byte_2nd_sensor'] === '01') sensorCounts.sensor2.on++;
      else sensorCounts.sensor2.off++;

      if (row['1byte_3rd_sensor'] === '01') sensorCounts.sensor3.on++;
      else sensorCounts.sensor3.off++;

      if (row['1byte_4th_sensor'] === '01') sensorCounts.sensor4.on++;
      else sensorCounts.sensor4.off++;
    }

    return [
      [{ name: 'On', value: sensorCounts.sensor1.on }, { name: 'Off', value: sensorCounts.sensor1.off }],
      [{ name: 'On', value: sensorCounts.sensor2.on }, { name: 'Off', value: sensorCounts.sensor2.off }],
      [{ name: 'On', value: sensorCounts.sensor3.on }, { name: 'Off', value: sensorCounts.sensor3.off }],
      [{ name: 'On', value: sensorCounts.sensor4.on }, { name: 'Off', value: sensorCounts.sensor4.off }],
    ];
  }
}
