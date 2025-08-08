import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { HexDataService } from './hex-data.service';

@Controller('hex-data')
export class HexDataController {
  constructor(private readonly hexDataService: HexDataService) {}

  @Post()
  create(@Body('information') information: string) {
    return this.hexDataService.create(information);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.hexDataService.findAll(page, limit);
  }
}
