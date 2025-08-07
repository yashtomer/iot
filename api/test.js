const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://127.0.0.1:1883');

client.on('connect', function () {
  console.log('Successfully connected to MQTT broker!');
  setInterval(function () {
    const hexData = '48656c6c6f2048657821'; // Sample hex string for "Hello Hex!"
    const buffer = Buffer.from(hexData, 'hex');
    client.publish('iot-data', buffer);
    console.log('Published hex data:', hexData);
  }, 1000);
});

client.on('error', function (error) {
  console.error('MQTT connection error:', error);
});
