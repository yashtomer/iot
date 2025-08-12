import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('aeologic_iot')
  async getNotifications(@Payload() payload: any) {          
    const buffer = Buffer.from(payload.data);  
    const hexString = buffer.toString('hex');    
    await this.appService.saveData(hexString);
    console.log('Final hex string:', hexString);
  }
}
