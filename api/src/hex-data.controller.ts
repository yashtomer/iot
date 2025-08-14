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
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.hexDataService.findAll(page, limit, start, end);
  }

  @Get('status-counts')
  async getStatusCounts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.hexDataService.getStatusCounts(start, end);
  }
}
