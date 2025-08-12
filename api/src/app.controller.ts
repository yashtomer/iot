import { Controller } from "@nestjs/common";
import { AppService } from "./app.service";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern("aeologic_iot")
  async getNotifications(@Payload() payload: any) {
    console.log("Payload received:", payload);
    if (!payload?.information) {
      console.log("No information received");
      return;
    }
    // const buffer = Buffer.from(payload.information, 'hex');
    // const hexString = buffer.toString("hex");
    const hexString = payload.information;
    await this.appService.saveData(hexString);
    console.log("Final hex string:", hexString);
  }
}
