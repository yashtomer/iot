import { Controller, Post, Body } from '@nestjs/common';
import { HexDataService } from './hex-data.service';

@Controller('hex-data')
export class HexDataController {
  constructor(private readonly hexDataService: HexDataService) {}

  @Post()
  create(@Body('data') data: string) {
    return this.hexDataService.create(data);
  }
}
