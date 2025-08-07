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

  async create(data: string): Promise<HexData> {
    console.log('HexDataService: Attempting to save data:', data);
    const hexData = new HexData();
    hexData.data = data;
    try {
      const savedData = await this.hexDataRepository.save(hexData);
      console.log('HexDataService: Data saved successfully:', savedData);
      return savedData;
    } catch (error) {
      console.error('HexDataService: Error saving data:', error);
      throw error;
    }
  }
}
