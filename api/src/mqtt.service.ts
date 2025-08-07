import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { HexDataService } from './hex-data.service';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: mqtt.MqttClient;

  constructor(private readonly hexDataService: HexDataService) {}

  onModuleInit() {
    this.client = mqtt.connect('mqtt://localhost:1883');

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.client.subscribe('iot-data', (err) => {
        if (!err) {
          console.log('Subscribed to iot-data topic');
        }
      });
    });

    this.client.on('message', (topic, message) => {
      if (topic === 'iot-data') {
        console.log(`Received message on topic ${topic}: ${message.toString()}`);
        this.hexDataService.create(message.toString('hex'));
      }
    });
  }
}
