import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findAll(page: number, limit: number): Promise<{ data: HexData[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.hexDataRepository.findAndCount({
      order: {
        createdAt: 'DESC',
      },
      skip: skip,
      take: limit,
    });
    return { data, total };
  }
}
