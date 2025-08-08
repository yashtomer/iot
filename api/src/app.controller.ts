import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('iot-data')
  async getNotifications(@Payload() data: number[]) {
    //console.log(data);
    const hexString = Buffer.from(data).toString('hex');
    await this.appService.saveData(hexString);
    //console.log('Data saved to hex_data table:', hexString);
  }
}
